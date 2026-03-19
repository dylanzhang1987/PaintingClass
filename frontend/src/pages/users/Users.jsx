import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/usersApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'teacher',
    is_active: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll(page, 10, search);
      setUsers(response.data.users);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      role: 'teacher',
      is_active: true
    });
    setError('');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
      } else {
        await usersApi.create(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await usersApi.delete(id);
      fetchUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || '删除失败');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const totalPages = Math.ceil(total / 10);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          添加用户
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">用户名</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">邮箱</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">角色</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm font-medium">{user.username}</td>
                <td className="px-6 py-4 text-sm">{user.full_name}</td>
                <td className="px-6 py-4 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role === 'super_admin' ? '超级管理员' : '教师'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.is_active ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">启用</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">禁用</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {handleEditUser(user)}}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => confirmDelete(user)}
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

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingUser ? '编辑用户' : '添加用户'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码 {editingUser && '(留空不修改)'}
                  </label>
                  <input
                    type={editingUser ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '留空不修改密码' : ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="teacher">教师</option>
                    <option value="super_admin">超级管理员</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="true">启用</option>
                    <option value="false">禁用</option>
                  </select>
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={() => handleDelete(userToDelete.id)}
        title="确认删除"
        message={`确定要删除用户 "${userToDelete?.username}" 吗？此操作不可撤销。`}
      />
    </div>
  );
};

export default Users;
