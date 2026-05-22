'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import Link from 'next/link';
import { FiUsers, FiBookOpen, FiTrendingUp, FiDollarSign, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Loader from '@/components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getAdmin(),
      dashboardAPI.getAdminCharts(),
    ]).then(([statsRes, chartsRes]) => {
      setStats(statsRes.data);
      setCharts(chartsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Users', value: charts?.total_users || 0, icon: FiUsers, color: '#757FEF', bg: 'rgba(117, 127, 239, 0.1)', href: '/dashboard/admin/students' },
    { label: 'Students', value: charts?.total_students || 0, icon: FiTrendingUp, color: '#00B69B', bg: 'rgba(0, 182, 155, 0.1)', href: '/dashboard/admin/students' },
    { label: 'Instructors', value: charts?.total_instructors || 0, icon: FiUsers, color: '#2DB6F5', bg: 'rgba(45, 182, 245, 0.1)', href: '/dashboard/admin/instructors' },
    { label: 'Courses', value: charts?.total_courses || 0, icon: FiBookOpen, color: '#FFBC2B', bg: 'rgba(255, 188, 43, 0.15)', href: '/dashboard/admin/courses' },
    { label: 'Enrollments', value: charts?.total_enrollments || 0, icon: FiTrendingUp, color: '#EE368C', bg: 'rgba(238, 54, 140, 0.1)', href: '/dashboard/admin/courses' },
    { label: 'Revenue', value: `$${charts?.total_revenue || 0}`, icon: FiDollarSign, color: '#757FEF', bg: 'rgba(117, 127, 239, 0.1)', href: '/dashboard/admin/revenue' },
  ];

  const courseColors = ['#757FEF', '#00B69B', '#2DB6F5', '#FFBC2B', '#EE368C', '#8676ff'];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Admin Dashboard</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Welcome to your admin panel. Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="no-underline">
            <div className="bg-white rounded-xl p-4 transition-all hover:-translate-y-0.5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-xl font-bold heading-font" style={{ color: '#260944' }}>{card.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Monthly Enrollments</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts?.monthlyEnrollments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6', fontSize: '13px' }}
              />
              <Bar dataKey="count" fill="#757FEF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Monthly Revenue</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6', fontSize: '13px' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="total" stroke="#00B69B" strokeWidth={2} dot={{ fill: '#00B69B', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Course Categories</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts?.courseCategories || []}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(charts?.courseCategories || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={courseColors[index % courseColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EEF0F6' }}>
            <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>Popular Courses</h4>
          </div>
          <div className="p-5">
            {stats?.popular_courses?.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-sm" style={{ borderBottom: i < stats.popular_courses.length - 1 ? '1px solid #EEF0F6' : 'none' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ backgroundColor: courseColors[i % courseColors.length] + '20', color: courseColors[i % courseColors.length] }}>
                    {i + 1}
                  </span>
                  <span className="truncate" style={{ color: '#260944' }}>{c.title}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded shrink-0" style={{ backgroundColor: 'rgba(0, 182, 155, 0.1)', color: '#00B69B' }}>
                  {c.enrollment_count} enrolled
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>Recent Payments</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {charts?.recentPayments?.map((p, i) => (
                <tr key={i} style={{ borderTop: '1px solid #EEF0F6' }}>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{p.student_name}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{p.course_title}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#00B69B' }}>${p.amount}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#A9A9C8' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
