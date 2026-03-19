const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const isAdmin = roleMiddleware(['super_admin']);
const isTeacherOrAdmin = roleMiddleware(['teacher', 'super_admin']);

module.exports = { roleMiddleware, isAdmin, isTeacherOrAdmin };
