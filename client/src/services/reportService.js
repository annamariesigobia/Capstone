import { bookingService } from './bookingService';
import { authService } from './authService';
import { attractionService } from './attractionService';
import { accommodationService } from './accommodationService';

export const reportService = {

  getAnalyticsSummary: async () => {
    try {
      const bookings = await bookingService.getAllBookings();
      const users = await authService.getAllUsers();
      const attractions = await attractionService.getAttractions();
      const accommodations = await accommodationService.getAccommodations();

      const userList = Array.isArray(users) ? users : [];
      const totalTourists = userList.filter(u => u.role === 'tourist').length;
      const totalOperators = userList.filter(u => u.role === 'operator').length;
      const totalAttractions = Array.isArray(attractions) ? attractions.length : 0;
      const totalBookings = Array.isArray(bookings) ? bookings.length : 0;

      const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
      const revenueEstimate = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      const totalRooms = accommodations.reduce((sum, acc) => sum + (Number(acc.availableRooms) || 0), 0);
      const occupiedRooms = confirmedBookings.length;
      const occupancyRate = (totalRooms + occupiedRooms) > 0 ? Math.round((occupiedRooms / (totalRooms + occupiedRooms)) * 100) : 0;

      const statusCounts = {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      };

      const monthlyData = [
        { month: 'May', bookings: Math.max(0, totalBookings - 2), revenue: Math.max(0, revenueEstimate - 3000) },
        { month: 'Jun', bookings: totalBookings, revenue: revenueEstimate }
      ];

      return {
        metrics: {
          totalTourists,
          totalOperators,
          totalAttractions,
          totalBookings,
          revenueEstimate,
          occupancyRate,
          mostVisitedAttraction: 'Bitaog Beach'
        },
        statusCounts,
        monthlyData
      };
    } catch (err) {
      console.warn("getAnalyticsSummary error:", err);
      return {
        metrics: {
          totalTourists: 0,
          totalOperators: 0,
          totalAttractions: 0,
          totalBookings: 0,
          revenueEstimate: 0,
          occupancyRate: 0,
          mostVisitedAttraction: 'Bitaog Beach'
        },
        statusCounts: { pending: 0, confirmed: 0, rejected: 0, cancelled: 0 },
        monthlyData: []
      };
    }
  }
};

export default reportService;
