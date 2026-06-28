const jwt = require('jsonwebtoken');

function authenticateCustomer(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing or malformed' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Invalid or expired customer token' });
    }
    req.customer = decoded;
    next();
  });
}

module.exports = authenticateCustomer;
