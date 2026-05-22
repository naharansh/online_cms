'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { FiBookOpen, FiSearch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dashboardAPI.getAdminCourseReports().then(res => setCourses(res.data)).catch(() => {});
  }, []);

  const filtered = search
    ? courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
    : courses;

  const chartData = filtered.slice(0, 10).map(c => ({
    name: c.title?.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
    enrollments: c.enrollment_count,
    revenue: c.revenue,
  }));

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Course Reports</h3>
        <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Performance metrics for all courses.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{courses.length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Courses</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{courses.filter(c => c.is_published).length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Published</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{courses.reduce((a, c) => a + (c.enrollment_count || 0), 0)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Enrollments</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>${courses.reduce((a, c) => a + parseFloat(c.revenue || 0), 0).toFixed(0)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>Total Revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 mb-6" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <h4 className="text-sm font-bold heading-font mb-4" style={{ color: '#260944' }}>Enrollments by Course (Top 10)</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#A9A9C8' }} />
            <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 11, fill: '#5B5B98' }} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #EEF0F6' }} />
            <Bar dataKey="enrollments" fill="#757FEF" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF0F6' }}>
          <h4 className="text-sm font-bold heading-font" style={{ color: '#260944' }}>
            <FiBookOpen className="inline mr-2" size={16} style={{ color: '#757FEF' }} />
            All Courses ({filtered.length})
          </h4>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A9A9C8' }} size={14} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none" style={{ border: '1px solid #EEF0F6', width: '200px' }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Students</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Lessons</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Revenue</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#757FEF' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid #EEF0F6' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                        {c.title?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#260944' }}>{c.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{c.instructor_name}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: '#260944' }}>{c.enrollment_count}</span>
                    <span className="text-xs ml-1" style={{ color: '#A9A9C8' }}>({c.completions} done)</span>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5B5B98' }}>{c.lesson_count}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#00B69B' }}>${c.revenue || 0}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold" style={{
                      backgroundColor: c.is_published ? 'rgba(0, 182, 155, 0.1)' : 'rgba(238, 54, 140, 0.1)',
                      color: c.is_published ? '#00B69B' : '#EE368C'
                    }}>
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
