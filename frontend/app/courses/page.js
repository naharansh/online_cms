'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { courseAPI, categoryAPI } from '@/lib/api';
import { FiSearch, FiGrid, FiList, FiPlus } from 'react-icons/fi';
import CourseImage from '@/components/CourseImage';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    courseAPI.getAll({ search, category, difficulty }).then(res => setCourses(res.data)).catch(() => {});
    categoryAPI.getAll().then(res => setCategories(res.data)).catch(() => {});
  }, [search, category, difficulty]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold heading-font" style={{ color: '#260944' }}>Browse Courses</h3>
            <nav className="flex items-center gap-2 text-sm mt-1">
              <Link href="/" className="text-gray-500 hover:text-primary no-underline">
                <i className="ri-home-2-line"></i> Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="fw-semibold text-dark">Browse Courses</span>
            </nav>
          </div>
          <Link
            href="/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold no-underline"
            style={{ backgroundColor: '#757FEF' }}
          >
            <FiPlus size={16} /> <span>Add Course</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl mb-6 p-4" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A9A9C8' }} size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none text-sm"
                style={{ border: '1px solid #EEF0F6', backgroundColor: '#F5F7FA' }}
              />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2.5 rounded-lg outline-none text-sm bg-transparent" style={{ border: '1px solid #EEF0F6', minWidth: '150px' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="px-4 py-2.5 rounded-lg outline-none text-sm bg-transparent" style={{ border: '1px solid #EEF0F6', minWidth: '150px' }}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="flex items-center gap-1 ml-auto" style={{ border: '1px solid #EEF0F6', borderRadius: '8px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                style={viewMode === 'grid' ? { backgroundColor: '#757FEF' } : {}}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                style={viewMode === 'list' ? { backgroundColor: '#757FEF' } : {}}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group no-underline">
                <div className="bg-white rounded-xl overflow-hidden transition-all hover:-translate-y-1 flex flex-col" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
                  <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
                    <CourseImage course={course} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    {course.price === 0 && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(0, 182, 155, 0.15)', color: '#00B69B' }}>
                        Free
                      </span>
                    )}
                    {course.difficulty_level && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(117, 127, 239, 0.15)', color: '#757FEF' }}>
                        {course.difficulty_level}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition" style={{ color: '#260944' }}>
                      {course.title}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: '#A9A9C8' }}>{course.instructor_name}</p>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #EEF0F6' }}>
                      <span className="text-xs" style={{ color: '#A9A9C8' }}>
                        <i className="ri-team-line"></i> {course.student_count || 0} students
                      </span>
                      <span className="font-bold" style={{ color: '#757FEF' }}>
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'rgba(100, 100, 111, 0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F7FA' }}>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>Course</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>Instructor</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>Students</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>Level</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition" style={{ borderTop: '1px solid #EEF0F6' }}>
                      <td className="px-6 py-4">
                        <Link href={`/courses/${course.id}`} className="flex items-center gap-3 no-underline" style={{ maxWidth: '380px' }}>
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <CourseImage course={course} className="w-full h-full object-cover object-top" />
                          </div>
                          <h4 className="font-semibold text-sm leading-snug hover:text-primary transition" style={{ color: '#260944' }}>{course.title}</h4>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#5B5B98' }}>{course.instructor_name}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#5B5B98' }}>{course.student_count || 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)', color: '#757FEF' }}>
                          {course.difficulty_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#757FEF' }}>
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)' }}>
              <FiSearch size={28} style={{ color: '#757FEF' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: '#260944' }}>No courses found</h4>
            <p className="text-sm" style={{ color: '#A9A9C8' }}>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
