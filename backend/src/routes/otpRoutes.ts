/**
 * OTP Routes
 */
import { Router } from 'express';
import * as otpController from '../controllers/otpController';
import { createRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rate limiter: max 3 OTP requests per phone number per minute
const otpRequestLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  keyGenerator: (req) => req.body?.phone_number || req.ip || 'unknown',
});

// POST /api/otp/request - Request an OTP SMS
router.post('/request', otpRequestLimiter, otpController.requestOtp);

// POST /api/otp/verify - Verify an OTP code
router.post('/verify', otpController.verifyOtp);

export default router;