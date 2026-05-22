'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export default function AdminRevenuePage() {
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    dashboardAPI.getAdminCharts().then(res => setCharts(res.data)).catch(() => {});
  }, []);

  const totalRevenue = charts?.total_revenue || 0;
  const avgMonthlyRevenue = charts?.monthlyRevenue?.length
    ? Math.round(totalRevenue / charts.monthlyRevenue.length)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Revenue Analytics</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Track your platform's financial performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>${totalRevenue}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>${avgMonthlyRevenue}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Avg Monthly</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{charts?.total_enrollments || 0}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Paid Enrollments</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>${totalRevenue > 0 && charts?.total_enrollments > 0 ? Math.round(totalRevenue / charts.total_enrollments) : 0}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Avg Per Enrollment</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Revenue Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} formatter={(value) => [`$${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="total" stroke="#757FEF" fill="rgba(117, 127, 239, 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Monthly Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="total" fill="#00B69B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>
            <FiDollarSign className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
            Recent Transactions
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {charts?.recentPayments?.map((p, i) => (
                <tr key={i} style={{ borderTop: '1px solid #EEF0F6' }}>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: '#260944' }}>{p.student_name}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{p.course_title}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#00B69B' }}>${p.amount}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)', color: '#757FEF' }}>
                      {p.payment_method}
                    </span>
                  </td>
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
