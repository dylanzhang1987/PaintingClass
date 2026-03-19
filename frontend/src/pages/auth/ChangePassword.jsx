import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.oldPassword.trim()) {
      return '请输入当前密码';
    }
    if (!formData.newPassword.trim()) {
      return '请输入新密码';
    }
    if (formData.newPassword.length < 6) {
      return '新密码至少需要6个字符';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return '两次输入的新密码不一致';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const result = await changePassword(formData.oldPassword, formData.newPassword);

    if (result.success) {
      setSuccess('密码修改成功！');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">修改密码</h1>
          <p className="text-gray-500 mt-2">Change Password</p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">当前密码</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">新密码</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">确认新密码</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? '修改中...' : '修改密码'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            返回仪表盘
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
