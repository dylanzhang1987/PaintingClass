import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/students', label: '学生管理', icon: '👥' },
    { path: '/courses', label: '课程管理', icon: '📚' },
    { path: '/attendance', label: '考勤记录', icon: '✅' },
    { path: '/statistics', label: '统计数据', icon: '📈' },
  ];

  if (user?.role === 'super_admin') {
    menuItems.push({ path: '/users', label: '用户管理', icon: '👤' });
    menuItems.push({ path: '/audit-logs', label: '审计日志', icon: '📝' });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Painting Class</h1>
          <p className="text-sm text-gray-500 mt-1">Management System</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role || ''}</p>
            </div>
          </div>
          <Link
            to="/change-password"
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2 block text-center"
          >
            修改密码
          </Link>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find((item) => item.path === location.pathname)?.label || '仪表盘'}
            </h2>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
