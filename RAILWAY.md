# Railway 部署指南

本项目已配置为在 Railway 平台部署。以下是详细的部署步骤和配置说明。

## 部署架构

本应用分为两个独立服务：

1. **后端服务** (backend) - Express.js API + MySQL 数据库
2. **前端服务** (frontend) - React + Vite 静态站点

## 前置要求

- Railway 账号
- GitHub 仓库（已推送到 https://github.com/dylanzhang1987/PaintingClass）

## 部署步骤

### 1. 部署后端服务

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 **New Project**
3. 选择 **Deploy from GitHub repo**
4. 选择 `PaintingClass` 仓库
5. 在 **Root Directory** 输入 `backend`
6. 点击 **Deploy** 等待构建完成

### 配置后端环境变量

部署完成后，添加以下环境变量：

在 Railway Dashboard 中点击项目 → Settings → Variables

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3000` |
| `DB_HOST` | 数据库主机 | Railway MySQL 服务生成的 URL |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | Railway MySQL 生成的用户名 |
| `DB_PASSWORD` | 数据库密码 | Railway MySQL 生成的密码 |
| `DB_NAME` | 数据库名 | `painting_class` |
| `JWT_SECRET` | JWT 密钥 | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `FRONTEND_URL` | 前端 URL（用于 CORS） | Railway 前端服务生成的 URL |

### 添加 MySQL 数据库

1. 在项目页面点击 **New Service**
2. 选择 **Database** → **MySQL**
3. 默认配置即可，点击 **Create**
4. 创建后，点击 **Variables** 复制以下信息：
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

将这些值映射到后端服务的环境变量中。

### 初始化数据库

在 Railway Dashboard 中，你可以使用 MySQL Console 运行初始化脚本：

```sql
-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100),
  role ENUM('super_admin', 'teacher') DEFAULT 'teacher',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 创建学生表
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  birth_date DATE,
  enrollment_date DATE
);

-- 3. 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  teacher_id INT,
  start_date DATE,
  end_date DATE,
  max_students INT DEFAULT 30,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- 4. 创建考勤记录表
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  course_id INT,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY unique_attendance (student_id, course_id, date)
);

-- 5. 创建默认管理员账户
INSERT INTO users (username, password, full_name, email, role)
VALUES ('admin', '$2b$10$exampleHash...', 'System Admin', 'admin@example.com', 'super_admin')
ON DUPLICATE KEY UPDATE id=id;
```

⚠️ **注意**：上面的密码哈希需要使用实际的 bcrypt 哈希替换。

### 2. 部署前端服务

1. 在同一项目中，点击 **New Service**
2. 选择 **Deploy from GitHub repo**
3. 选择 `PaintingClass` 仓库
4. 在 **Root Directory** 输入 `frontend`
5. 添加环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | 后端服务生成的 URL + `/api` |

6. 点击 **Deploy**

### 3. 配置域名（可选）

Railway 会自动生成一个域名。你也可以：

1. 在服务设置中点击 **Networking**
2. 点击 **Custom Domain**
3. 添加你自己的域名
4. 按照提示配置 DNS 记录

## 常见问题排查

### 问题 1：前端无法连接后端 API

**症状**：网络错误、CORS 错误或 401 Unauthorized

**解决方案**：

1. 确认后端和前端都已成功部署
2. 检查前端 `VITE_API_URL` 环境变量是否正确设置
3. 检查后端 `FRONTEND_URL` 环境变量是否包含前端域名
4. 查看后端日志确认是否有 CORS 错误

### 问题 2：数据库连接失败

**症状**：后端日志显示数据库连接错误

**解决方案**：

1. 确认 MySQL 服务已创建并运行
2. 检查后端环境变量中的数据库连接信息是否正确
3. 确认数据库表已正确创建

### 问题 3：部署构建失败

**症状**：构建过程中出现错误

**解决方案**：

1. 查看构建日志定位具体错误
2. 确认 `package.json` 中所有依赖正确配置
3. 检查是否有语法错误

### 问题 4：健康检查失败

**症状**：Railway 显示服务不健康

**解决方案**：

1. 确认后端 `/health` 端点正常工作
2. 检查端口配置是否正确
3. 确认服务正常启动

## 验证部署

部署完成后，通过以下方式验证：

1. 访问前端服务生成的 URL，应该看到登录页面
2. 使用默认账户登录：`admin` / `admin123`
3. 检查页面功能是否正常
4. 查看浏览器控制台确认没有 API 错误

## 监控和日志

在 Railway Dashboard 中：

- **Logs**：查看服务运行日志
- **Metrics**：查看资源使用情况
- **Settings**：修改配置和环境变量
- **Triggers**：配置自动部署

## 更新部署

当推送到 GitHub 的 `main` 分支时，Railway 会自动触发重新部署。

若要手动触发：

1. 在服务页面点击 **Redeploy** 按钮
2. 或推送一个新提交到 GitHub

## 技术支持

如遇到问题：

1. 查看 Railway 文档：https://docs.railway.app
2. 检查项目 GitHub Issues
3. 查看 Railway 支持中心
