import React, { useEffect, useState } from 'react';
import { statisticsApi } from '../../api/statisticsApi';
import ChartComponent from '../../components/charts/ChartComponent';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statisticsApi.getDashboard();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  const getAttendanceChartOption = () => {
    if (!stats?.attendance) return {};

    return {
      title: { text: 'Attendance (Last 30 Days)' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Present', 'Absent', 'Late', 'Excused']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          stats.attendance.present || 0,
          stats.attendance.absent || 0,
          stats.attendance.late || 0,
          stats.attendance.excused || 0
        ],
        itemStyle: {
          color: ['#10B981', '#EF4444', '#F59E0B', '#6366F1']
        }
      }]
    };
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div>
      <ErrorMessage message={error} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.students || 0}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-green-600">{stats?.courses || 0}</p>
            </div>
            <span className="text-4xl">📚</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Enrollments</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.enrollments || 0}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.attendance?.total
                  ? Math.round((stats?.attendance?.present / stats.attendance.total) * 100)
                  : 0}%
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <ChartComponent option={getAttendanceChartOption()} height="350px" />
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 text-sm">
                <span className="text-gray-400">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
                <span className="font-medium">{activity.full_name || 'System'}</span>
                <span className="text-gray-500">{activity.action} {activity.entity_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
