const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'bhojanseva_fallback_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'bhojanseva_fallback_secret_key');
};

module.exports = { generateToken, verifyToken };
