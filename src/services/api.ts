/**
 * API Service for SMS OTP Verification
 *
 * Uses Bling Innovation OTP Service API v2.1 for OTP operations.
 * API Reference: https://v2.blingsms.com/gw/api.php
 *
 * Flow:
 *   1. request_otp → sends OTP SMS to user's phone
 *   2. verify_otp  → verifies PIN entered by user
 *
 * Authentication: HTTP Basic Auth with App Key and App Secret
 *   - Encode "AppKey:AppSecret" as Base64
 *   - Pass via Authorization: Basic header
 *
 * Production CORS Note:
 *   The Bling API does not support CORS, so you cannot call it directly
 *   from a browser in production. There are two solutions:
 *   (a) Set VITE_MOCK_MODE=true for static demo/preview
 *   (b) Set VITE_API_PROXY_URL to a backend proxy that forwards requests
 *       to Bling API and returns the response (solves CORS).
 */

import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  ApiError,
} from '@/types'

/** Bling Innovation OTP API endpoint (with proxy override support for production) */
const API_BASE_URL = import.meta.env.VITE_API_PROXY_URL
  || import.meta.env.VITE_API_BASE_URL
  || 'https://v2.blingsms.com/gw/api.php'

/** Bling OTP Service credentials (App Key and App Secret) */
const OTP_APP_KEY = import.meta.env.VITE_OTP_APP_KEY ?? ''
const OTP_APP_SECRET = import.meta.env.VITE_OTP_APP_SECRET ?? ''

/** Enable mock mode for local dev / static preview without real SMS gateway */
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

// ========================================================================
// Mock Mode Helpers
// ========================================================================

/**
 * Simulate network delay for mock mode
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a unique reference code for OTP transactions.
 * Combines timestamp (base36) + random characters + counter to guarantee uniqueness
 * even for rapid successive calls within the same millisecond.
 */
let refCodeCounter = 0

function generateRefCode(): string {
  refCodeCounter++
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const counter = refCodeCounter.toString(36).toUpperCase().padStart(3, '0')
  return `REF-${timestamp}-${random}-${counter}`
}

/**
 * Mock request_otp — returns fake token + ref_code
 */
