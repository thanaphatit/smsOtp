/** Types for OTP Verification Module using Bling Innovation OTP Service API v2.1 */

/**
 * Bling Innovation OTP API v2.1 - Request OTP Response (Success)
 * Reference: Bling Innovation OTP Service API - V2.1 (Page 7)
 *
 * Server generates OTP and sends via SMS to the mobile number.
 * Returns token and ref_code for later verification.
 */
export interface RequestOtpSuccessResponse {
  status: 'SUCCESS'
  desc: 'SUCCESS'
  /** OTP token for verification */
  token: string
  /** Reference code for tracking */
  ref_code: string
}

/**
 * Bling Innovation OTP API v2.1 - Request OTP Response (Error)
 */
export interface RequestOtpErrorResponse {
  status: 'ERROR'
  desc:
    | 'Invalid Parameters'
    | 'Invalid Authentication'
    | 'Insufficient Credit'
    | 'No Valid Mobile Found'
}

/**
 * Union type for request_otp response
 */
export type RequestOtpResponse = RequestOtpSuccessResponse | RequestOtpErrorResponse

/**
 * Bling Innovation OTP API v2.1 - Verify OTP Response (Success)
 * Reference: Bling Innovation OTP Service API - V2.1 (Page 8)
 *
 * Server validates the PIN against the previously generated OTP.
 */
export interface VerifyOtpSuccessResponse {
  status: 'SUCCESS'
  desc: 'OTP code is correct.'
}

/**
 * Bling Innovation OTP API v2.1 - Verify OTP Response (Error)
 */
export interface VerifyOtpErrorResponse {
  status: 'ERROR'
  desc:
    | 'Invalid Parameters'
    | 'Invalid Authentication'
    | 'OTP Code is expired'
    | 'OTP Code is used or expired'
}

/**
 * Union type for verify_otp response
 */
export type VerifyOtpResponse = VerifyOtpSuccessResponse | VerifyOtpErrorResponse

/**
 * Generic API Error
 */
export interface ApiError {
  message: string
  statusCode?: number
}

/** Environment steps for the OTP flow */
export enum OtpStep {
  /** Initial step: Enter phone number */
  PHONE_INPUT = 'phone_input',
  /** Step: OTP sent, enter OTP code */
  OTP_INPUT = 'otp_input',
  /** Step: Verified successfully */
  SUCCESS = 'success',
}