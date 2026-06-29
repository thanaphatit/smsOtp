/**
 * Bling OTP API Proxy Service
 *
 * Proxies requests to Bling Innovation OTP Service API v2.1
 * so the browser doesn't need to call it directly (bypass CORS).
 */
import dotenv from 'dotenv';
dotenv.config();

const BLING_API_URL = 'https://v2.blingsms.com/gw/api.php';
const OTP_APP_KEY = process.env.OTP_APP_KEY || '';
const OTP_APP_SECRET = process.env.OTP_APP_SECRET || '';

function getBasicAuthHeader(): string {
  const credentials = `${OTP_APP_KEY}:${OTP_APP_SECRET}`;
  return Buffer.from(credentials).toString('base64');
}

function formatPhoneForApi(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `66${digits.substring(1)}`;
  }
  if (digits.startsWith('66') && digits.length >= 11) {
    return digits;
  }
  return `66${digits}`;
}

export interface RequestOtpResult {
  token: string;
  ref_code: string;
}

export interface VerifyOtpResult {
  status: string;
  desc: string;
}

export async function requestOtp(phoneNumber: string): Promise<RequestOtpResult> {
  const mobile = formatPhoneForApi(phoneNumber);

  const params = new URLSearchParams();
  params.append('cmd', 'request_otp');
  params.append('mobile', mobile);

  const response = await fetch(BLING_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuthHeader()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const result: any = await response.json();

  if (result.status === 'ERROR') {
    throw new Error(result.desc || 'Failed to request OTP');
  }

  return {
    token: result.token,
    ref_code: result.ref_code,
  };
}

export async function verifyOtp(token: string, pin: string, phoneNumber?: string): Promise<VerifyOtpResult> {
  const params = new URLSearchParams();
  params.append('cmd', 'verify_otp');
  params.append('token', token);
  params.append('pin', pin);
  if (phoneNumber) {
    params.append('mobile', formatPhoneForApi(phoneNumber));
  }

  const response = await fetch(BLING_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuthHeader()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const result: any = await response.json();

  if (result.status === 'ERROR') {
    throw new Error(result.desc || 'Failed to verify OTP');
  }

  return result;
}