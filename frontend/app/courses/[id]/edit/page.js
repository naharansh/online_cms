'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, moduleAPI, categoryAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FiPlus, FiTrash2, FiSave, FiX, FiUpload, FiVideo, FiFileText, FiArrowUp, FiArrowDown, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

export default function EditCoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category_id: '', price: '',
    difficulty_level: 'beginner', language: 'English', duration: '', is_published: false,
    thumbnail: null,
  });

  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingLesson, setAddingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', video_duration: '', is_free: false,
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user && user.role === 'student') { router.push('/dashboard'); return; }

    Promise.all([
      courseAPI.getById(id),
      categoryAPI.getAll(),
    ]).then(([courseRes, catRes]) => {
      const c = courseRes.data;
      setForm({
        title: c.title || '',
        description: c.description || '',
        category_id: c.category_id || '',
        price: c.price || '',
        difficulty_level: c.difficulty_level || 'beginner',
        language: c.language || 'English',
        duration: c.duration || '',
        is_published: c.is_published || false,
        thumbnail: null,
      });
      setModules(c.modules || []);
      setCategories(catRes.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Course not found');
      router.push('/dashboard/instructor');
    });
  }, [id, user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'thumbnail') {
      setForm(prev => ({ ...prev, thumbnail: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const addModule = async () => {
    if (!newModuleTitle.trim()) { toast.error('Module title is required'); return; }
    try {
      const res = await moduleAPI.create(id, {
        title: newModuleTitle,
        description: '',
      });
      setModules(prev => [...prev, {
        id: res.data.id,
        title: newModuleTitle,
        description: '',
        lessons: [],
        order_index: prev.length + 1,
      }]);
      setNewModuleTitle('');
      setAddingModule(false);
      toast.success('Module added');
    } catch (err) {
      toast.error('Failed to add module');
    }
  };

  const removeModule = async (index) => {
    const mod = modules[index];
    try {
      await moduleAPI.delete(mod.id);
      setModules(prev => prev.filter((_, i) => i !== index));
      toast.success('Module removed');
    } catch (err) {
      toast.error('Failed to remove module');
    }
  };

  const moveModule = (index, direction) => {
    const newModules = [...modules];
    const target = index + direction;
    if (target < 0 || target >= newModules.length) return;
    [newModules[index], newModules[target]] = [newModules[target], newModules[index]];
    setModules(newModules);
  };

  const addLesson = async (moduleIndex) => {
    const { title, description, video_duration, is_free } = lessonForm;
    if (!title.trim()) { toast.error('Lesson title is required'); return; }
    const mod = modules[moduleIndex];
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('video_duration', video_duration || '');
      formData.append('is_free', is_free);
      const res = await moduleAPI.addLesson(mod.id, formData);
      const newModules = [...modules];
      newModules[moduleIndex].lessons.push({
        id: res.data.id,
        title,
        description,
        video_duration,
        is_free,
      });
      setModules(newModules);
      setLessonForm({ title: '', description: '', video_duration: '', is_free: false });
      setAddingLesson(null);
      toast.success('Lesson added');
    } catch (err) {
      toast.error('Failed to add lesson');
    }
  };

  const removeLesson = async (moduleIndex, lessonIndex) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex];
    try {
      await moduleAPI.deleteLesson(lesson.id);
      const newModules = [...modules];
      newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      setModules(newModules);
    } catch (err) {
      toast.error('Failed to remove lesson');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'thumbnail' && value) formData.append(key, value);
        else if (key !== 'thumbnail') formData.append(key, value);
      });
      await courseAPI.update(id, formData);
      toast.success('Course updated successfully!');
      router.push(`/courses/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50/30">
<Loader text="Loading course..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-gray-500 mt-1">Update your course content and settings</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/courses/${id}`)} className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/50 transition">
              <FiEye size={18} /> Preview
            </button>
            <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/50 transition">
              <FiX size={18} /> Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Course Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select name="difficulty_level" value={form.difficulty_level} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input type="text" name="language" value={form.language} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input type="text" name="duration" value={form.duration} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                  <FiUpload className="text-gray-400" size={20} />
                  <span className="text-sm text-gray-500">{form.thumbnail ? form.thumbnail.name : 'Change image'}</span>
                  <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Publish course</span>
                    <p className="text-xs text-gray-400">Make it visible to students</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Course Content
              <span className="text-sm font-normal text-gray-400 ml-2">({modules.length} modules)</span>
            </h2>

            <div className="space-y-4">
              {modules.map((mod, modIdx) => (
                <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden transition hover:shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 cursor-pointer" onClick={() => setExpandedModule(expandedModule === modIdx ? null : modIdx)}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">{modIdx + 1}</span>
                      <span className="font-medium text-gray-900">{mod.title}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{mod.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveModule(modIdx, -1); }} disabled={modIdx === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition">
                        <FiArrowUp size={16} />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveModule(modIdx, 1); }} disabled={modIdx === modules.length - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition">
                        <FiArrowDown size={16} />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeModule(modIdx); }} className="p-1.5 text-red-400 hover:text-red-600 transition">
                        <FiTrash2 size={16} />
                      </button>
                      {expandedModule === modIdx ? <FiChevronUp size={18} className="text-gray-400" /> : <FiChevronDown size={18} className="text-gray-400" />}
                    </div>
                  </div>

                  {expandedModule === modIdx && (
                    <div className="px-5 py-4 border-t border-gray-100">
                      <div className="space-y-2 mb-4">
                        {(!mod.lessons || mod.lessons.length === 0) && (
                          <p className="text-sm text-gray-400 text-center py-4">No lessons in this module</p>
                        )}
                        {mod.lessons?.map((lesson, lessonIdx) => (
                          <div key={lesson.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg group">
                            <div className="flex items-center gap-3">
                              <FiVideo className="text-indigo-400" size={16} />
                              <span className="text-sm text-gray-700">{lesson.title}</span>
                              {lesson.video_duration && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{lesson.video_duration}</span>
                              )}
                              {lesson.is_free && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Free</span>
                              )}
                            </div>
                            <button type="button" onClick={() => removeLesson(modIdx, lessonIdx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {addingLesson === modIdx ? (
                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Lesson Title *</label>
                              <input type="text" value={lessonForm.title} onChange={e => setLessonForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <textarea value={lessonForm.description} onChange={e => setLessonForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                              <input type="text" value={lessonForm.video_duration} onChange={e => setLessonForm(prev => ({ ...prev, video_duration: e.target.value }))} placeholder="10:30" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm(prev => ({ ...prev, is_free: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-600">Free preview</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => addLesson(modIdx)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                              Add Lesson
                            </button>
                            <button type="button" onClick={() => { setAddingLesson(null); setLessonForm({ title: '', description: '', video_duration: '', is_free: false }); }} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setAddingLesson(modIdx)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition">
                          <FiPlus size={16} /> Add Lesson
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {addingModule && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <input type="text" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Module title..." className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" autoFocus onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addModule())} />
                <button type="button" onClick={addModule} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition text-sm shadow-sm">
                  Add
                </button>
                <button type="button" onClick={() => { setAddingModule(false); setNewModuleTitle(''); }} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 transition text-sm">
                  Cancel
                </button>
              </div>
            )}

            {modules.length > 0 && !addingModule && (
              <button type="button" onClick={() => setAddingModule(true)} className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition">
                <FiPlus size={18} /> Add Another Module
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pb-12">
            <button type="button" onClick={() => router.push(`/courses/${id}`)} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm">
              <FiSave size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
