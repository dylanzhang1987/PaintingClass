import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/coursesApi';
import { studentsApi } from '../../api/studentsApi';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

const CourseEnrollmentManager = ({ courseId, courseName, maxStudents, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [studentToWithdraw, setStudentToWithdraw] = useState(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [enrolledResponse, allStudentsResponse] = await Promise.all([
        coursesApi.getStudents(courseId),
        studentsApi.getAll(1, 1000, '')
      ]);

      const students = enrolledResponse.data?.students || [];
      setEnrolledStudents(students);
      setEnrollmentCount(students.length);

      const enrolledIds = new Set(students.map(s => s.id));
      const allStudents = allStudentsResponse.data?.students || [];
      const available = allStudents.filter(s => !enrolledIds.has(s.id));
      setAvailableStudents(available);
    } catch (err) {
      setError('获取学生数据失败');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = (student) => {
    setStudentToWithdraw(student);
    setShowWithdrawConfirm(true);
  };

  const confirmWithdraw = async () => {
    setSubmitting(true);
    try {
      await coursesApi.withdrawStudent(courseId, studentToWithdraw.id);
      setShowWithdrawConfirm(false);
      setStudentToWithdraw(null);
      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '退课失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = async () => {
    if (selectedStudents.size === 0) {
      setError('请至少选择一名学生');
      return;
    }

    const newTotal = enrollmentCount + selectedStudents.size;
    if (maxStudents && newTotal > maxStudents) {
      setError(`选课失败：课程最多只能容纳 ${maxStudents} 名学生`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const promises = Array.from(selectedStudents).map(studentId =>
        coursesApi.enrollStudent(courseId, studentId)
      );
      await Promise.all(promises);

      setSelectedStudents(new Set());
      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '选课失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      const newTotal = enrollmentCount + newSet.size;
      if (maxStudents && newTotal >= maxStudents) {
        setError(`课程最多只能容纳 ${maxStudents} 名学生`);
        return;
      }
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredAvailableStudents();
    const newSet = new Set(selectedStudents);

    filtered.forEach(student => {
      const newTotal = enrollmentCount + newSet.size;
      if (!maxStudents || newTotal < maxStudents) {
        newSet.add(student.id);
      }
    });

    setSelectedStudents(newSet);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const getFilteredAvailableStudents = () => {
    if (!Array.isArray(availableStudents)) return [];
    if (!search) return availableStudents;
    const searchLower = search.toLowerCase();
    return availableStudents.filter(s => s && s.name && s.student_number && (
      s.name.toLowerCase().includes(searchLower) ||
      s.student_number.toLowerCase().includes(searchLower)
    ));
  };

  const filteredAvailableStudents = getFilteredAvailableStudents();

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`管理学生 - ${courseName}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              已注册学生
            </span>
            <span className="text-sm font-bold text-blue-900">
              {enrollmentCount} / {maxStudents || '无限制'}
            </span>
          </div>
          {maxStudents && enrollmentCount >= maxStudents && (
            <div className="text-xs text-red-600 mt-1">
              ⚠️ 课程已满员
            </div>
          )}
        </div>

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
              已注册学生 ({enrollmentCount})
            </button>
            <button
              onClick={() => { setActiveTab('available'); setError(''); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              添加学生 ({availableStudents.length})
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
            {activeTab === 'enrolled' && (
              <div className="space-y-2">
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无已注册学生
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">学号</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">姓名</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">电话</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {enrolledStudents.map(student => (
                          <tr key={student.id}>
                            <td className="px-4 py-2 text-sm">{student.student_number}</td>
                            <td className="px-4 py-2 text-sm font-medium">{student.name}</td>
                            <td className="px-4 py-2 text-sm">{student.phone || '-'}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleWithdraw(student)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                退课
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'available' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="搜索学生（姓名或学号）..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedStudents.size} 名学生
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

                {filteredAvailableStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? '未找到匹配的学生' : '没有可添加的学生'}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-center w-12">
                            <input
                              type="checkbox"
                              checked={selectedStudents.size > 0}
                              onChange={() => selectedStudents.size > 0 ? clearSelection() : selectAllFiltered()}
                              disabled={maxStudents && enrollmentCount >= maxStudents}
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">学号</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">姓名</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">电话</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAvailableStudents.map(student => {
                          const canSelect = !maxStudents || enrollmentCount + selectedStudents.size < maxStudents;
                          return (
                            <tr key={student.id} className={canSelect ? '' : 'opacity-50'}>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.has(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                  disabled={!canSelect}
                                />
                              </td>
                              <td className="px-4 py-2 text-sm">{student.student_number}</td>
                              <td className="px-4 py-2 text-sm font-medium">{student.name}</td>
                              <td className="px-4 py-2 text-sm">{student.phone || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedStudents.size > 0 && (
                  <button
                    onClick={handleEnroll}
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? '处理中...' : `添加 ${selectedStudents.size} 名学生`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => { setShowWithdrawConfirm(false); setStudentToWithdraw(null); }}
        onConfirm={confirmWithdraw}
        title="确认退课"
        message={`确定要让学生 "${studentToWithdraw?.name}" 退出此课程吗？`}
      />
    </Modal>
  );
};

export default CourseEnrollmentManager;
