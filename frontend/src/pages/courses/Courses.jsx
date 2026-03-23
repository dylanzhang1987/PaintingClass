import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/coursesApi';
import { usersApi } from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ScheduleEditor from '../../components/courses/ScheduleEditor';
import CourseEnrollmentManager from '../../components/courses/CourseEnrollmentManager';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    level: 'beginner',
    schedule: '',
    teacher_id: '',
    max_students: '',
    fee: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Enrollment management state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'super_admin') {
      fetchTeachers();
    }
  }, [page, search]);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll(page, 10, search);
      setCourses(response.data.courses);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('获取课程列表失败');
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await usersApi.getAll(1, 1000, '');
      const teacherUsers = response.data.users.filter(u =>
        u.role === 'teacher' || u.role === 'super_admin'
      );
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      level: 'beginner',
      schedule: '',
      teacher_id: user?.role === 'teacher' ? user.id : '',
      max_students: '',
      fee: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleEditCourse = async (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      start_date: course.start_date ? course.start_date.split('T')[0] : '',
      end_date: course.end_date ? course.end_date.split('T')[0] : '',
      level: course.level || 'beginner',
      schedule: course.schedule || '',
      teacher_id: course.teacher_id || '',
      max_students: course.max_students || '',
      fee: course.fee || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        teacher_id: formData.teacher_id || user.id
      };

      if (user) {
        if (editingCourse) {
          await coursesApi.update(editingCourse.id, submitData);
        } else {
          await coursesApi.create(submitData);
        }
        setShowModal(false);
        fetchCourses();
      } else {
        throw new Error('未登录');
      }
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await coursesApi.delete(id);
      fetchCourses();
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      setError(error.response?.data?.error || '删除失败');
    }
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  // Enrollment management handlers
  const handleManageStudents = (course) => {
    setSelectedCourse(course);
    setShowEnrollmentModal(true);
  };

  const handleEnrollmentSuccess = () => {
    fetchCourses();
  };

  const totalPages = Math.ceil(total / 10);
  const levelLabels = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };

  const canEditTeacher = user?.role === 'super_admin';

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      {error && !showModal && !showEnrollmentModal && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="搜索课程..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          添加课程
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {levelLabels[course.level] || course.level}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {course.description || '暂无描述'}
            </p>
            <div className="text-sm text-gray-500 mb-2">
              <span>📅 {course.start_date} - {course.end_date}</span>
            </div>
            {course.schedule && (
              <div className="text-sm text-gray-500 mb-4">
                <span>🕒 {course.schedule.split('\n').map((line, i) => (
                  <span key={i} className="block pl-5">{line}</span>
                ))}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-500">教师: {course.teacher_name}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-500">
                学生: {course.student_count || 0} / {course.max_students || '无限制'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="space-x-2">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleManageStudents(course)}
                  className="text-green-600 hover:text-green-800 ml-2"
                >
                  管理学生
                </button>
                <button
                  onClick={() => confirmDelete(course)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Course Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCourse ? '编辑课程' : '添加课程'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                课程名称
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                课程描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={3}
              />
            </div>

            {canEditTeacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  指定教师
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">请选择教师</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.role === 'super_admin' ? '管理员' : '教师'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                课程级别
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大学生数
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                placeholder="留空表示无限制"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                课程费用
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="留空表示免费"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="col-span-2">
              <ScheduleEditor
                value={formData.schedule}
                onChange={(schedule) => setFormData({ ...formData, schedule })}
                error={null}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enrollment Management Modal */}
      {showEnrollmentModal && selectedCourse && (
        <CourseEnrollmentManager
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          maxStudents={selectedCourse.max_students}
          onClose={() => setShowEnrollmentModal(false)}
          onSuccess={handleEnrollmentSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCourseToDelete(null);
        }}
        onConfirm={() => handleDelete(courseToDelete.id)}
        title="确认删除"
        message={`确定要删除课程 "${courseToDelete?.name}" 吗？此操作不可撤销。`}
      />
    </div>
  );
};

export default Courses;
