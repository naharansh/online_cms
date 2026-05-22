'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function QuizzesPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    quizAPI.getByCourse(courseId).then(res => setQuizzes(res.data)).catch(() => {});
  }, [courseId, user, router]);

  const startQuiz = async (quiz) => {
    const res = await quizAPI.getQuestions(quiz.id);
    setActiveQuiz(res.data.quiz);
    setQuestions(res.data.questions);
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await quizAPI.submit(activeQuiz.id, { answers });
      setResult(res.data);
      toast.success(res.data.passed ? 'You passed!' : 'You did not pass');
      const updated = await quizAPI.getByCourse(courseId);
      setQuizzes(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeQuiz.title}</h1>
        <p className="text-gray-500 mb-6">{activeQuiz.description}</p>
        {result ? (
          <div className={`rounded-xl p-8 text-center ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-4xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.percentage}%</p>
            <p className={`text-lg mb-1 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
              {result.passed ? 'Congratulations! You passed!' : 'You did not pass'}
            </p>
            <p className="text-gray-500">Score: {result.score}/{result.totalPoints}</p>
            <button onClick={() => setActiveQuiz(null)} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
              Back to Quizzes
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="font-medium text-gray-900 mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {JSON.parse(q.options).map((opt, j) => (
                      <label key={j} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input type="radio" name={`q-${q.id}`} value={String.fromCharCode(65 + j)}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                          checked={answers[q.id] === String.fromCharCode(65 + j)}
                          className="text-indigo-600" />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length !== questions.length}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Quizzes</h1>
      <div className="space-y-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{q.title}</h3>
              <p className="text-sm text-gray-500">{q.question_count} questions · {q.time_limit ? `${q.time_limit} min` : 'No time limit'}</p>
            </div>
            <div className="flex items-center gap-3">
              {q.my_score !== null ? (
                <span className="text-green-600 font-medium">Score: {q.my_score}</span>
              ) : null}
              <button onClick={() => startQuiz(q)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                {q.my_attempts > 0 ? 'Retake' : 'Start Quiz'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {quizzes.length === 0 && <p className="text-center text-gray-500 py-12">No quizzes yet.</p>}
    </div>
  );
}
