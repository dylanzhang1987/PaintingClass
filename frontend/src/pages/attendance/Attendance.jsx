import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/coursesApi';
import { attendanceApi } from '../../api/attendanceApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll(1, 100, '');
      setCourses(response.data.courses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('获取课程失败');
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await attendanceApi.getByCourseAndDate(selectedCourse, selectedDate);
      setAttendanceRecords(response.data.attendance || []);
      setError('');
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
([]);
    }

    // Fetch course students
    try {
      const courseResponse = await coursesApi.getById(selectedCourse);
      setStudents(courseResponse.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setSubmitting(true);
    setError('');

    try {
      const existingRecord = attendanceRecords.find(
        record => record.student_id === studentId
      );

      if (existingRecord) {
        await attendanceApi.update(existingRecord.id, { status: newStatus });
      } else {
        await attendanceApi.record({
          course_id: parseInt(selectedCourse),
          student_id: studentId,
          date: selectedDate,
          status: newStatus,
          notes: ''
        });
      }

      await fetchAttendanceData();
    } catch (error) {
      setError(error.response?.data?.error || '更新考勤失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record?.status || 'pending';
  };

  const statusLabels = {
    present: '出席',
    absent: '缺席',
    late: '迟到',
    excused: '请假',
    pending: '未记录'
  };

  const statusColors = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-yellow-500',
    excused: 'bg-blue-500',
    pending: 'bg-gray-300'
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">选择课程</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">请选择课程...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">选择日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}
      </div>

      {!selectedCourse ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          请选择课程和日期以记录考勤
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          该课程暂无学生，请先添加学生
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">
              总共 {students.length} 名学生
              &nbsp;|&nbsp;
              已记录: {attendanceRecords.length} 人
            </p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">学号</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">当前状态</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">考勤状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => {
                const currentStatus = getStudentAttendanceStatus(student.id);
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 text-sm font-medium">
                      {student.student_number}
                    </td>
                    <td className="px-6 py-4 text-sm">{student.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColors[currentStatus]}`}>
                        {statusLabels[currentStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {['present', 'absent', 'late', 'excused'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            disabled={submitting}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              currentStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {statusLabels[status]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
