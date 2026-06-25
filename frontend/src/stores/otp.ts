/**
 * Pinia Store for OTP Verification
 *
 * Manages the OTP verification flow state.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiRequestOtp, apiVerifyOtp } from '@/services/api';

export enum OtpStep {
  PHONE_INPUT = 'phone_input',
  OTP_INPUT = 'otp_input',
  SUCCESS = 'success',
}

export const useOtpStore = defineStore('otp', () => {
  // ============================================================
  // State
  // ============================================================
  const currentStep = ref<OtpStep>(OtpStep.PHONE_INPUT);
  const phoneNumber = ref('');
  const phoneError = ref<string | null>(null);
  const otpCode = ref<string[]>([]);
  const otpToken = ref<string | null>(null);
  const refCode = ref<string | null>(null);
  const countdown = ref(0);
  const isSendingOtp = ref(false);
  const isVerifyingOtp = ref(false);
  const errorMessage = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  const OTP_LENGTH = 6;
  const COUNTDOWN_DURATION = 60;

  // ============================================================
  // Getters
  // ============================================================
  const isPhoneValid = computed(() => /^[0-9]{9}$/.test(phoneNumber.value));

  const isOtpComplete = computed(() =>
    otpCode.value.length === OTP_LENGTH && otpCode.value.every((d) => d !== '')
  );

  const formatCountdown = computed(() => {
    const minutes = Math.floor(countdown.value / 60);
    const seconds = countdown.value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  const maskedPhone = computed(() => {
    if (!phoneNumber.value) return '';
    const digits = phoneNumber.value.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    return `0${digits.substring(0, 2)}-xxx-${digits.substring(digits.length - 4)}`;
  });

  // ============================================================
  // Actions
  // ============================================================
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  function startCountdown() {
    stopCountdown();
    countdown.value = COUNTDOWN_DURATION;
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        stopCountdown();
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function onPhoneInput(value: string) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    phoneNumber.value = digits;
    phoneError.value = null;
    errorMessage.value = null;
  }

  function validatePhone(): boolean {
    if (!phoneNumber.value) {
      phoneError.value = 'กรุณากรอกเบอร์โทรศัพท์';
      return false;
    }
    if (!/^[0-9]{9}$/.test(phoneNumber.value)) {
      phoneError.value = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9 หลัก)';
      return false;
    }
    return true;
  }

  async function requestOtp(): Promise<boolean> {
    if (!validatePhone()) return false;

    isSendingOtp.value = true;
    errorMessage.value = null;
    phoneError.value = null;

    try {
      const { token, ref_code } = await apiRequestOtp(phoneNumber.value);
      otpToken.value = token;
      refCode.value = ref_code;
      otpCode.value = Array(OTP_LENGTH).fill('');
      startCountdown();
      currentStep.value = OtpStep.OTP_INPUT;
      return true;
    } catch (error: any) {
      errorMessage.value = error.message ?? 'เกิดข้อผิดพลาดในการส่งรหัส OTP กรุณาลองใหม่อีกครั้ง';
      return false;
    } finally {
      isSendingOtp.value = false;
    }
  }

  async function verifyOtp(): Promise<boolean> {
    if (!isOtpComplete.value || !otpToken.value) return false;

    isVerifyingOtp.value = true;
    errorMessage.value = null;

    try {
      const pin = otpCode.value.join('');
      await apiVerifyOtp(otpToken.value, pin, phoneNumber.value);
      currentStep.value = OtpStep.SUCCESS;
      successMessage.value = 'ยืนยันตัวตนสำเร็จ';
      stopCountdown();
      return true;
    } catch (error: any) {
      errorMessage.value = error.message ?? 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      otpCode.value = Array(OTP_LENGTH).fill('');
      return false;
    } finally {
      isVerifyingOtp.value = false;
    }
  }

  function goBackToPhone() {
    currentStep.value = OtpStep.PHONE_INPUT;
    errorMessage.value = null;
    stopCountdown();
    countdown.value = 0;
    otpCode.value = Array(OTP_LENGTH).fill('');
    otpToken.value = null;
    refCode.value = null;
  }

  function resetFlow() {
    currentStep.value = OtpStep.PHONE_INPUT;
    phoneNumber.value = '';
    phoneError.value = null;
    otpCode.value = Array(OTP_LENGTH).fill('');
    otpToken.value = null;
    refCode.value = null;
    countdown.value = 0;
    isSendingOtp.value = false;
    isVerifyingOtp.value = false;
    errorMessage.value = null;
    successMessage.value = null;
    stopCountdown();
  }

  function clearError() {
    errorMessage.value = null;
  }

  return {
    // State
    currentStep,
    phoneNumber,
    phoneError,
    otpCode,
    otpToken,
    refCode,
    countdown,
    isSendingOtp,
    isVerifyingOtp,
    errorMessage,
    successMessage,
    OTP_LENGTH,
    COUNTDOWN_DURATION,
    // Getters
    isPhoneValid,
    isOtpComplete,
    formatCountdown,
    maskedPhone,
    // Actions
    onPhoneInput,
    requestOtp,
    verifyOtp,
    goBackToPhone,
    resetFlow,
    clearError,
    startCountdown,
    stopCountdown,
  };
});