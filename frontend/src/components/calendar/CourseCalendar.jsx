import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getMonthHolidays, getHolidayName } from '../../utils/holidayUtils';
import CourseDetailModal from './CourseDetailModal';

const CourseCalendar = ({ courses = [], onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // Fetch holidays for current month
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthHolidays = await getMonthHolidays(year, month);
      setHolidays(monthHolidays);
      setLoadingHolidays(false);
    };

    fetchHolidays();
  }, [currentDate]);

  // Get holidays for a specific date
  const getDateHoliday = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateStr && h.isHoliday);
  };

  // Check if date is a workday (makeup day)
  const isDateWorkday = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.some(h => h.date === dateStr && h.isWorkday);
  };

  // Get courses for a specific date
  const getDateCourses = useCallback((date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return courses.filter(course => {
      if (!course.schedule) return false;

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(course.schedule);
        if (Array.isArray(parsed)) {
          return parsed.some(s => s.dayOfWeek === dayOfWeek);
        }
      } catch (e) {
        // Not JSON, parse as text
      }

      // Parse text format: "周一 09:00-11:00 教室A"
      const lines = course.schedule.split('\n').filter(line => line.trim());
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      return lines.some(line => {
        const match = line.match(/^(\S+)/);
        if (match) {
          const scheduleDayName = match[1];
          const scheduleDayIndex = dayNames.indexOf(scheduleDayName);
          return scheduleDayIndex === dayOfWeek;
        }
        return false;
      });
    });
  }, [courses]);

  // Get days for calendar grid
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCourseClick = (course, e) => {
    e.stopPropagation();
    setSelectedCourse(course);
  };

  const handleDateCellClick = (date) => {
    const dayCourses = getDateCourses(date);
    if (dayCourses.length === 1) {
      setSelectedCourse(dayCourses[0]);
    } else if (onDateClick) {
      onDateClick(date);
    }
  };

  const calendarDays = getCalendarDays();
  const currentMonth = format(currentDate, 'yyyy年 M月', { locale: zhCN });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{currentMonth}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="上个月"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleGoToToday}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            今天
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="下个月"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isTodayDate = isToday(date);
          const holiday = getDateHoliday(date);
          const isWorkdayDate = isDateWorkday(date);
          const dayCourses = getDateCourses(date);

          return (
            <div
              key={index}
              onClick={() => handleDateCellClick(date)}
              className={`
                min-h-[100px] border rounded-lg p-2 cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isTodayDate ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}
                ${dayCourses.length > 0 ? 'hover:shadow-md' : ''}
              `}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {format(date, 'd')}
                </span>

                {/* Holiday or Workday Indicator */}
                {holiday && (
                  <div className="text-xs text-red-600" title={holiday.name}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {isWorkdayDate && !holiday && (
                  <div className="text-xs text-blue-600" title="补班日">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Holiday Name */}
              {holiday && (
                <div className="text-xs text-red-600 mb-1 truncate">{holiday.name}</div>
              )}

              {/* Courses */}
              <div className="space-y-1">
                {dayCourses.slice(0, 3).map((course) => (
                  <button
                    key={course.id}
                    onClick={(e) => handleCourseClick(course, e)}
                    className={`
                      w-full text-left px-2 py-1 rounded text-xs font-medium truncate
                      transition-colors hover:shadow-sm
                      ${course.level === 'beginner' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                      ${course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                      ${course.level === 'advanced' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                      ${!course.level ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                    `}
                    title={course.name}
                  >
                    {course.name}
                  </button>
                ))}
                {dayCourses.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayCourses.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
          <span className="text-gray-600">初级课程</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
          <span className="text-gray-600">中级课程</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
          <span className="text-gray-600">高级课程</span>
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};

export default CourseCalendar;
