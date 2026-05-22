'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { courseAPI, assignmentAPI, BASE_URL } from '@/lib/api';
import { FiBookOpen, FiCheckCircle, FiClock, FiUsers, FiChevronRight, FiChevronDown, FiX, FiSend, FiStar, FiFileText, FiDownload } from 'react-icons/fi';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

export default function AssignmentGradingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeModal, setGradeModal] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user && user.role === 'student') { router.push('/dashboard'); return; }
    courseAPI.getInstructorCourses().then(res => setCourses(res.data)).catch(() => {});
  }, [user, router]);

  useEffect(() => {
    if (!selectedCourseId) { setAssignments([]); return; }
    setLoading(true);
    assignmentAPI.getByCourse(selectedCourseId)
      .then(res => setAssignments(res.data))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  const loadSubmissions = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
      setSubmissions([]);
      return;
    }
    setExpandedAssignment(assignmentId);
    setSubmissionsLoading(true);
    try {
      const res = await assignmentAPI.getSubmissions(assignmentId);
      setSubmissions(res.data);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openGradeModal = (submission) => {
    setGradeModal(submission);
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleGrade = async () => {
    if (!gradeModal) return;
    if (score === '' || isNaN(score)) {
      toast.error('Please enter a valid score');
      return;
    }
    try {
      await assignmentAPI.grade(gradeModal.id, { score: parseInt(score), feedback });
      toast.success('Submission graded!');
      setGradeModal(null);
      setScore('');
      setFeedback('');
      if (expandedAssignment) loadSubmissions(expandedAssignment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0);
  const totalGraded = assignments.reduce((sum, a) => sum + (a.graded_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Grading</h1>
            <p className="text-gray-500 mt-1">Review and grade student assignment submissions</p>
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
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FiBookOpen className="text-indigo-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalAssignments}</p>
                <p className="text-sm text-gray-500">Total Assignments</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
                <p className="text-sm text-gray-500">Total Submissions</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalGraded}</p>
                <p className="text-sm text-gray-500">Graded</p>
              </div>
            </div>

            {loading ? (
              <Loader text="Loading assignments..." />
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map(a => (
                  <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => loadSubmissions(a.id)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{a.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">Max Score: {a.max_score}</span>
                          {a.deadline && (
                            <span className="text-xs text-gray-400">Deadline: {new Date(a.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <span className="text-xs text-gray-500">
                          {a.graded_count || 0}/{a.submission_count || 0} graded
                        </span>
                        {(a.submission_count - a.graded_count) > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            {(a.submission_count - a.graded_count)} pending
                          </span>
                        )}
                        {expandedAssignment === a.id ? (
                          <FiChevronDown className="text-gray-400" size={16} />
                        ) : (
                          <FiChevronRight className="text-gray-400" size={16} />
                        )}
                      </div>
                    </button>

                    {expandedAssignment === a.id && (
                      <div className="px-6 pb-4 border-t border-gray-100">
                        {submissionsLoading ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-400">Loading submissions...</p>
                          </div>
                        ) : submissions.length > 0 ? (
                          <div className="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-100">
                            {submissions.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                                    {sub.student_name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{sub.student_name}</p>
                                    <p className="text-xs text-gray-400">{sub.student_email}</p>
                                    {sub.submission_text && (
                                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sub.submission_text}</p>
                                    )}
                                    {sub.file_url && (
                                      <a
                                        href={`${BASE_URL}${sub.file_url}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-1"
                                      >
                                        <FiDownload size={12} />
                                        Download Submission File
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                  {sub.score !== null ? (
                                    <span className={`text-sm font-semibold ${sub.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                      {sub.score}/{a.max_score || 100}
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                      Ungraded
                                    </span>
                                  )}
                                  <button
                                    onClick={() => openGradeModal({ ...sub, max_score: a.max_score || 100 })}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition flex items-center gap-1.5"
                                  >
                                    <FiStar size={12} />
                                    {sub.score !== null ? 'Update' : 'Grade'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                            <FiFileText className="mx-auto text-gray-300" size={32} />
                            <p className="text-sm text-gray-400 mt-2">No submissions yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <FiBookOpen className="mx-auto text-gray-300" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mt-4">No Assignments</h3>
                <p className="text-gray-500 mt-2">No assignments have been created for this course yet.</p>
              </div>
            )}
          </>
        )}

        {!selectedCourseId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <FiBookOpen className="mx-auto text-gray-300" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mt-4">Select a Course</h3>
            <p className="text-gray-500 mt-2">Choose a course above to review and grade assignment submissions.</p>
          </div>
        )}

        {gradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
              <button
                onClick={() => setGradeModal(null)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Submission</h3>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{gradeModal.student_name}</p>
                <p className="text-xs text-gray-500">{gradeModal.student_email}</p>
                {gradeModal.submission_text && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <p className="text-xs text-gray-600">{gradeModal.submission_text}</p>
                  </div>
                )}
                {gradeModal.file_url && (
                  <div className="mt-2">
                    <a
                      href={`${BASE_URL}${gradeModal.file_url}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <FiDownload size={14} />
                      View Submission File
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-{gradeModal.max_score})</label>
                  <input
                    type="number"
                    min="0"
                    max={gradeModal.max_score}
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter score..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Provide feedback to the student..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleGrade}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <FiSend size={16} />
                    {gradeModal.score !== null ? 'Update Grade' : 'Submit Grade'}
                  </button>
                  <button
                    onClick={() => setGradeModal(null)}
                    className="px-4 py-2.5 text-gray-500 hover:text-gray-700 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
