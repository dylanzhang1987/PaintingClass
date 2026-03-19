const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const AuthService = require('../services/auth.service');

const AuthController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req, res) {
    try {
      await AuthService.logout(req.user.id, req.token);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCurrentUser(req, res) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords are required' });
      }

      const user = await User.findById(req.user.id);
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid old password' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.update(req.user.id, { ...user, password: hashedPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = AuthController;
