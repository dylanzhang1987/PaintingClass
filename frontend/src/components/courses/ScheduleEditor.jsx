import React, { useState, useEffect } from 'react';

const DAYS_OF_WEEK = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const parseScheduleText = (text) => {
  if (!text) return [];

  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Format: "周一 13:00-15:00 教室A"
    const parts = line.trim().split(' ');
    let dayOfWeek = 0;
    let startTime = '';
    let endTime = '';
    let room = '';

    // Find day of week
    const dayMatch = DAYS_OF_WEEK.find(d => line.includes(d.label));
    if (dayMatch) {
      dayOfWeek = dayMatch.value;
      const dayIndex = line.indexOf(dayMatch.label);
      const afterDay = line.substring(dayIndex + dayMatch.label.length).trim();

      // Parse time range: "13:00-15:00 教室A"
      const timeMatch = afterDay.match(/(\d{2}:\d{2})-(\d{2}:\d{2})(.*)/);
      if (timeMatch) {
        startTime = timeMatch[1];
        endTime = timeMatch[2];
        room = timeMatch[3].trim();
      }
    }

    return {
      id: generateId(),
      dayOfWeek,
      startTime,
      endTime,
      room
    };
  }).filter(slot => slot.startTime && slot.endTime);
};

const generateScheduleText = (slots) => {
  return slots
    .map(slot => {
      const dayLabel = DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label || '周日';
      return `${dayLabel} ${slot.startTime}-${slot.endTime} ${slot.room || ''}`.trim();
    })
    .filter(line => line.trim())
    .join('\n');
};

const validateTimeFormat = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkForTimeConflicts = (slots, currentIndex) => {
  const currentSlot = slots[currentIndex];
  if (!currentSlot || !currentSlot.startTime || !currentSlot.endTime) return false;

  const currentStart = timeToMinutes(currentSlot.startTime);
  const currentEnd = timeToMinutes(currentSlot.endTime);

  for (let i = 0; i < slots.length; i++) {
    if (i === currentIndex) continue;
    const otherSlot = slots[i];
    if (!otherSlot.startTime || !otherSlot.endTime || otherSlot.dayOfWeek !== currentSlot.dayOfWeek) continue;

    const otherStart = timeToMinutes(otherSlot.startTime);
    const otherEnd = timeToMinutes(otherSlot.endTime);

    // Check for overlap
    if (currentStart < otherEnd && currentEnd > otherStart) {
      return true;
    }
  }
  return false;
};

const ScheduleEditor = ({ value, onChange, error }) => {
  const [slots, setSlots] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (value && slots.length === 0) {
      setSlots(parseScheduleText(value));
    }
  }, [value]);

  useEffect(() => {
    const text = generateScheduleText(slots);
    if (text !== value) {
      onChange(text);
    }
  }, [slots]);

  const addTimeSlot = () => {
    const newSlot = {
      id: generateId(),
      dayOfWeek: 1, // Default to Monday
      startTime: '09:00',
      endTime: '10:00',
      room: ''
    };
    setSlots([...slots, newSlot]);
  };

  const removeTimeSlot = (index) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const updateTimeSlot = (index, field, fieldValue) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: fieldValue };
    setSlots(newSlots);

    // Validate
    const slot = newSlots[index];
    const slotErrors = [];

    if (field === 'startTime' || field === 'endTime') {
      if (!validateTimeFormat(slot.startTime)) {
        slotErrors.push('开始时间格式无效 (HH:MM)');
      }
      if (!validateTimeFormat(slot.endTime)) {
        slotErrors.push('结束时间格式无效 (HH:MM)');
      }
      if (validateTimeFormat(slot.startTime) && validateTimeFormat(slot.endTime)) {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);
        if (endMinutes <= startMinutes) {
          slotErrors.push('结束时间必须晚于开始时间');
        }
      }
      if (checkForTimeConflicts(newSlots, index)) {
        slotErrors.push('与已有时间段冲突');
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [index]: slotErrors
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          课程时间安排
        </label>
        <button
          type="button"
          onClick={addTimeSlot}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + 添加时间段
        </button>
      </div>

      {slots.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
          点击 "添加时间段" 来设置课程时间
        </div>
      )}

      {slots.map((slot, index) => (
        <div key={slot.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">时间段 {index + 1}</span>
            <button
              type="button"
              onClick={() => removeTimeSlot(index)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              删除
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">星期</label>
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateTimeSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">教室</label>
              <input
                type="text"
                value={slot.room}
                onChange={(e) => updateTimeSlot(index, 'room', e.target.value)}
                placeholder="例如：教室A"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">开始时间</label>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">结束时间</label>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {validationErrors[index] && validationErrors[index].length > 0 && (
            <div className="text-xs text-red-600 space-y-1">
              {validationErrors[index].map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

export default ScheduleEditor;
