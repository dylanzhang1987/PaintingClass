const xlsx = require('xlsx');
const Student = require('../models/student.model');

const ImportService = {
  parseExcelFile(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      return data;
    } catch (error) {
      throw new Error('Failed to parse Excel file: ' + error.message);
    }
  },

  parseCSVFile(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      return data;
    } catch (error) {
      throw new Error('Failed to parse CSV file: ' + error.message);
    }
  },

  async importStudents(data) {
    const students = [];

    for (const row of data) {
      // Map column names to student fields
      const student = {
        student_number: row['学号'] || row['student_number'] || row['studentNumber'] || '',
        name: row['姓名'] || row['name'] || '',
        gender: this.normalizeGender(row['性别'] || row['gender'] || row['Gender'] || 'other'),
        birth_date: this.normalizeDate(row['出生日期'] || row['birth_date'] || row['birthDate']),
        phone: row['电话'] || row['phone'] || '',
        email: row['邮箱'] || row['email'] || '',
        address: row['地址'] || row['address'] || '',
        enrollment_date: this.normalizeDate(row['入学日期'] || row['enrollment_date'] || row['enrollmentDate']),
        guardian_name: row['监护人姓名'] || row['guardian_name'] || row['guardianName'] || '',
        guardian_phone: row['监护人电话'] || row['guardian_phone'] || row['guardianPhone'] || '',
        notes: row['备注'] || row['notes'] || ''
      };

      if (student.student_number && student.name) {
        students.push(student);
      }
    }

    // Check for duplicates
    const studentNumbers = students.map(s => s.student_number);
    const uniqueNumbers = [...new Set(studentNumbers)];

    if (studentNumbers.length !== uniqueNumbers.length) {
      throw new Error('Duplicate student numbers found in the file');
    }

    // Import students
    const count = await Student.bulkCreate(students);

    return {
      imported: count,
      total: data.length,
      students: students
    };
  },

  normalizeGender(gender) {
    if (!gender) return 'other';
    const g = gender.toString().toLowerCase();
    if (g === '男' || g === 'male' || g === 'm') return 'male';
    if (g === '女' || g === 'female' || g === 'f') return 'female';
    return 'other';
  },

  normalizeDate(date) {
    if (!date) return null;

    // Handle Excel date numbers
    if (typeof date === 'number') {
      const excelDate = new Date((date - 25569) * 86400 * 1000);
      return excelDate.toISOString().split('T')[0];
    }

    // Handle string dates
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }

    return null;
  },

  generateTemplate() {
    const template = [
      {
        '学号': 'S001',
        '姓名': '张三',
        '性别': '男',
        '出生日期': '2010-01-01',
        '电话': '13800138000',
        '邮箱': 'student1@example.com',
        '地址': '北京市',
        '入学日期': '2023-09-01',
        '监护人姓名': '张父',
        '监护人电话': '13900139000',
        '备注': ''
      },
      {
        '学号': 'S002',
        '姓名': '李四',
        '性别': '女',
        '出生日期': '2010-02-01',
        '电话': '13800138001',
        '邮箱': 'student2@example.com',
        '地址': '上海市',
        '入学日期': '2023-09-01',
        '监护人姓名': '李母',
        '监护人电话': '13900139001',
        '备注': ''
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(template);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    return xlsx.write(workbook, { type: 'buffer' });
  }
};

module.exports = ImportService;
