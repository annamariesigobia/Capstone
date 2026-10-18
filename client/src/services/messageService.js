/**
 * messageService.js
 * Private messaging between tourists and tour agencies.
 * Stored in localStorage in mock mode, Firestore in live mode.
 */

import { db, isMockMode } from './firebase';
import {
  collection, addDoc, getDocs, query, where,
  orderBy, serverTimestamp, updateDoc, doc, onSnapshot
} from 'firebase/firestore';

const MESSAGES_KEY = 'dinagat_private_messages';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getAllMessages = () => {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveMessages = (list) => {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('messageService: localStorage save failed', e);
  }
};

/** Canonical conversation ID between two UIDs */
const convId = (uid1, uid2) => [uid1, uid2].sort().join('__');

// ── Service ───────────────────────────────────────────────────────────────────

export const messageService = {

  /**
   * Helper to get real display name for a user UID
   */
  getUserDisplayName: (uid, fallbackName = '') => {
    try {
      const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
      const found = Object.values(allUsers).find(u => u.uid === uid || (uid && uid.includes('operator') && u.role === 'operator'));
      if (found) {
        return found.agencyName || found.fullName || found.email || fallbackName;
      }
    } catch {}
    return fallbackName;
  },

  /**
   * Send a message from senderUid to receiverUid.
   */
  sendMessage: async ({ senderUid, senderName, receiverUid, receiverName, text }) => {
    const normSender = senderUid?.includes('operator') ? 'mock-operator-uid' : senderUid;
    const normReceiver = receiverUid?.includes('operator') ? 'mock-operator-uid' : receiverUid;

    const realSenderName = messageService.getUserDisplayName(normSender, senderName) || 'User';
    const realReceiverName = messageService.getUserDisplayName(normReceiver, receiverName) || 'User';

    const msg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      conversationId: convId(normSender, normReceiver),
      senderUid: normSender,
      senderName: realSenderName,
      receiverUid: normReceiver,
      receiverName: realReceiverName,
      text: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (isMockMode) {
      const list = getAllMessages();
      list.push(msg);
      saveMessages(list);
      window.dispatchEvent(new CustomEvent('dinagat_new_message', { detail: msg }));
      return msg;
    } else {
      try {
        const ref = await addDoc(collection(db, 'messages'), {
          ...msg,
          createdAt: serverTimestamp(),
        });
        return { ...msg, id: ref.id };
      } catch (err) {
        console.warn('Firestore sendMessage failed, using local fallback:', err);
        const list = getAllMessages();
        list.push(msg);
        saveMessages(list);
        return msg;
      }
    }
  },

  /**
   * Get all messages in a conversation between two users.
   */
  getConversation: async (uid1, uid2, myRole = '') => {
    if (isMockMode) {
      const list = getAllMessages();
      const isOp1 = uid1?.includes('operator') || myRole === 'operator';
      const isOp2 = uid2?.includes('operator');
      const operatorUid = isOp1 ? uid1 : isOp2 ? uid2 : 'mock-operator-uid';
      const targetOtherUid = isOp1 ? uid2 : uid1;

      return list
        .filter(m => {
          const isOpMsg =
            m.senderUid === operatorUid ||
            m.receiverUid === operatorUid ||
            m.senderUid?.includes('operator') ||
            m.receiverUid?.includes('operator');

          const isOtherMsg =
            m.senderUid === targetOtherUid ||
            m.receiverUid === targetOtherUid ||
            (targetOtherUid?.includes('tourist') && (m.senderUid?.includes('tourist') || m.receiverUid?.includes('tourist'))) ||
            (!isOp1 && (m.senderUid === uid1 || m.receiverUid === uid1));

          return isOpMsg && isOtherMsg;
        })
        .map(m => ({
          ...m,
          senderName: messageService.getUserDisplayName(m.senderUid, m.senderName),
          receiverName: messageService.getUserDisplayName(m.receiverUid, m.receiverName)
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      const norm1 = uid1?.includes('operator') ? 'mock-operator-uid' : uid1;
      const norm2 = uid2?.includes('operator') ? 'mock-operator-uid' : uid2;
      const cid = convId(norm1, norm2);
      try {
        const q = query(
          collection(db, 'messages'),
          where('conversationId', '==', cid),
          orderBy('createdAt', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn('Firestore getConversation failed:', err);
        const list = getAllMessages();
        return list.filter(m => m.conversationId === cid)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    }
  },

  /**
   * Get all unique conversations for a user.
   */
  getInbox: async (uid, userRole = '') => {
    const isOp = userRole === 'operator' || (uid && uid.includes('operator'));
    const normMyUid = isOp ? 'mock-operator-uid' : uid;
    const list = getAllMessages();

    // Filter messages involving current user or operator role
    const mine = list.filter(m => {
      if (m.senderUid === normMyUid || m.receiverUid === normMyUid) return true;
      if (m.senderUid === uid || m.receiverUid === uid) return true;
      if (isOp && (m.receiverUid.includes('operator') || m.senderUid.includes('operator'))) return true;
      return false;
    });

    // Group by other user UID
    const convMap = {};
    for (const msg of mine) {
      const amISender = msg.senderUid === normMyUid || msg.senderUid === uid || (isOp && msg.senderUid.includes('operator'));
      const otherUid = amISender ? msg.receiverUid : msg.senderUid;
      const resolvedName = messageService.getUserDisplayName(otherUid, amISender ? msg.receiverName : msg.senderName);
      const key = otherUid;

      if (!convMap[key] || new Date(msg.createdAt) > new Date(convMap[key].lastMsg.createdAt)) {
        convMap[key] = {
          conversationId: msg.conversationId,
          otherUid,
          otherName: resolvedName || (isOp ? 'Tourist' : 'Tour Agency'),
          lastMsg: msg,
          unread: 0,
        };
      }
    }

    // Count unread per conversation thread
    for (const msg of mine) {
      const amISender = msg.senderUid === normMyUid || msg.senderUid === uid || (isOp && msg.senderUid.includes('operator'));
      const otherUid = amISender ? msg.receiverUid : msg.senderUid;
      if (!amISender && !msg.isRead && convMap[otherUid]) {
        convMap[otherUid].unread++;
      }
    }

    return Object.values(convMap).sort(
      (a, b) => new Date(b.lastMsg.createdAt) - new Date(a.lastMsg.createdAt)
    );
  },

  /**
   * Mark all messages in a conversation as read.
   */
  markConversationRead: async (uid1, uid2, myUid, userRole = '') => {
    const isOp = userRole === 'operator' || (myUid && myUid.includes('operator'));
    const normMyUid = isOp ? 'mock-operator-uid' : myUid;
    const normOtherUid = (uid1 === myUid || uid1 === normMyUid) ? uid2 : uid1;
    const normOther = normOtherUid?.includes('operator') ? 'mock-operator-uid' : normOtherUid;

    if (isMockMode) {
      const list = getAllMessages();
      let changed = false;
      for (const msg of list) {
        const isForMe = msg.receiverUid === normMyUid || msg.receiverUid === myUid || (isOp && msg.receiverUid.includes('operator'));
        const isFromOther = msg.senderUid === normOther || msg.senderUid === normOtherUid || (normOther.includes('operator') && msg.senderUid.includes('operator'));
        if (isForMe && isFromOther && !msg.isRead) {
          msg.isRead = true;
          changed = true;
        }
      }
      if (changed) {
        saveMessages(list);
        window.dispatchEvent(new CustomEvent('dinagat_new_message'));
      }
    }
  },

  /** Count total unread messages for a user */
  getUnreadCount: (uid, userRole = '') => {
    const isOp = userRole === 'operator' || (uid && uid.includes('operator'));
    const normUid = isOp ? 'mock-operator-uid' : uid;
    const list = getAllMessages();

    return list.filter(m => {
      if (m.isRead) return false;
      const amISender = m.senderUid === normUid || m.senderUid === uid || (isOp && m.senderUid.includes('operator'));
      if (amISender) return false;
      if (m.receiverUid === normUid || m.receiverUid === uid) return true;
      if (isOp && m.receiverUid.includes('operator')) return true;
      return false;
    }).length;
  },

  /** Get all users that can be contacted */
  getContactableUsers: (myRole) => {
    try {
      const allUsers = JSON.parse(localStorage.getItem('dinagat_mock_users') || '{}');
      const targetRole = myRole === 'tourist' ? 'operator' : 'tourist';
      let list = Object.values(allUsers)
        .filter(u => u.role === targetRole && u.status === 'active')
        .map(u => ({
          uid: u.uid,
          fullName: u.agencyName || u.fullName || u.email,
          email: u.email,
          profileImage: u.profileImage,
          role: u.role
        }));

      if (list.length === 0) {
        if (targetRole === 'operator') {
          list = [{
            uid: 'mock-operator-uid',
            fullName: 'Isla Tour Agency',
            email: 'operator@dinagat.com',
            role: 'operator',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
          }];
        } else {
          list = [{
            uid: 'mock-tourist-uid',
            fullName: 'Jane Doe (Tourist)',
            email: 'tourist@dinagat.com',
            role: 'tourist',
            profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
          }];
        }
      }
      return list;
    } catch {
      return [];
    }
  },

  /** Pre-start a conversation */
  startConversation: (otherUid, otherName) => {
    const normOther = otherUid?.includes('operator') ? 'mock-operator-uid' : otherUid;
    const realName = messageService.getUserDisplayName(normOther, otherName) || 'Tour Agency';
    sessionStorage.setItem('dinagat_open_conv', JSON.stringify({ otherUid: normOther, otherName: realName }));
  },

  /** Seed a demo message for initial testing */
  seedDemoMessages: () => {
    try {
      const existing = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
      if (existing.length > 0) return;
      const demoMsgs = [
        {
          id: 'msg-demo-1',
          conversationId: 'mock-operator-uid__mock-tourist-uid',
          senderUid: 'mock-operator-uid',
          senderName: 'Isla Tour Agency',
          receiverUid: 'mock-tourist-uid',
          receiverName: 'Jane Doe (Tourist)',
          text: 'Hello! Welcome to Dinagat Islands. How can I assist you with your trip? 🌴',
          isRead: true,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-demo-2',
          conversationId: 'mock-operator-uid__mock-tourist-uid',
          senderUid: 'mock-operator-uid',
          senderName: 'Isla Tour Agency',
          receiverUid: 'mock-tourist-uid',
          receiverName: 'Jane Doe (Tourist)',
          text: 'We have availability for this weekend! Feel free to ask about packages or pricing.',
          isRead: true,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];
      saveMessages(demoMsgs);
    } catch (e) {}
  },
};

// Seed demo messages on load
messageService.seedDemoMessages();

export default messageService;
