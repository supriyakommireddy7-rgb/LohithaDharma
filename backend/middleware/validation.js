const validateEmailInput = (req, res, next) => {
  const { email, message } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid customer email is required.' });
  }

  // Simple regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message body cannot be empty.' });
  }

  req.body.email = email.trim().toLowerCase();
  req.body.message = message.trim();
  if (req.body.subject) {
    req.body.subject = req.body.subject.trim();
  }
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }

  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['New', 'Contacted', 'Follow-up', 'Closed'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` 
    });
  }

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  validateEmailInput,
  validateStatusUpdate,
  errorHandler
};
