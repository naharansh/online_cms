'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { courseAPI, enrollmentAPI } from '@/lib/api';
import { FiUsers, FiBookOpen, FiBarChart2, FiTrendingUp, FiChevronRight, FiSearch, FiDownload } from 'react-icons/fi';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

export default function StudentPerformancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user && user.role === 'student') { router.push('/dashboard'); return; }
    courseAPI.getInstructorCourses().then(res => setCourses(res.data)).catch(() => {});
  }, [user, router]);

  useEffect(() => {
    if (!selectedCourseId) { setStudents([]); return; }
    setLoading(true);
    enrollmentAPI.getCourseStudents(selectedCourseId)
      .then(res => setStudents(res.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  const filteredStudents = search
    ? students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
    : students;

  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => {
        const pct = s.total_lessons > 0 ? (s.completed_lessons / s.total_lessons) * 100 : 0;
        return sum + pct;
      }, 0) / students.length)
    : 0;

  const avgAssignmentScore = students.length > 0
    ? Math.round(students.filter(s => s.latest_assignment_score !== null).reduce((sum, s) => sum + s.latest_assignment_score, 0) / Math.max(1, students.filter(s => s.latest_assignment_score !== null).length))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Performance</h1>
            <p className="text-gray-500 mt-1">Track and manage your students' progress</p>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white shadow-sm"
          >
            <option value="">Choose a course...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.student_count || 0} students)
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-indigo-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                <p className="text-sm text-gray-500">Total Students</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiBookOpen className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{students.filter(s => s.is_completed).length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiBarChart2 className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
                <p className="text-sm text-gray-500">Avg Progress</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-purple-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{avgAssignmentScore}%</p>
                <p className="text-sm text-gray-500">Avg Assignment Score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h2>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64"
                  />
                </div>
              </div>

              {loading ? (
                <Loader text="Loading students..." />
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((s) => {
                        const progressPct = s.total_lessons > 0 ? Math.round((s.completed_lessons / s.total_lessons) * 100) : 0;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {s.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                  <p className="text-xs text-gray-400">{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(s.enrolled_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full transition-all ${
                                    progressPct >= 80 ? 'bg-green-500' : progressPct >= 40 ? 'bg-indigo-500' : 'bg-yellow-500'
                                  }`} style={{ width: `${progressPct}%` }} />
                                </div>
                                <span className="text-sm text-gray-600 w-10">{progressPct}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {s.latest_assignment_score !== null ? (
                                <span className={`text-sm font-medium ${
                                  s.latest_assignment_score >= 80 ? 'text-green-600' : s.latest_assignment_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {s.latest_assignment_score}%
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {s.latest_quiz_score !== null ? (
                                <span className={`text-sm font-medium ${
                                  s.latest_quiz_score >= 80 ? 'text-green-600' : s.latest_quiz_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {s.latest_quiz_score}%
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {s.is_completed ? (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">In Progress</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FiUsers className="mx-auto text-gray-300" size={40} />
                  <p className="text-gray-500 mt-3">No students enrolled in this course yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedCourseId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <FiBarChart2 className="mx-auto text-gray-300" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mt-4">Select a Course</h3>
            <p className="text-gray-500 mt-2">Choose a course above to view student performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
