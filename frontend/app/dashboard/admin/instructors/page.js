'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { FiUsers, FiBookOpen, FiDollarSign, FiBarChart2, FiSearch, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddInstructorModal from '@/components/AddInstructorModal';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchInstructors = () => {
    dashboardAPI.getAdminInstructors().then(res => setInstructors(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const filtered = search
    ? instructors.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()))
    : instructors;

  const chartData = filtered.slice(0, 10).map(i => ({
    name: i.name?.split(' ')[0],
    courses: i.course_count,
    students: i.student_count,
    revenue: i.revenue,
  }));

  const statCards = [
    { label: 'Total Instructors', value: instructors.length, icon: FiUsers, color: '#757FEF', bg: 'rgba(117, 127, 239, 0.1)' },
    { label: 'Total Courses', value: instructors.reduce((a, i) => a + (i.course_count || 0), 0), icon: FiBookOpen, color: '#00B69B', bg: 'rgba(0, 182, 155, 0.1)' },
    { label: 'Total Students', value: instructors.reduce((a, i) => a + (i.student_count || 0), 0), icon: FiTrendingUp, color: '#2DB6F5', bg: 'rgba(45, 182, 245, 0.1)' },
  ];

  if (loading) return (
    <div>
      <div className="mb-6">
        <div className="h-7 w-56 rounded-lg" style={{ backgroundColor: '#EEF0F6' }} />
        <div className="h-4 w-40 rounded-lg mt-2" style={{ backgroundColor: '#EEF0F6' }} />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse" style={{ border: '1px solid #EEF0F6' }}>
            <div className="w-9 h-9 rounded-lg mb-3" style={{ backgroundColor: '#EEF0F6' }} />
            <div className="h-7 w-16 rounded-lg mb-1" style={{ backgroundColor: '#EEF0F6' }} />
            <div className="h-3 w-24 rounded-lg" style={{ backgroundColor: '#EEF0F6' }} />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 mb-6 animate-pulse" style={{ border: '1px solid #EEF0F6' }}>
        <div className="h-4 w-40 rounded-lg mb-4" style={{ backgroundColor: '#EEF0F6' }} />
        <div className="h-72 rounded-lg" style={{ backgroundColor: '#EEF0F6' }} />
      </div>
      <div className="bg-white rounded-xl animate-pulse" style={{ border: '1px solid #EEF0F6' }}>
        <div className="h-12 rounded-t-xl" style={{ backgroundColor: '#F5F7FA' }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-14" style={{ borderTop: '1px solid #EEF0F6', backgroundColor: '#FAFBFC' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Instructor Performance</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Monitor instructor metrics and performance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{card.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 mb-6 transition-all hover:shadow-md" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>
          <FiBarChart2 className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
          Instructor Rankings
        </h4>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#A9A9C8' }} axisLine={{ stroke: '#EEF0F6' }} tickLine={false} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#5B5B98' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                cursor={{ fill: 'rgba(117, 127, 239, 0.05)' }}
              />
              <Bar dataKey="students" fill="#757FEF" radius={[0, 6, 6, 0]} name="Students" />
              <Bar dataKey="courses" fill="#00B69B" radius={[0, 6, 6, 0]} name="Courses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FiBarChart2 size={40} style={{ color: '#D1D5DB' }} />
            <p className="text-sm mt-3" style={{ color: '#A9A9C8' }}>No instructor data to display</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl transition-all hover:shadow-md" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>
            <FiUsers className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
            All Instructors ({filtered.length})
          </h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A9A9C8' }} size={14} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search instructors..."
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all focus:ring-2"
                style={{ border: '1px solid #EEF0F6', width: '200px', '--tw-ring-color': '#757FEF' }}
              />
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: '#757FEF' }}>
              <FiPlus size={14} /> Add Instructor
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F5F7FA' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Instructor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Courses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Students</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Enrollments</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Revenue</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#757FEF' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="transition-all hover:bg-gray-50 hover:shadow-sm" style={{ borderTop: '1px solid #EEF0F6', cursor: 'default' }}>
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
                      <span className="text-sm px-2.5 py-1 rounded-md font-medium" style={{ color: '#5B5B98', backgroundColor: 'rgba(91, 91, 152, 0.06)' }}>{i.enrollment_count}</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#00B69B' }}>${i.revenue || 0}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#A9A9C8' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FiUsers size={40} style={{ color: '#D1D5DB' }} />
              <p className="text-sm font-medium mt-3" style={{ color: '#A9A9C8' }}>
                {search ? `No instructors matching "${search}"` : 'No instructors yet'}
              </p>
              {!search && (
                <button onClick={() => setShowAddModal(true)} className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: '#757FEF' }}>
                  <FiPlus size={14} /> Add Your First Instructor
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {showAddModal && <AddInstructorModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchInstructors(); }} />}
    </div>
  );
}
