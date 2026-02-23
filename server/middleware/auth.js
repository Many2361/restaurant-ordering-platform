const jwt = require('jsonwebtoken');

// =============================================
// PROTECT MIDDLEWARE
// =============================================
// Add this to any route that requires admin login:
//   router.get('/secret', protect, (req, res) => { ... })
//
// It checks the Authorization header for a Bearer token,
// verifies it with our JWT_SECRET, and either lets the
// request through or blocks it with a 401 error.
// =============================================

const protect = (req, res, next) => {
  try {
    // --- Step 1: Get the token from the request header ---
    // The frontend sends it like:
    //   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
      });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. Token malformed.',
      });
    }

    // --- Step 2: Verify the token ---
    // jwt.verify() checks:
    //   1. The token was signed with our JWT_SECRET
    //   2. The token hasn't expired
    // If either check fails it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- Step 3: Attach admin info to the request ---
    // Now any route that uses this middleware can access
    // req.admin to know who is making the request
    req.admin = decoded;

    // --- Step 4: Pass control to the actual route handler ---
    next();

  } catch (err) {
    // Handle specific JWT errors with clear messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        expired: true,
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token. Please log in again.',
      });
    }

    // Catch-all for any other errors
    return res.status(401).json({
      message: 'Authentication failed.',
    });
  }
};

module.exports = protect;