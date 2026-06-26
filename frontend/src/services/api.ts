/**
 * API Service for SMS OTP Verification
 *
 * Calls our backend proxy (not Bling directly) to bypass CORS.
 * In production via Docker/Nginx, the API is at the same origin.
 * In dev mode, uses VITE_API_BASE_URL if set.
 */

import type { ApiError } from '@/types';

/** Backend API base URL (empty = same origin) */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = 'http://178.128.52.104:3000';

// ========================================================================
// Mock Mode Helpers (for standalone dev without backend)
// ========================================================================

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let refCodeCounter = 0;

function generateRefCode(): string {
  refCodeCounter++;
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const counter = refCodeCounter.toString(36).toUpperCase().padStart(3, '0');
  return `REF-${timestamp}-${random}-${counter}`;
}

async function mockRequestOtp(mobile: string): Promise<{ token: string; ref_code: string }> {
  await delay(1500);
  const cleanMobile = mobile.replace(/\D/g, '');
  if (cleanMobile === '0990000000') {
    const error: ApiError = { message: 'เบอร์โทรศัพท์นี้ไม่สามารถรับ SMS ได้ กรุณาติดต่อเจ้าหน้าที่', statusCode: 400 };
    throw error;
  }
  const mockToken = `TKN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const mockRefCode = generateRefCode();
  console.log(`[MOCK] OTP requested for ${mobile}`);
  console.log(`[MOCK] Token: ${mockToken}`);
  console.log(`[MOCK] Ref Code: ${mockRefCode}`);
  return { token: mockToken, ref_code: mockRefCode };
}

async function mockVerifyOtp(token: string, pin: string): Promise<void> {
  await delay(1000);
  if (token.startsWith('TKN_EXPIRED')) {
    const error: ApiError = { message: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่', statusCode: 400 };
    throw error;
  }
  if (pin !== '123456') {
    const error: ApiError = { message: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', statusCode: 400 };
    throw error;
  }
  console.log(`[MOCK] OTP verified successfully for token: ${token}`);
}

// ========================================================================
// Public API
// ========================================================================

/**
 * Request OTP - calls backend proxy
 *
 * @param phoneNumber - Thailand mobile number (9 digits without leading 0)
 * @returns Object containing token and ref_code
 * @throws ApiError on failure
 */
export async function apiRequestOtp(phoneNumber: string): Promise<{ token: string; ref_code: string }> {
  if (MOCK_MODE) {
    return mockRequestOtp(`66${phoneNumber}`);
  }

  const response = await fetch(`${API_BASE}/api/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: `0${phoneNumber}` }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    const error: ApiError = {
      message: result.message || 'เกิดข้อผิดพลาดในการส่งรหัส OTP',
      statusCode: response.status,
    };
    throw error;
  }

  return { token: result.token, ref_code: result.ref_code };
}

/**
 * Verify OTP - calls backend proxy
 *
 * @param token - Token from requestOtp
 * @param pin - OTP code entered by user
 * @param phoneNumber - Phone number for logging
 * @throws ApiError on failure
 */
export async function apiVerifyOtp(token: string, pin: string, phoneNumber?: string): Promise<void> {
  if (MOCK_MODE) {
    return mockVerifyOtp(token, pin);
  }

  const response = await fetch(`${API_BASE}/api/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, pin, phone_number: phoneNumber || '' }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    const error: ApiError = {
      message: result.message || 'รหัส OTP ไม่ถูกต้อง',
      statusCode: response.status,
    };
    throw error;
  }
}