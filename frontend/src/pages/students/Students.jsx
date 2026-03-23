import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/studentsApi';
import StudentCourseEnrollmentManager from '../../components/students/StudentCourseEnrollmentManager';
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
    phone: '',
    address: '',
    birth_date: '',
    enrollment_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Import functionality state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);

  // Course enrollment management state
  const [showCourseEnrollmentModal, setShowCourseEnrollmentModal] = useState(false);
  const [selectedStudentForCourses, setSelectedStudentForCourses] = useState(null);

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

  // Import functionality handlers
  const handleImport = () => {
    setShowImportModal(true);
    setImportFile(null);
    setImportResults(null);
  };

  const handleFileDownload = async () => {
    try {
      const response = await studentsApi.downloadTemplate();
      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('下载模板失败');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportResults(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setError('请选择要导入的文件');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await studentsApi.import(formData);
      setImportResults(response.data);
      fetchStudents();
    } catch (error) {
      console.error('Error importing students:', error);
      setError(error.response?.data?.error || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  // Course enrollment management handlers
  const handleManageCourses = (student) => {
    setSelectedStudentForCourses(student);
    setShowCourseEnrollmentModal(true);
  };

  const handleCourseEnrollmentSuccess = () => {
    fetchStudents();
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
      {error && !showModal && !showImportModal && (
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
        <div className="space-x-2">
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            导入学生
          </button>
          <button
            onClick={handleAddStudent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            添加学生
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">学号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">性别</th>
              <th className="px-6 py-3 text-left text-sm font text-gray-500">电话</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">出生日期</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">入学日期</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">已选课程</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 text-sm">{student.student_number}</td>
                <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                <td className="px-6 py-4 text-sm">{genderLabels[student.gender]}</td>
                <td className="px-6 py-4 text-sm">{student.phone || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  {student.birth_date ? student.birth_date.split('T')[0] : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {student.enrollment_date ? student.enrollment_date.split('T')[0] : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {student.enrollment_count !== undefined ? student.enrollment_count : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleManageCourses(student)}
                    className="text-green-600 hover:text-green-800 mr-3"
                  >
                    管理课程
                  </button>
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

      {/* Student Form Modal */}
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

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setError(''); }}
        title="导入学生"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">导入说明</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>请下载模板文件并按照格式填写学生信息</li>
              <li>支持 Excel (.xlsx) 和 CSV (.csv) 格式</li>
              <li>学号和姓名为必填字段</li>
            </ul>
          </div>

          <button
            onClick={handleFileDownload}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📥 下载导入模板
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择文件</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {importFile && (
            <div className="text-sm text-gray-600">
              已选择文件: {importFile.name}
            </div>
          )}

          {importResults && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">导入结果</h4>
              <div className="text-sm text-green-700">
                <p>成功导入: {importResults.success} 条</p>
                {importResults.errors > 0 && (
                  <p className="text-red-600">失败: {importResults.errors} 条</p>
                )}
                {importResults.duplicates > 0 && (
                  <p className="text-yellow-600">跳过重复: {importResults.duplicates} 条</p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { setShowImportModal(false); setError(''); }}
              disabled={importing}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={importing || !importFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? '导入中...' : '开始导入'}
            </button>
          </div>
        </div>
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

      {/* Course Enrollment Management Modal */}
      {showCourseEnrollmentModal && selectedStudentForCourses && (
        <StudentCourseEnrollmentManager
          studentId={selectedStudentForCourses.id}
          studentName={selectedStudentForCourses.name}
          onClose={() => setShowCourseEnrollmentModal(false)}
          onSuccess={handleCourseEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default Students;
