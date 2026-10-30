const jwt = require('jsonwebtoken');
const userRepository = require('../src/repositories/userRepository');

/**
 * Middleware to verify JWT token from Authorization header
 * and fetch full user data from database
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartcampus_jwt_secret_key');
    
    // Fetch full user data from database
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Please contact support.',
      });
    }

    // Attach full user object to request
    req.user = user.toJSON ? user.toJSON() : user;
    req.userId = user._id; // For convenience in controllers
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
