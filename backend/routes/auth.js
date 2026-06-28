const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// POST /api/auth/login — Unified login for both Admins and Customers
router.post('/login', async (req, res) => {
  try {
    // Accept either 'identifier' (new unified field) or legacy 'username' / 'loginId'
    const identifier = req.body.identifier || req.body.username || req.body.loginId;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // ── Step 1: Check Admin table first ──
    const admin = await prisma.admin.findUnique({
      where: { username: identifier }
    });

    if (admin) {
      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid Password' });
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        role: 'admin',
        admin: {
          id: admin.id,
          username: admin.username
        }
      });
    }

    // ── Step 2: Check Customer table (by email or whatsapp_number) ──
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: identifier },
          { whatsapp_number: identifier }
        ]
      }
    });

    if (customer) {
      const match = await bcrypt.compare(password, customer.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid Password' });
      }

      const token = jwt.sign(
        { id: customer.id, name: customer.name, whatsapp_number: customer.whatsapp_number, email: customer.email, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        role: 'customer',
        customer: {
          id: customer.id,
          name: customer.name,
          whatsapp_number: customer.whatsapp_number,
          email: customer.email
        }
      });
    }

    // ── Step 3: Not found in either table ──
    return res.status(401).json({ error: 'Invalid Username' });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/auth/customer/signup - Customer registration
router.post('/customer/signup', async (req, res) => {
  try {
    const { name, whatsapp_number, email, password } = req.body;

    if (!name || !whatsapp_number || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if customer with same whatsapp_number or email already exists
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { whatsapp_number },
          { email }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'A customer with this WhatsApp number or Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create customer record
    const customer = await prisma.customer.create({
      data: {
        name,
        whatsapp_number,
        email,
        password_hash: passwordHash
      }
    });

    return res.status(201).json({
      message: 'Registration successful! Please login to proceed.',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        whatsapp_number: customer.whatsapp_number
      }
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/customer/login - Customer login
router.post('/customer/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or whatsapp_number

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Login ID and password are required' });
    }

    // Find customer by email or whatsapp number
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: loginId },
          { whatsapp_number: loginId }
        ]
      }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Invalid Email/Mobile or Password' });
    }

    // Verify password
    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid Email/Mobile or Password' });
    }

    // Generate JWT token for customer
    const token = jwt.sign(
      { id: customer.id, name: customer.name, whatsapp_number: customer.whatsapp_number, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET || 'super_secret_jwt_hash_key_123_456',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        whatsapp_number: customer.whatsapp_number,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

module.exports = router;
