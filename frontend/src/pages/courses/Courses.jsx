import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/coursesApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', start_date: '', end_date: '', level: 'beginner'
  });

  useEffect(() => {
    fetchCourses();
  }, [page, search]);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll(page, 10, search);
      setCourses(response.data.courses);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await coursesApi.create({
        ...formData,
        teacher_id: 1, // Will be replaced with actual user ID
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const totalPages = Math.ceil(total / 10);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                {course.level}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{course.description || 'No description'}</p>
            <div className="text-sm text-gray-500 mb-2">
              <span>📅 {course.start_date} - {course.end_date}</span>
            </div>
            {course.schedule && (
              <div className="text-sm text-gray-500 mb-4">
                <span>🕒 {course.schedule}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Teacher: {course.teacher_name}</span>
              <div className="space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800 ml-2">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
