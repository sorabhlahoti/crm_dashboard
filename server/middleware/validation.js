// Validation middleware for requests

/**
 * Validates customer data in requests
 */
function validateCustomer(req, res, next) {
  const { name, email } = req.body;
  
  const errors = [];
  
  // Required fields
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email is invalid');
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
}

/**
 * Validates user data in requests
 */
function validateUser(req, res, next) {
  const { name, email, password } = req.body;
  
  const errors = [];
  
  // Required fields
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email is invalid');
  }
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
}

/**
 * Check if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateCustomer,
  validateUser
};