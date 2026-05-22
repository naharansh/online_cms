'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI, courseAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiBookOpen, FiUsers, FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronRight, FiTrendingUp, FiClipboard, FiGrid } from 'react-icons/fi';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getInstructor().then(res => setStats(res.data)).catch(() => {}),
      courseAPI.getInstructorCourses().then(res => setCourses(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await courseAPI.delete(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success('Course deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      const formData = new FormData();
      formData.append('is_published', !course.is_published);
      await courseAPI.update(course.id, formData);
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
      toast.success(course.is_published ? 'Course unpublished' : 'Course published');
    } catch (err) {
      toast.error('Failed to update course');
    }
  };

  const statsCards = [
    { label: 'My Courses', value: stats?.total_courses || 0, icon: FiBookOpen, color: '#757FEF', bg: 'rgba(117, 127, 239, 0.1)' },
    { label: 'Total Students', value: stats?.total_students || 0, icon: FiUsers, color: '#00B69B', bg: 'rgba(0, 182, 155, 0.1)' },
    { label: 'Published', value: courses.filter(c => c.is_published).length, icon: FiTrendingUp, color: '#2DB6F5', bg: 'rgba(45, 182, 245, 0.1)' },
    { label: 'Drafts', value: courses.filter(c => !c.is_published).length, icon: FiClipboard, color: '#FFBC2B', bg: 'rgba(255, 188, 43, 0.15)' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Instructor Dashboard</h3>
            <p className="text-sm mt-1" style={{ color: '#A9A9C8' }}>Welcome back, {user?.name}!</p>
          </div>
          <Link
            href="/courses/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold no-underline transition hover:opacity-90"
            style={{ backgroundColor: '#757FEF' }}
          >
            <FiPlus size={16} /> Create New Course
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-5 transition hover:-translate-y-0.5" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold heading-font" style={{ color: '#260944' }}>{card.value}</p>
              <p className="text-xs mt-1" style={{ color: '#A9A9C8' }}>{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EEF0F6' }}>
              <h4 className="text-base font-bold heading-font" style={{ color: '#260944' }}>
                <FiBookOpen className="inline mr-2" style={{ color: '#757FEF' }} size={16} />
                My Courses
              </h4>
              <Link href="/courses/create" className="text-sm font-semibold no-underline transition hover:opacity-80" style={{ color: '#757FEF' }}>
                + New
              </Link>
            </div>
            <div className="p-5">
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="group flex items-center justify-between p-4 rounded-xl transition" style={{ backgroundColor: '#F5F7FA', border: '1px solid transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#757FEF'; e.currentTarget.style.backgroundColor = 'rgba(117, 127, 239, 0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = '#F5F7FA'; }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                          {course.title?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate" style={{ color: '#260944' }}>{course.title}</h4>
                          <p className="text-xs mt-0.5" style={{ color: '#A9A9C8' }}>
                            {course.student_count || 0} students · {course.module_count || 0} modules
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handlePublishToggle(course)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          style={{
                            backgroundColor: course.is_published ? 'rgba(0, 182, 155, 0.1)' : 'rgba(169, 169, 200, 0.15)',
                            color: course.is_published ? '#00B69B' : '#A9A9C8'
                          }}
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={`/courses/${course.id}/edit`} className="p-2 rounded-lg transition" style={{ color: '#A9A9C8' }} title="Edit">
                            <FiEdit2 size={14} />
                          </Link>
                          <Link href={`/courses/${course.id}`} className="p-2 rounded-lg transition" style={{ color: '#A9A9C8' }} title="View">
                            <FiEye size={14} />
                          </Link>
                          <button onClick={() => handleDelete(course.id, course.title)} className="p-2 rounded-lg transition" style={{ color: '#A9A9C8' }} title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)' }}>
                    <FiBookOpen size={24} style={{ color: '#757FEF' }} />
                  </div>
                  <p className="text-sm mb-4" style={{ color: '#A9A9C8' }}>No courses yet. Create your first course!</p>
                  <Link href="/courses/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold no-underline transition hover:opacity-90" style={{ backgroundColor: '#757FEF' }}>
                    <FiPlus size={16} /> Create Your First Course
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              <h4 className="text-base font-bold heading-font mb-4" style={{ color: '#260944' }}>
                <FiGrid className="inline mr-2" style={{ color: '#757FEF' }} size={16} />
                Quick Links
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Create Course', href: '/courses/create', icon: FiPlus, color: '#757FEF', bg: 'rgba(117, 127, 239, 0.1)' },
                  { label: 'Student Performance', href: '/dashboard/instructor/performance', icon: FiBarChart2, color: '#00B69B', bg: 'rgba(0, 182, 155, 0.1)' },
                  { label: 'Browse Courses', href: '/courses', icon: FiBookOpen, color: '#2DB6F5', bg: 'rgba(45, 182, 245, 0.1)' },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center justify-between px-3 py-2.5 rounded-xl no-underline transition hover:bg-gray-50 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: link.bg }}>
                        <link.icon size={15} style={{ color: link.color }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#5B5B98' }}>{link.label}</span>
                    </div>
                    <FiChevronRight size={15} style={{ color: '#A9A9C8' }} className="group-hover:translate-x-0.5 transition" />
                  </Link>
                ))}
              </div>
            </div>

            {stats?.recent_enrollments?.length > 0 && (
              <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
                <h4 className="text-base font-bold heading-font mb-4" style={{ color: '#260944' }}>
                  <FiUsers className="inline mr-2" style={{ color: '#757FEF' }} size={16} />
                  Recent Enrollments
                </h4>
                <div className="space-y-3">
                  {stats.recent_enrollments.slice(0, 5).map((e, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                        {e.student_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#260944' }}>{e.student_name}</p>
                        <p className="text-xs truncate" style={{ color: '#A9A9C8' }}>{e.course_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