async function mockRequestOtp(mobile: string): Promise<{ token: string; ref_code: string }> {
  await delay(1500)

  // Simulate failure for specific test phone number
  const cleanMobile = mobile.replace(/\D/g, '')
  if (cleanMobile === '0990000000') {
    const error: ApiError = {
      message: 'เบอร์โทรศัพท์นี้ไม่สามารถรับ SMS ได้ กรุณาติดต่อเจ้าหน้าที่',
      statusCode: 400,
    }
    throw error
  }

  const mockToken = `TKN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  const mockRefCode = generateRefCode()
  console.log(`[MOCK] OTP requested for ${mobile}`)
  console.log(`[MOCK] Token: ${mockToken}`)
  console.log(`[MOCK] Ref Code: ${mockRefCode}`)
  return { token: mockToken, ref_code: mockRefCode }
}

/**
 * Mock verify_otp — accepts PIN "123456" as valid for testing
 */
async function mockVerifyOtp(token: string, pin: string): Promise<void> {
  await delay(1000)

  // Simulate expired token
  if (token.startsWith('TKN_EXPIRED')) {
    const error: ApiError = {
      message: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่',
      statusCode: 400,
    }
    throw error
  }

  // In mock mode, "123456" is the test OTP
  if (pin !== '123456') {
    const error: ApiError = {
      message: 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      statusCode: 400,
    }
    throw error
  }

  console.log(`[MOCK] OTP verified successfully for token: ${token}`)
}

// ========================================================================
// Real API Helpers
// ========================================================================

/**
 * Generate Base64-encoded Basic Auth header
 * Per Bling OTP API spec (Page 6):
 *   Encode "AppKey:AppSecret" as Base64
 *   Pass via Authorization: Basic <base64>
 */
function getBasicAuthHeader(): string {
  const credentials = `${OTP_APP_KEY}:${OTP_APP_SECRET}`
  return btoa(credentials)
}

/**
 * Format phone number to Thai mobile format for Bling OTP API.
 * Accepts formats: "0812345678", "66812345678", "081-234-5678"
 * Returns: "66812345678"
 *
 * Per documentation (Page 7):
 *   Thailand Mobile Number to receive SMS.
 *   E.g: 08123456789 or 668123456789 (Allow both 66 and 0 Prefix).
 */
export function formatPhoneForApi(phoneNumber: string): string {
  // Strip all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')

  // If starts with 0, replace with 66
  if (digits.startsWith('0')) {
    return `66${digits.substring(1)}`
  }

  // If starts with 66, return as-is (ensure minimum length)
  if (digits.startsWith('66') && digits.length >= 11) {
    return digits
  }

  // Otherwise prepend 66
  return `66${digits}`
}

/**
 * Execute a Bling OTP API call with form-data body and Basic Auth.
 * Uses multipart/form-data (FormData) as the spec says "Body: form-data".
 * Note: In production via proxy, the backend must forward the body as-is.
 */
async function callBlingApi(
  params: Record<string, string>,
): Promise<Response> {
  const formData = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value)
  }

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuthHeader()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  return response
}

// ========================================================================
// Public API
// ========================================================================

/**
 * Request OTP from Bling Innovation OTP Service
 *
 * Sends HTTP POST with application/x-www-form-urlencoded body
 * and Basic Authentication header.
 *
 * Reference: Bling Innovation OTP Service API v2.1 - Request OTP (Page 7)
 *
 * In mock mode, returns a simulated response without calling the real API.
 *
 * @param phoneNumber - Thailand mobile number to receive SMS
 * @returns Object containing token and ref_code from the server
 * @throws ApiError on failure
 */
export async function requestOtp(phoneNumber: string): Promise<{ token: string; ref_code: string }> {
  const mobile = formatPhoneForApi(phoneNumber)

  if (MOCK_MODE) {
    return mockRequestOtp(mobile)
  }

  const response = await callBlingApi({
    cmd: 'request_otp',
    mobile: mobile,
  })

  const result: RequestOtpResponse = await response.json()

  if (result.status === 'ERROR') {
    const errorMessages: Record<string, string> = {
      'Invalid Parameters': 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบ',
      'Invalid Authentication': 'ข้อมูลการยืนยันตัวตนไม่ถูกต้อง กรุณาตรวจสอบ App Key และ App Secret',
      'Insufficient Credit': 'เครดิตไม่เพียงพอ กรุณาเติมเครดิต',
      'No Valid Mobile Found': 'เบอร์โทรศัพท์มือถือไม่ถูกต้อง กรุณาตรวจสอบ',
    }

    const error: ApiError = {
      message: errorMessages[result.desc] ?? `เกิดข้อผิดพลาด: ${result.desc}`,
      statusCode: response.status,
    }
    throw error
  }

  return {
    token: result.token,
    ref_code: result.ref_code,
  }
}

/**
 * Verify OTP code via Bling Innovation OTP Service
 *
 * Sends HTTP POST with the token (from request_otp) and the PIN
 * entered by the user. Server validates the OTP.
 *
 * Reference: Bling Innovation OTP Service API v2.1 - Verify OTP (Page 8)
 *
 * In mock mode, PIN "123456" is accepted as valid for testing.
 *
 * @param token - Token received from request_otp()
 * @param pin - PIN code entered by the user (6 digits)
 * @throws ApiError on failure (wrong PIN, expired, etc.)
 */
export async function verifyOtp(token: string, pin: string): Promise<void> {
  if (MOCK_MODE) {
    return mockVerifyOtp(token, pin)
  }

  const response = await callBlingApi({
    cmd: 'verify_otp',
    token: token,
    pin: pin,
  })

  const result: VerifyOtpResponse = await response.json()

  if (result.status === 'ERROR') {
    const errorMessages: Record<string, string> = {
      'Invalid Parameters': 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบ',
      'Invalid Authentication': 'ข้อมูลการยืนยันตัวตนไม่ถูกต้อง',
      'OTP Code is expired': 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่',
      'OTP Code is used or expired': 'รหัส OTP ถูกใช้ไปแล้วหรือหมดอายุ กรุณาขอรหัสใหม่',
    }

    const error: ApiError = {
      message: errorMessages[result.desc] ?? `เกิดข้อผิดพลาด: ${result.desc}`,
      statusCode: response.status,
    }
    throw error
  }
}

/**
 * Generate a mock OTP code for testing purposes (kept for compatibility).
 * In production, OTP is generated and sent server-side by Bling.
 */
export function generateOtpCode(length: number = 6): string {
  const digits: string[] = []
  for (let i = 0; i < length; i++) {
    digits.push(Math.floor(Math.random() * 10).toString())
  }
  return digits.join('')
}