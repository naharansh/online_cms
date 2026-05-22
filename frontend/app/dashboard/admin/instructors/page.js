'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { FiUsers, FiBookOpen, FiDollarSign, FiBarChart2, FiSearch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Loader from '@/components/Loader';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdminInstructors().then(res => setInstructors(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading instructors..." />;

  const filtered = search
    ? instructors.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()))
    : instructors;

  const chartData = filtered.slice(0, 10).map(i => ({
    name: i.name?.split(' ')[0],
    courses: i.course_count,
    students: i.student_count,
    revenue: i.revenue,
  }));

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Instructor Performance</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Monitor instructor metrics and performance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{instructors.length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Instructors</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{instructors.reduce((a, i) => a + (i.course_count || 0), 0)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Courses</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{instructors.reduce((a, i) => a + (i.student_count || 0), 0)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Students</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 mb-6" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Instructor Rankings</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#5B5B98' }} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} />
            <Bar dataKey="students" fill="#757FEF" radius={[0, 6, 6, 0]} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>
            <FiUsers className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
            All Instructors ({filtered.length})
          </h4>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A9A9C8' }} size={14} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search instructors..." className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none" style={{ border: '1px solid #EEF0F6', width: '200px' }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Courses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Students</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Enrollments</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Revenue</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} style={{ borderTop: '1px solid #EEF0F6' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                        {i.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium block" style={{ color: '#260944' }}>{i.name}</span>
                        <span className="text-xs" style={{ color: '#A9A9C8' }}>{i.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FiBookOpen size={14} style={{ color: '#A9A9C8' }} />
                      <span className="text-sm font-semibold" style={{ color: '#260944' }}>{i.course_count}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FiUsers size={14} style={{ color: '#A9A9C8' }} />
                      <span className="text-sm font-semibold" style={{ color: '#260944' }}>{i.student_count}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm" style={{ color: '#5B5B98' }}>{i.enrollment_count}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#00B69B' }}>${i.revenue || 0}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#A9A9C8' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
