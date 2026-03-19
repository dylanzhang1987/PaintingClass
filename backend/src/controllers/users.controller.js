const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');

const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('teacher', 'super_admin').required(),
  is_active: Joi.boolean().default(true)
});

const UsersController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await User.findAll(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { error, value } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if username already exists
      const existingUser = await User.findByUsername(value.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(value.email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(value.password, 10);

      const userId = await User.create({
        ...value,
        password: hashedPassword
      });

      const user = await User.findById(userId);
      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { full_name, email, role, is_active } = req.body;

      if (!full_name || !email || !role) {
        return res.status(400).json({ error: 'Full name, email, and role are required' });
      }

      await User.update(req.params.id, {
        full_name,
        email,
        role,
        is_active: is_active !== undefined ? is_active : true
      });

      const user = await User.findById(req.params.id);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await User.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = UsersController;
