'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { courseAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FiBookOpen, FiUsers, FiAward, FiMonitor } from 'react-icons/fi';
import Loader from '@/components/Loader';
import Carousel from '@/components/Carousel';
import CourseImage from '@/components/CourseImage';

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getAll({}).then(res => setCourses(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Carousel />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: FiBookOpen, title: 'Expert-Led Courses', desc: 'Learn from industry professionals with years of real-world experience.' },
            { icon: FiMonitor, title: 'Learn at Your Pace', desc: 'Self-paced learning with lifetime access to all course materials.' },
            { icon: FiAward, title: 'Earn Certificates', desc: 'Get certified and showcase your achievements to employers.' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-6 text-center" style={{ boxShadow: 'rgba(100, 100, 111, 0.08) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)' }}>
                <feature.icon size={24} style={{ color: '#757FEF' }} />
              </div>
              <h4 className="text-lg font-bold mb-2 heading-font" style={{ color: '#260944' }}>{feature.title}</h4>
              <p className="text-sm" style={{ color: '#A9A9C8' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold mb-8 heading-font" style={{ color: '#260944' }}>Featured Courses</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group no-underline">
              <div className="bg-white rounded-xl overflow-hidden transition-all hover:-translate-y-1 flex flex-col" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
                <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
                  <CourseImage course={course} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                  {course.price === 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(0, 182, 155, 0.15)', color: '#00B69B' }}>
                      Free
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition" style={{ color: '#260944' }}>{course.title}</h4>
                  <p className="text-xs mb-3" style={{ color: '#A9A9C8' }}>{course.instructor_name}</p>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #EEF0F6' }}>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#A9A9C8' }}>
                      <FiUsers size={13} /> {course.student_count || 0}
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#757FEF' }}>
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {loading && <Loader text="Loading courses..." />}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: '#A9A9C8' }}>No courses available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
