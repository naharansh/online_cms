'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, enrollmentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiEdit2, FiClock, FiUsers, FiBookOpen, FiBarChart2, FiPlayCircle, FiCheckCircle, FiAward, FiMonitor } from 'react-icons/fi';
import Loader from '@/components/Loader';
import CourseImage from '@/components/CourseImage';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getById(id).then(res => setCourse(res.data)).catch(() => router.push('/courses'));
    if (user) {
      enrollmentAPI.check(id).then(res => setEnrolled(res.data.enrolled)).catch(() => {});
    }
    setLoading(false);
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      await enrollmentAPI.enroll({ course_id: parseInt(id) });
      toast.success('Enrolled successfully!');
      setEnrolled(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading || !course) return (
<Loader text="Loading course..." />
  );

  const isOwner = user && (user.id === course.instructor_id || user.role === 'admin');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="no-underline" style={{ color: '#A9A9C8' }}>Home</Link>
          <span style={{ color: '#A9A9C8' }}>/</span>
          <Link href="/courses" className="no-underline" style={{ color: '#A9A9C8' }}>Courses</Link>
          <span style={{ color: '#A9A9C8' }}>/</span>
          <span className="font-semibold" style={{ color: '#260944' }}>{course.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl overflow-hidden mb-6" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
                <CourseImage course={course} className="w-full h-full object-cover object-top" />
                {course.price === 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(0, 182, 155, 0.15)', color: '#00B69B' }}>
                    Free
                  </span>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2 heading-font" style={{ color: '#260944' }}>{course.title}</h1>
                <p className="text-sm mb-4" style={{ color: '#A9A9C8' }}>
                  Created by <span className="font-semibold" style={{ color: '#757FEF' }}>{course.instructor_name}</span>
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)', color: '#757FEF' }}>
                    {course.difficulty_level}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'rgba(0, 182, 155, 0.1)', color: '#00B69B' }}>
                    {course.language}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'rgba(255, 188, 43, 0.15)', color: '#B8860B' }}>
                    {course.module_count || 0} modules
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#5B5B98' }}>{course.description}</p>

                <h4 className="text-lg font-bold mb-4 heading-font" style={{ color: '#260944' }}>
                  <FiBookOpen className="inline mr-2" style={{ color: '#757FEF' }} />
                  Course Content
                </h4>
                <div className="space-y-3">
                  {course.modules?.map((mod, idx) => (
                    <div key={mod.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid #EEF0F6' }}>
                      <div className="px-5 py-3.5 flex items-center justify-between" style={{ backgroundColor: '#F5F7FA' }}>
                        <span className="font-semibold text-sm" style={{ color: '#260944' }}>
                          Module {idx + 1}: {mod.title}
                        </span>
                        <span className="text-xs" style={{ color: '#A9A9C8' }}>{mod.lessons?.length || 0} lessons</span>
                      </div>
                      {mod.lessons?.map((lesson) => (
                        <div key={lesson.id} className="px-5 py-3 flex items-center justify-between text-sm" style={{ borderTop: '1px solid #EEF0F6' }}>
                          <div className="flex items-center gap-3">
                            <FiPlayCircle style={{ color: '#A9A9C8' }} size={16} />
                            <span style={{ color: '#5B5B98' }}>{lesson.title}</span>
                          </div>
                          <span style={{ color: '#A9A9C8' }}>{lesson.video_duration || ''}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-8" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              {isOwner && (
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-medium mb-4 text-sm no-underline transition"
                  style={{ border: '1px solid #EEF0F6', color: '#5B5B98' }}
                >
                  <FiEdit2 size={16} /> Edit Course
                </Link>
              )}

              <p className="text-3xl font-bold mb-6 heading-font" style={{ color: '#260944' }}>
                {course.price > 0 ? `$${course.price}` : 'Free'}
              </p>

              {enrolled ? (
                <Link
                  href={`/learn/${course.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white font-semibold text-sm no-underline mb-4 transition hover:opacity-90"
                  style={{ backgroundColor: '#757FEF' }}
                >
                  <FiMonitor size={16} /> Go to Course
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white font-semibold text-sm mb-4 transition hover:opacity-90"
                  style={{ backgroundColor: '#757FEF' }}
                >
                  {course.price > 0 ? 'Enroll Now' : 'Enroll for Free'}
                </button>
              )}

              <div style={{ borderTop: '1px solid #EEF0F6' }}>
                <div className="flex items-center justify-between py-3 text-sm">
                  <div className="flex items-center gap-2" style={{ color: '#A9A9C8' }}>
                    <FiUsers size={16} /> Students
                  </div>
                  <span className="font-semibold" style={{ color: '#260944' }}>{course.student_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm" style={{ borderTop: '1px solid #EEF0F6' }}>
                  <div className="flex items-center gap-2" style={{ color: '#A9A9C8' }}>
                    <FiClock size={16} /> Duration
                  </div>
                  <span className="font-semibold" style={{ color: '#260944' }}>{course.duration || 'Self-paced'}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm" style={{ borderTop: '1px solid #EEF0F6' }}>
                  <div className="flex items-center gap-2" style={{ color: '#A9A9C8' }}>
                    <FiBarChart2 size={16} /> Level
                  </div>
                  <span className="font-semibold capitalize" style={{ color: '#260944' }}>{course.difficulty_level}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm" style={{ borderTop: '1px solid #EEF0F6' }}>
                  <div className="flex items-center gap-2" style={{ color: '#A9A9C8' }}>
                    <FiBookOpen size={16} /> Language
                  </div>
                  <span className="font-semibold" style={{ color: '#260944' }}>{course.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
