'use client';
import { useEffect, useState } from 'react';
import { userAPI, dashboardAPI } from '@/lib/api';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminStudentsPage() {
  const [users, setUsers] = useState([]);
  const [charts, setCharts] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    userAPI.getAll().then(res => setUsers(res.data)).catch(() => {});
    dashboardAPI.getAdminCharts().then(res => setCharts(res.data)).catch(() => {});
  }, []);

  const students = users.filter(u => u.role === 'student');
  const filtered = search
    ? students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
    : students;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Student Management</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>View and manage all students.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{students.length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{charts?.total_enrollments || 0}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Enrollments</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{charts?.total_users || 0}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Users</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Enrollment Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.monthlyEnrollments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} />
              <Bar dataKey="count" fill="#757FEF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>User Growth</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={(charts?.monthlyEnrollments || []).map((e, i) => ({ ...e, cumulative: (charts?.monthlyEnrollments || []).slice(0, i + 1).reduce((a, b) => a + b.count, 0) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A9A9C8' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} />
              <Line type="monotone" dataKey="cumulative" stroke="#00B69B" strokeWidth={2} dot={{ fill: '#00B69B', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>
            <FiUsers className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
            All Students ({filtered.length})
          </h4>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A9A9C8' }} size={14} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none" style={{ border: '1px solid #EEF0F6', width: '200px' }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid #EEF0F6' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#260944' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold" style={{
                      backgroundColor: u.is_active ? 'rgba(0, 182, 155, 0.1)' : 'rgba(238, 54, 140, 0.1)',
                      color: u.is_active ? '#00B69B' : '#EE368C'
                    }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#A9A9C8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
