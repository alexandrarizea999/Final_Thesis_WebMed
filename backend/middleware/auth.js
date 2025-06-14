const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const auth = (req, res, next) => {
  try {
    let token;
    if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    } 
    else if (req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    } 
    else {
      throw new Error('No authentication token provided');
    }   
    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication required' });
  }
};
module.exports = auth; 