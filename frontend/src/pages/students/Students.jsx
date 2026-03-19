import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/studentsApi';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_number: '',
    name: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    enrollment_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      const response = await studentsApi.getAll(page, 10, search);
      setStudents(response.data.students);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('获取学生列表失败');
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormData({
      student_number: '',
      name: '',
      gender: 'male',
      email: '',
      phone: '',
      address: '',
      birth_date: '',
      enrollment_date: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      student_number: student.student_number,
      name: student.name,
      gender: student.gender,
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
      enrollment_date: student.enrollment_date ? student.enrollment_date.split('T')[0] : ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (selectedStudent) {
        await studentsApi.update(selectedStudent.id, formData);
      } else {
        await studentsApi.create(formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      setError(error.response?.data?.error || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await studentsApi.delete(id);
      fetchStudents();
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.response?.data?.error || '删除失败');
    }
  };

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const totalPages = Math.ceil(total / 10);
  const genderLabels = {
    male: '男',
    female: '女',
    other: '其他'
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      {error && !showModal && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="搜索学生..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleAddStudent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          添加学生
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">学号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">性别</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">邮箱</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">电话</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 text-sm">{student.student_number}</td>
                <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                <td className="px-6 py-4 text-sm">{genderLabels[student.gender]}</td>
                <td className="px-6 py-4 text-sm">{student.email || '-'}</td>
                <td className="px-6 py-4 text-sm">{student.phone || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => confirmDelete(student)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); }}
        title={selectedStudent ? '编辑学生' : '添加学生'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
              <input
                type="text"
                value={formData.student_number}
                onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={!!selectedStudent}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入学日期</label>
              <input
                type="date"
                value={formData.enrollment_date}
                onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { setShowModal(false); setError(''); }}
              disabled={submitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : (selectedStudent ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setStudentToDelete(null);
        }}
        onConfirm={() => handleDelete(studentToDelete.id)}
        title="确认删除"
        message={`确定要删除学生 "${studentToDelete?.name}" (学号: ${studentToDelete?.student_number}) 吗？此操作不可撤销。`}
      />
    </div>
  );
};

export default Students;
