import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://online-cms-3xij.onrender.com/api';
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  createUser: (data) => api.post('/auth/create-user', data),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
};

export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getInstructorCourses: () => api.get('/courses/instructor'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.postForm('/courses', data),
  update: (id, data) => api.putForm(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const moduleAPI = {
  create: (courseId, data) => api.post(`/modules/${courseId}`, data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
  addLesson: (moduleId, data) => api.postForm(`/modules/${moduleId}/lessons`, data),
  updateLesson: (id, data) => api.putForm(`/modules/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/modules/lessons/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};

export const enrollmentAPI = {
  enroll: (data) => api.post('/enrollments', data),
  getMyCourses: () => api.get('/enrollments/my-courses'),
  check: (courseId) => api.get(`/enrollments/check/${courseId}`),
  getCourseStudents: (courseId) => api.get(`/enrollments/course/${courseId}/students`),
};

export const progressAPI = {
  updateLesson: (data) => api.post('/progress/lesson', data),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
};

export const assignmentAPI = {
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  create: (data) => api.post('/assignments', data),
  submit: (assignmentId, data) => api.postForm(`/assignments/submit/${assignmentId}`, data),
  grade: (submissionId, data) => api.put(`/assignments/grade/${submissionId}`, data),
  getSubmissions: (assignmentId) => api.get(`/assignments/submissions/${assignmentId}`),
};

export const quizAPI = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  create: (data) => api.post('/quizzes', data),
  addQuestions: (quizId, data) => api.post(`/quizzes/questions/${quizId}`, data),
  getQuestions: (quizId) => api.get(`/quizzes/questions/${quizId}`),
  submit: (quizId, data) => api.post(`/quizzes/submit/${quizId}`, data),
};

export const certificateAPI = {
  getMyCertificates: () => api.get('/certificates/my'),
  generate: (courseId) => api.post(`/certificates/generate/${courseId}`),
  verify: (code) => api.get(`/certificates/verify/${code}`),
};

export const paymentAPI = {
  createPayment: (data) => api.post('/payments/create-payment', data),
  getHistory: () => api.get('/payments/history'),
  getRevenue: () => api.get('/payments/revenue'),
};

export const taskAPI = {
  getByLesson: (lessonId) => api.get(`/tasks/lesson/${lessonId}`),
  getByCourse: (courseId) => api.get(`/tasks/course/${courseId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  submit: (taskId, data) => api.post(`/tasks/submit/${taskId}`, data),
  getSubmissions: (taskId) => api.get(`/tasks/submissions/${taskId}`),
  grade: (submissionId, data) => api.put(`/tasks/grade/${submissionId}`, data),
};

export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getAdminCharts: () => api.get('/dashboard/admin/charts'),
  getAdminInstructors: () => api.get('/dashboard/admin/instructors'),
  getAdminCourseReports: () => api.get('/dashboard/admin/course-reports'),
  getInstructor: () => api.get('/dashboard/instructor'),
  getStudent: () => api.get('/dashboard/student'),
};

export default api;
export { BASE_URL };
