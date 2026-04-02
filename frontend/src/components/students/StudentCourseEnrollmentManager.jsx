import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/studentsApi';
import { coursesApi } from '../../api/coursesApi';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

const StudentCourseEnrollmentManager = ({ studentId, studentName, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [courseToWithdraw, setCourseToWithdraw] = useState(null);
  const [search, setSearch] = useState('');

  const levelLabels = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [studentResponse, allCoursesResponse] = await Promise.all([
        studentsApi.getById(studentId),
        coursesApi.getAll(1, 1000, '')
      ]);

      const enrollments = studentResponse.data?.enrollments || [];
      setEnrolledCourses(enrollments.map(e => ({
        ...e,
        enrollment_date: e.enrollment_date || e.created_at
      })));

      const enrolledIds = new Set(enrollments.map(e => e.id));
      const allCourses = allCoursesResponse.data?.courses || [];
      const available = allCourses
        .filter(c => !enrolledIds.has(c.id))
        .filter(c => !c.max_students || c.student_count < c.max_students); // Only show courses with space
      setAvailableCourses(available);
    } catch (err) {
      setError('获取课程数据失败');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (course) => {
    setCourseToWithdraw(course);
    setShowWithdrawConfirm(true);
  };

  const confirmWithdraw = async () => {
    setSubmitting(true);
    try {
      await coursesApi.withdrawStudent(courseToWithdraw.id, studentId);
      setShowWithdrawConfirm(false);
      setCourseToWithdraw(null);
      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '退课失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = async () => {
    if (selectedCourses.size === 0) {
      setError('请至少选择一门课程');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const promises = Array.from(selectedCourses).map(courseId =>
        coursesApi.enrollStudent(courseId, studentId)
      );
      await Promise.all(promises);

      setSelectedCourses(new Set());
      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '选课失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourseSelection = (courseId) => {
    const newSet = new Set(selectedCourses);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setSelectedCourses(newSet);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredAvailableCourses();
    const newSet = new Set(selectedCourses);
    filtered.forEach(course => newSet.add(course.id));
    setSelectedCourses(newSet);
  };

  const clearSelection = () => {
    setSelectedCourses(new Set());
  };

  const getFilteredAvailableCourses = () => {
    if (!Array.isArray(availableCourses)) return [];
    if (!search) return availableCourses;
    const searchLower = search.toLowerCase();
    return availableCourses.filter(c =>
      c && c.name && c.name.toLowerCase().includes(searchLower)
    );
  };

  const filteredAvailableCourses = getFilteredAvailableCourses();

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`管理课程 - ${studentName}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => { setActiveTab('enrolled'); setError(''); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              已选课程 ({enrolledCourses.length})
            </button>
            <button
              onClick={() => { setActiveTab('available'); setError(''); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              选课 ({availableCourses.length})
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="md" />
        ) : (
          <>
            {/* Enrolled Courses Tab */}
            {activeTab === 'enrolled' && (
              <div className="space-y-2">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无已选课程
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrolledCourses.map(course => (
                      <div key={course.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{course.name}</h4>
                          <button
                            onClick={() => handleWithdraw(course)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            退课
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>👨‍🏫 教师: {course.teacher_name || '-'}</div>
                          <div>📊 级别: {levelLabels[course.level] || course.level}</div>
                          {course.schedule && (
                            <div>🕒 {course.schedule.split('\n').map((line, i) => (
                              <span key={i} className="block">{line}</span>
                            ))}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Available Courses Tab */}
            {activeTab === 'available' && (
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <input
                    type="text"
                    placeholder="搜索课程名称..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Selection Controls */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedCourses.size} 门课程
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={selectAllFiltered}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      全选
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      清空
                    </button>
                  </div>
                </div>

                {/* Course List */}
                {filteredAvailableCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? '未找到匹配的课程' : '没有可选课程'}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredAvailableCourses.map(course => {
                      const remaining = course.max_students ? course.max_students - course.student_count : '无限制';
                      return (
                        <div
                          key={course.id}
                          className={`bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-400 ${
                            selectedCourses.has(course.id) ? 'border-blue-600 bg-blue-50' : ''
                          }`}
                          onClick={() => toggleCourseSelection(course.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={selectedCourses.has(course.id)}
                                onChange={() => toggleCourseSelection(course.id)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">{course.name}</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>👨‍🏫 教师: {course.teacher_name || '-'}</div>
                                <div>📊 级别: {levelLabels[course.level] || course.level}</div>
                                <div>
                                  📊 剩余名额: {typeof remaining === 'number' ? remaining : '无限制'}
                                  {typeof remaining === 'number' && remaining < 3 && remaining > 0 && (
                                    <span className="text-orange-600 ml-2">名额紧张</span>
                                  )}
                                </div>
                                {course.schedule && (
                                  <div>🕒 {course.schedule.split('\n').map((line, i) => (
                                    <span key={i} className="block">{line}</span>
                                  ))}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Enroll Button */}
                {selectedCourses.size > 0 && (
                  <button
                    onClick={handleEnroll}
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? '处理中...' : `确认选课 (${selectedCourses.size} 门)`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => { setShowWithdrawConfirm(false); setCourseToWithdraw(null); }}
        onConfirm={confirmWithdraw}
        title="确认退课"
        message={`确定要退出课程 "${courseToWithdraw?.name}" 吗？`}
      />
    </Modal>
  );
};

export default StudentCourseEnrollmentManager;
