import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats } from '../types';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  AlertTriangle 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span>{error || 'Unable to load real-time statistics.'}</span>
      </div>
    );
  }

  // Format status distribution for pie chart
  const statusPieData = Object.entries(stats.appointmentStatusDistribution || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  const metrics = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Active Doctors', value: stats.totalDoctors, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Completed Sessions', value: stats.completedAppointments, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Cancelled Appointments', value: stats.cancelledAppointments, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Pending Invoices', value: stats.pendingPayments, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clinic Overview</h1>
          <p className="text-slate-500 text-sm">Real-time clinical operations and appointment flow analysis</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">
            Today's Revenue: ${stats.todayRevenue?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{m.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Appointment Status Breakdown</h2>
          <div className="h-64 flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {statusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No appointment records found yet.</p>
            )}
          </div>
        </div>

        {/* Operational Overview Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Operational Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Patients', count: stats.totalPatients },
                  { name: 'Doctors', count: stats.totalDoctors },
                  { name: 'Today', count: stats.todayAppointments },
                  { name: 'Upcoming', count: stats.upcomingAppointments },
                  { name: 'Completed', count: stats.completedAppointments },
                  { name: 'Cancelled', count: stats.cancelledAppointments },
                ]}
              >
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
