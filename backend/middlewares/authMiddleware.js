const jwt = require('jsonwebtoken');

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'machoako';
    
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET); // Verify the token
    req.user = verified; // Attach decoded data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
