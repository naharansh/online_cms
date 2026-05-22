'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, enrollmentAPI, progressAPI, assignmentAPI, quizAPI, certificateAPI, BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

export default function LearnPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    courseAPI.getById(courseId).then(res => setCourse(res.data)).catch(() => router.push('/courses'));
    enrollmentAPI.check(courseId).then(res => {
      if (!res.data.enrolled) router.push(`/courses/${courseId}`);
      setEnrolled(true);
    }).catch(() => {});
    progressAPI.getCourseProgress(courseId).then(res => {
      const prog = {};
      res.data.forEach(p => { prog[p.lesson_id] = p; });
      setLessonProgress(prog);
    }).catch(() => {});
    assignmentAPI.getByCourse(courseId).then(res => setAssignments(res.data)).catch(() => {});
    quizAPI.getByCourse(courseId).then(res => setQuizzes(res.data)).catch(() => {});
  }, [courseId, user, router]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
  };

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      const res = await progressAPI.updateLesson({
        lesson_id: currentLesson.id,
        watched_seconds: 0,
        is_completed: true
      });
      setCourseProgress(res.data.progress);
      setLessonProgress(prev => ({ ...prev, [currentLesson.id]: { is_completed: true } }));
      toast.success('Lesson completed!');
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const [certificateCode, setCertificateCode] = useState(null);

  const handleGenerateCertificate = async () => {
    try {
      const res = await certificateAPI.generate(courseId);
      const code = res.data.certificate?.certificate_code;
      if (code) setCertificateCode(code);
      toast.success('Certificate generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    }
  };

  if (!course || !enrolled) return <Loader text="Loading course content..." />;

  const allLessons = course.modules?.flatMap(m => m.lessons) || [];
  const completedCount = allLessons.filter(l => lessonProgress[l.id]?.is_completed).length;
  const progress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isComplete = progress === 100 && allLessons.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentLesson ? (
            <div>
              <div className="aspect-video bg-black rounded-xl flex items-center justify-center mb-4">
                {currentLesson.video_url ? (
                  <video controls className="w-full h-full rounded-xl" src={`${BASE_URL}${currentLesson.video_url}`} />
                ) : (
                  <p className="text-white text-lg">Video not available</p>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
              <p className="text-gray-600 mb-4">{currentLesson.description}</p>
              <div className="flex gap-3">
                <button onClick={markComplete} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                  Mark as Complete
                </button>
                {currentLesson.notes_url && (
                  <a href={`${BASE_URL}${currentLesson.notes_url}`} target="_blank" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">
                    Download Notes
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="aspect-video bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <p className="text-lg mb-2">{course.title}</p>
                  <p className="text-4xl font-bold">{progress}% Complete</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{completedCount} of {allLessons.length} lessons completed</p>
              </div>

              {isComplete && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
                  <p className="text-green-800 font-semibold mb-2">Congratulations! You completed the course!</p>
                  {certificateCode ? (
                    <Link
                      href={`/certificates/verify/${certificateCode}`}
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      View Certificate
                    </Link>
                  ) : (
                    <button onClick={handleGenerateCertificate} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                      Get Certificate
                    </button>
                  )}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Materials</h3>
                {assignments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Assignments</h4>
                    {assignments.map(a => (
                      <div key={a.id} className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
                        <span>{a.title}</span>
                        {a.my_score !== null ? (
                          <span className="text-green-600">Score: {a.my_score}</span>
                        ) : (
                          <Link href={`/assignments/${courseId}`} className="text-indigo-600 hover:underline">Submit</Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {quizzes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Quizzes</h4>
                    {quizzes.map(q => (
                      <div key={q.id} className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
                        <span>{q.title}</span>
                        {q.my_score !== null ? (
                          <span className="text-green-600">Score: {q.my_score}</span>
                        ) : (
                          <Link href={`/quizzes/${courseId}`} className="text-indigo-600 hover:underline">Take Quiz</Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {course.modules?.map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs text-gray-400 uppercase font-medium px-2 py-1">{mod.title}</p>
                  {mod.lessons?.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition
                        ${currentLesson?.id === lesson.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${lessonProgress[lesson.id]?.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {lessonProgress[lesson.id]?.is_completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                      <span className="flex-1 truncate">{lesson.title}</span>
                      <span className="text-xs text-gray-400">{lesson.video_duration || ''}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
