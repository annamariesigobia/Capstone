import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Printer, Shield, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await reportService.getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
        <span>Aggregating analytics data...</span>
      </div>
    );
  }

  const { metrics, statusCounts, monthlyData } = data;

const lineChartData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Revenue Growth (₱)',
        data: monthlyData.map(m => m.revenue),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

const pieChartData = {
    labels: ['Pending', 'Confirmed', 'Rejected', 'Cancelled'],
    datasets: [
      {
        data: [
          statusCounts.pending ?? 0,
          statusCounts.confirmed ?? 0,
          statusCounts.rejected ?? 0,
          statusCounts.cancelled ?? 0
        ],
        backgroundColor: [
          '#f59e0b', 
          '#10b981', 
          '#ef4444', 
          '#64748b'  
        ],
        borderWidth: 1
      }
    ]
  };

const barChartData = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Booking Submissions count',
        data: monthlyData.map(m => m.bookings),
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {}
      <div className="border-b border-slate-100 pb-5 mb-8 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3 text-left">
          <Link to="/dashboard" className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-1.5">
              <BarChart2 className="h-5.5 w-5.5 text-teal-650" />
              <span>Platform Reports & Analytics</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Dynamic visual metrics mapping reservations, tourists, and utilization indices.</p>
          </div>
        </div>
<button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <Printer className="h-4.5 w-4.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>
{/* Print-Only Banner */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8 text-left">
        <h1 className="text-2xl font-black text-slate-950">Dinagat Islands</h1>
        <p className="text-xs text-slate-500 mt-1 font-bold">Platform Analytics & Administrative Operations Report</p>
        <div className="text-[10px] text-slate-400 mt-2">Generated At: {new Date().toLocaleString()}</div>
      </div>

{/* Core metrics sumary cards */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print-card">

                <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20 text-left">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Net Revenue</span>
          <span className="text-lg font-black text-teal-600">₱{metrics.revenueEstimate}</span>
        </div>
        <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20 text-left">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Accommodation Utilization</span>
          <span className="text-lg font-black text-slate-800">{metrics.occupancyRate}%</span>
        </div>
        <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20 text-left">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Registrants</span>
          <span className="text-lg font-black text-slate-800">{metrics.totalTourists} tourists</span>
        </div>
        <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20 text-left">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Top Rated Attraction</span>
          <span className="text-xs font-black text-slate-800 truncate block mt-1">{metrics.mostVisitedAttraction}</span>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Revenue Trajectory Timeline</h3>
          <div className="h-64">
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Status Distribution Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-12 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Reservation Crossings Volumes</h3>
          <div className="h-64">
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
