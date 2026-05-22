'use client';
import { useEffect, useState } from 'react';
import { enrollmentAPI } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import CourseImage from '@/components/CourseImage';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    enrollmentAPI.getMyCourses().then(res => setCourses(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <Loader text="Loading your courses..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((enrollment) => (
          <div key={enrollment.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="h-36 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <CourseImage course={enrollment} className="w-full h-full object-cover object-top" />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{enrollment.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{enrollment.instructor_name}</p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-indigo-600 font-medium">{Math.round(enrollment.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                </div>
              </div>
              <Link href={`/learn/${enrollment.course_id}`} className="block text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Continue Learning
              </Link>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
          <Link href="/courses" className="text-indigo-600 hover:underline">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}
