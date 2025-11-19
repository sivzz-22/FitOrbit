import { protect } from './auth.js';

export const adminOnly = (req, res, next) => {
  protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
  });
};

