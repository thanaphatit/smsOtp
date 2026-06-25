/**
 * OTP Controller
 *
 * Handles OTP request/verify operations.
 * Acts as a proxy to Bling OTP API with logging.
 */
import { Request, Response } from 'express';
import { OtpLog } from '../models';
import * as blingApi from '../services/blingApi';

/**
 * Request OTP - sends OTP SMS to the given phone number
 * POST /api/otp/request
 */
export async function requestOtp(req: Request, res: Response): Promise<void> {
  const { phone_number } = req.body;

  if (!phone_number) {
    res.status(400).json({
      success: false,
      message: 'กรุณากรอกเบอร์โทรศัพท์',
    });
    return;
  }

  // Validate phone number format
  const digits = phone_number.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 12) {
    res.status(400).json({
      success: false,
      message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
    });
    return;
  }

  try {
    // Call Bling OTP API
    const result = await blingApi.requestOtp(digits);

    // Log the OTP request
    await OtpLog.create({
      phoneNumber: digits,
      action: 'request_otp',
      token: result.token,
      refCode: result.ref_code,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'pending',
      responseData: JSON.stringify(result),
    });

    res.json({
      success: true,
      token: result.token,
      ref_code: result.ref_code,
    });
  } catch (error: any) {
    const message = error.message || 'เกิดข้อผิดพลาดในการส่งรหัส OTP';

    // Log the failed request
    await OtpLog.create({
      phoneNumber: digits,
      action: 'request_otp',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'failed',
      responseData: JSON.stringify({ error: message }),
    });

    res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * Verify OTP - verifies the OTP code entered by the user
 * POST /api/otp/verify
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { token, pin, phone_number } = req.body;

  if (!token || !pin) {
    res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    });
    return;
  }

  if (pin.length < 4 || pin.length > 8) {
    res.status(400).json({
      success: false,
      message: 'รหัส OTP ไม่ถูกต้อง',
    });
    return;
  }

  try {
    // Call Bling OTP API to verify
    await blingApi.verifyOtp(token, pin);

    // Log successful verification
    await OtpLog.create({
      phoneNumber: phone_number || '',
      action: 'verify_success',
      token,
      pin,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    res.json({
      success: true,
      message: 'ยืนยันตัวตนสำเร็จ',
    });
  } catch (error: any) {
    const message = error.message || 'รหัส OTP ไม่ถูกต้อง';

    // Log failed verification
    await OtpLog.create({
      phoneNumber: phone_number || '',
      action: 'verify_failed',
      token,
      pin,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'failed',
      responseData: JSON.stringify({ error: message }),
    });

    res.status(400).json({
      success: false,
      message,
    });
  }
}