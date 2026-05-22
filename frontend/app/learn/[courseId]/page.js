'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, enrollmentAPI, progressAPI, assignmentAPI, quizAPI, certificateAPI, taskAPI, BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { FiBook, FiDownload, FiFile } from 'react-icons/fi';
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
  const [lessonTasks, setLessonTasks] = useState([]);
  const [taskSubmissions, setTaskSubmissions] = useState({});

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

  const fetchLessonTasks = async (lessonId) => {
    try {
      const res = await taskAPI.getByLesson(lessonId);
      setLessonTasks(res.data);
      const subs = {};
      res.data.forEach(t => {
        if (t.submission_id) subs[t.id] = { id: t.submission_id, score: t.my_score, feedback: t.my_feedback, submission_text: t.my_submission };
      });
      setTaskSubmissions(subs);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (currentLesson) {
      fetchLessonTasks(currentLesson.id);
    }
  }, [currentLesson]);

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

  const [submittingTask, setSubmittingTask] = useState(null);
  const [taskSubmissionText, setTaskSubmissionText] = useState('');

  const handleTaskSubmit = async (taskId) => {
    try {
      await taskAPI.submit(taskId, { submission_text: taskSubmissionText });
      toast.success('Task submitted successfully!');
      setSubmittingTask(null);
      setTaskSubmissionText('');
      fetchLessonTasks(currentLesson.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit task');
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
              <div className="flex gap-3 mb-6">
                <button onClick={markComplete} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                  Mark as Complete
                </button>
                {currentLesson.notes_url ? (
                  <a href={`${BASE_URL}${currentLesson.notes_url}`} target="_blank" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">
                    Download Notes
                  </a>
                ) : (
                  <span className="bg-gray-100 text-gray-400 px-6 py-2 rounded-lg font-medium cursor-not-allowed">
                    No Notes Available
                  </span>
                )}
              </div>

              {lessonTasks.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBook className="text-indigo-500" size={18} />
                    Lesson Tasks
                  </h3>
                  <div className="space-y-4">
                    {lessonTasks.map(task => {
                      const submission = taskSubmissions[task.id];
                      return (
                        <div key={task.id} className="border border-gray-100 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                              {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                            </div>
                            {submission?.score !== null && submission?.score !== undefined ? (
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                                backgroundColor: submission.score >= 50 ? 'rgba(0, 182, 155, 0.1)' : 'rgba(238, 54, 140, 0.1)',
                                color: submission.score >= 50 ? '#00B69B' : '#EE368C'
                              }}>
                                Score: {submission.score}
                              </span>
                            ) : submission ? (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 188, 43, 0.15)', color: '#B8860B' }}>
                                Submitted
                              </span>
                            ) : null}
                          </div>
                          {submission?.feedback && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-600 mb-1">Feedback:</p>
                              <p className="text-xs text-gray-500">{submission.feedback}</p>
                            </div>
                          )}
                          {!submission && (
                            <div className="mt-3">
                              {submittingTask === task.id ? (
                                <div>
                                  <textarea
                                    value={taskSubmissionText}
                                    onChange={e => setTaskSubmissionText(e.target.value)}
                                    rows={3}
                                    placeholder="Write your submission..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-2"
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleTaskSubmit(task.id)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">
                                      Submit
                                    </button>
                                    <button onClick={() => { setSubmittingTask(null); setTaskSubmissionText(''); }} className="px-4 py-1.5 text-gray-500 hover:text-gray-700 text-xs transition">
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setSubmittingTask(task.id)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">
                                  Submit Task
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                        {a.submission_id ? (
                          a.my_score !== null ? (
                            <span className="text-green-600">Score: {a.my_score}</span>
                          ) : (
                            <span className="text-yellow-600">Submitted</span>
                          )
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

            {course.modules?.some(m => m.lessons?.some(l => l.notes_url)) && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiDownload className="text-indigo-500" size={16} />
                  Course Notes
                </h3>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                  {course.modules.map(mod => {
                    const lessonsWithNotes = mod.lessons?.filter(l => l.notes_url);
                    if (!lessonsWithNotes?.length) return null;
                    return (
                      <div key={mod.id}>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1 px-1">{mod.title}</p>
                        {lessonsWithNotes.map(lesson => (
                          <a
                            key={lesson.id}
                            href={`${BASE_URL}${lesson.notes_url}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition no-underline"
                          >
                            <FiFile className="shrink-0" size={14} />
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <FiDownload size={14} className="shrink-0 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
