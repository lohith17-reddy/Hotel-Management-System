import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.ts';
import { User, UserRole } from '../../src/types/index.ts';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Authentication Middleware:
 * Verifies bearer token, auth header, or user ID.
 * Rejects with 401 if missing/invalid, or 403 if user account is disabled.
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers['x-auth-token'] as string;
  const userIdHeader = req.headers['x-user-id'] as string;
  const queryUserId = req.query.userId as string;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (tokenHeader) {
    token = tokenHeader.trim();
  }

  const users = db.get('users') || [];
  let user: User | undefined;

  if (token) {
    // Expected format: jwt_<userId>_<timestamp> or custom token
    const tokenParts = token.split('_');
    if (tokenParts.length >= 2 && tokenParts[0] === 'jwt') {
      const extractedId = tokenParts[1];
      user = users.find(u => u.id === extractedId);
    }
  }

  // Fallback to explicit userId header if valid
  if (!user && (userIdHeader || queryUserId)) {
    const lookupId = userIdHeader || queryUserId;
    user = users.find(u => u.id === lookupId);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHENTICATED',
      message: 'Your session has expired. Please log in again.'
    });
  }

  if (user.status === 'disabled' || user.status === 'inactive') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_DISABLED',
      message: 'Your account has been disabled. Please contact the administrator.'
    });
  }

  req.user = user;
  next();
}

/**
 * Role-Based Authorization Middleware:
 * Enforces that the authenticated user possesses one of the allowed roles.
 * Admins are granted global administrative authorization.
 */
export function authorize(...allowedRoles: Array<UserRole | string>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentication is required to access this resource.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    // Admin has superuser clearance
    if (userRole === 'admin' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource.'
    });
  };
}

/**
 * Hostel Scope Authorization Middleware:
 * Ensures wardens only access resources within their assigned hostel wing.
 */
export function requireHostelAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  const requestedHostelId = (req.params.hostelId || req.query.hostelId || req.body?.hostelId) as string;
  if (req.user.role === 'warden' && requestedHostelId && req.user.hostelId && req.user.hostelId !== requestedHostelId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only manage your assigned hostel wing.'
    });
  }

  next();
}
