import React from 'react';

const CourseDetailModal = ({ course, onClose }) => {
  if (!course) return null;

  const levelLabels = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '未设置';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return [];

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(scheduleStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, parse as text
    }

    // Parse text format: "周一 09:00-11:00 教室A"
    const lines = scheduleStr.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const match = line.match(/(\S+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})\s*(.*)/);
      if (match) {
        return {
          dayOfWeek: match[1],
          startTime: match[2],
          endTime: match[3],
          room: match[4].trim() || '未设置'
        };
      }
      return { raw: line };
    });
  };

  const schedules = parseSchedule(course.schedule);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">课程详情</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Course Name */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>
              {course.description && (
                <p className="text-gray-600 text-sm">{course.description}</p>
              )}
            </div>

            {/* Course Info Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">授课老师</p>
                <p className="text-sm font-medium text-gray-800">{course.teacher_name || '未设置'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">课程级别</p>
                <p className="text-sm font-medium text-gray-800">
                  {levelLabels[course.level] || course.level || '未设置'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">开始日期</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(course.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">结束日期</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(course.end_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">最大学生数</p>
                <p className="text-sm font-medium text-gray-800">{course.max_students || '不限'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">当前学生数</p>
                <p className="text-sm font-medium text-gray-800">{course.student_count || 0}</p>
              </div>
              {course.fee !== null && course.fee !== undefined && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">课程费用</p>
                  <p className="text-sm font-medium text-gray-800">¥{course.fee}</p>
                </div>
              )}
            </div>

            {/* Schedule */}
            {schedules.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">上课时间</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {schedules.map((schedule, index) => (
                    <div key={index} className="text-sm">
                      {schedule.raw ? (
                        <p className="text-gray-700">{schedule.raw}</p>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{schedule.dayOfWeek}</span>
                          <span className="text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          {schedule.room && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {schedule.room}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
