<template>
  <div class="w-full max-w-md mx-auto px-4">
    <!-- Card Container -->
    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">ยืนยันตัวตนด้วยรหัส OTP</h1>
        <p class="text-gray-500 mt-2 text-sm">
          {{ currentStep === OtpStep.PHONE_INPUT ? 'กรุณากรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP' : 'กรุณากรอกรหัส OTP ที่ได้รับทาง SMS' }}
        </p>
      </div>

      <!-- Error Message Banner -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="errorMessage"
          class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          role="alert"
        >
          <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-red-700">{{ errorMessage }}</span>
          <button
            @click="clearError"
            class="ml-auto text-red-400 hover:text-red-600 transition-colors"
            aria-label="ปิดข้อความแจ้งเตือน"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Success Message Banner -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="successMessage"
          class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
          role="alert"
        >
          <svg class="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-green-700">{{ successMessage }}</span>
        </div>
      </Transition>

      <!-- Step 1: Phone Number Input -->
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="currentStep === OtpStep.PHONE_INPUT" key="phone-step">
          <!-- Phone Number Input -->
          <div class="mb-6">
            <label for="phone-number" class="block text-sm font-medium text-gray-700 mb-2">
              เบอร์โทรศัพท์มือถือ
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span class="text-gray-500 font-medium text-sm">+66</span>
              </div>
              <input
                id="phone-number"
                ref="phoneInputRef"
                v-model="phoneNumber"
                type="tel"
                inputmode="numeric"
                maxlength="9"
                placeholder="XX-XXX-XXXX"
                :class="[
                  'w-full pl-14 pr-4 py-3.5 border-2 rounded-xl text-gray-800 text-lg font-medium',
                  'transition-all duration-200 outline-none',
                  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                  phoneError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300',
                ]"
                :disabled="isSendingOtp"
                @input="onPhoneInput"
                @keyup.enter="handleSendOtp"
              />
            </div>
            <!-- Phone Error -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 translate-y-1"
              leave-active-class="transition-all duration-150"
              leave-to-class="opacity-0"
            >
              <p v-if="phoneError" class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ phoneError }}
              </p>
            </Transition>
          </div>

          <!-- Send OTP Button -->
          <button
            @click="handleSendOtp"
            :disabled="!isPhoneValid || isSendingOtp"
            :class="[
              'w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200',
              'flex items-center justify-center gap-2',
              isPhoneValid && !isSendingOtp
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            <svg
              v-if="isSendingOtp"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="isSendingOtp">กำลังส่งรหัส OTP ทาง SMS...</span>
            <span v-else>ส่งรหัส OTP</span>
          </button>

          <!-- API Info -->
          <div class="mt-3 text-center">
            <p class="text-xs text-gray-400">
              ส่งผ่าน Bling Innovation OTP Service
            </p>
          </div>
        </div>

        <!-- Step 2: OTP Input -->
        <div v-else-if="currentStep === OtpStep.OTP_INPUT" key="otp-step">
          <!-- OTP Input Fields -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3 text-center">
              กรอกรหัส OTP
            </label>
            <div class="flex items-center justify-center gap-2 md:gap-3">
              <input
                v-for="(_, index) in otpLength"
                :key="index"
                :ref="(el: any) => setOtpInputRef(el as HTMLInputElement, index)"
                v-model="otpCode[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                :class="['otp-input', otpCode[index] ? 'filled' : '', hasOtpError ? 'error' : '']"
                :disabled="isVerifyingOtp"
                @input="onOtpInput(index, $event)"
                @keydown.delete="onOtpDelete(index)"
                @keydown.backspace="onOtpDelete(index)"
                @paste.prevent="onOtpPaste"
              />
            </div>
          </div>

          <!-- SMS Status Info & Ref Code -->
          <div class="text-center mb-4 space-y-1">
            <p class="text-xs text-gray-400">
              ระบบได้ส่งรหัส OTP ไปยังเบอร์
              <span class="font-medium text-gray-500">{{ maskedPhone }}</span>
            </p>
            <p class="text-xs text-gray-400" v-if="refCode">
              รหัสอ้างอิง (Ref Code):
              <span class="font-mono font-medium text-indigo-500 select-all">{{ refCode }}</span>
            </p>
          </div>

          <!-- Countdown Timer & Resend -->
          <div class="text-center mb-6">
            <p v-if="countdown > 0" class="text-sm text-gray-500">
              ส่งรหัสใหม่ได้ใน
              <span class="font-semibold text-indigo-600">{{ formatCountdown }}</span>
            </p>
            <button
              v-else
              @click="handleResendOtp"
              :disabled="isSendingOtp"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="isSendingOtp">กำลังส่งรหัสใหม่...</span>
              <span v-else>ส่งรหัส OTP อีกครั้ง</span>
            </button>
          </div>

          <!-- Verify Button -->
          <button
            @click="handleVerifyOtp"
            :disabled="!isOtpComplete || isVerifyingOtp"
            :class="[
              'w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200',
              'flex items-center justify-center gap-2',
              isOtpComplete && !isVerifyingOtp
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            <svg
              v-if="isVerifyingOtp"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="isVerifyingOtp">กำลังยืนยันรหัส...</span>
            <span v-else>ยืนยันรหัส</span>
          </button>

          <!-- Back to phone number -->
          <div class="mt-4 text-center">
            <button
              @click="goBackToPhone"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              :disabled="isVerifyingOtp"
            >
              ← แก้ไขเบอร์โทรศัพท์
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="currentStep === OtpStep.SUCCESS" key="success-step">
          <div class="text-center py-4">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">ยืนยันข้อมูลสำเร็จ</h2>
            <p class="text-gray-500 mb-8">ระบบยืนยันตัวตนของคุณเรียบร้อยแล้ว</p>
            <button
              @click="resetFlow"
              class="w-full py-3.5 rounded-xl font-semibold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 active:scale-[0.98]"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-gray-400 mt-2">
      หากมีข้อสงสัย กรุณาติดต่อฝ่ายบริการลูกค้า
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * OTPVerification.vue
 *
 * Main component for SMS OTP verification flow.
 * Uses Bling Innovation OTP Service API v2.1.
 *
 * Flow:
 *   1. User enters phone number → validates Thai format
 *   2. Calls request_otp → server generates OTP and sends via SMS
 *   3. User enters OTP code
 *   4. Calls verify_otp → server validates the PIN
 *   5. Success/Error feedback displayed
 *
 * Reference: Bling Innovation OTP Service API - V2.1
 */
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { OtpStep } from '@/types'
import { requestOtp, verifyOtp } from '@/services/api'

// ============================================================
// Constants
// ============================================================
const OTP_LENGTH = 6
const COUNTDOWN_DURATION = 60
const THAI_PHONE_REGEX = /^[0-9]{9}$/

// ============================================================
// Reactive State
// ============================================================
const currentStep = ref<OtpStep>(OtpStep.PHONE_INPUT)
const phoneNumber = ref('')
const phoneError = ref<string | null>(null)
const otpCode = ref<string[]>(Array(OTP_LENGTH).fill(''))
const otpLength = OTP_LENGTH
const otpToken = ref<string | null>(null)
const refCode = ref<string | null>(null)
const countdown = ref(0)
const isSendingOtp = ref(false)
const isVerifyingOtp = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const hasOtpError = ref(false)

// Refs for DOM elements
const phoneInputRef = ref<HTMLInputElement | null>(null)
const otpInputRefs = ref<HTMLInputElement[]>([])

// Countdown timer interval
let countdownInterval: ReturnType<typeof setInterval> | null = null

// ============================================================
// Computed Properties
// ============================================================
const isPhoneValid = computed(() => {
  return THAI_PHONE_REGEX.test(phoneNumber.value)
})

const isOtpComplete = computed(() => {
  return otpCode.value.every((digit: string) => digit !== '')
})

const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const maskedPhone = computed(() => {
  if (!phoneNumber.value) return ''
  const digits = phoneNumber.value.replace(/\D/g, '')
  if (digits.length < 4) return digits
  return `0${digits.substring(0, 2)}-xxx-${digits.substring(digits.length - 4)}`
})

// ============================================================
// Methods
// ============================================================

/**
 * Set OTP input ref for each digit input
 */
function setOtpInputRef(el: HTMLInputElement, index: number): void {
  if (el) {
    otpInputRefs.value[index] = el
  }
}

/**
 * Handle phone number input - strip non-numeric characters
 * and remove leading zero if present
 */
function onPhoneInput(event: Event): void {
  const input = event.target as HTMLInputElement
  let digits = input.value.replace(/\D/g, '')
  // Remove leading zero if user enters it (e.g., "0812345678" → "812345678")
  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }
  phoneNumber.value = digits
  phoneError.value = null
  errorMessage.value = null
}

/**
 * Validate phone number format
 */
function validatePhone(): boolean {
  if (!phoneNumber.value) {
    phoneError.value = 'กรุณากรอกเบอร์โทรศัพท์'
    return false
  }
  if (!THAI_PHONE_REGEX.test(phoneNumber.value)) {
    phoneError.value = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9 หลัก)'
    return false
  }
  return true
}

/**
 * Handle Send OTP button click
 *
 * Flow:
 *   1. Validate phone number
 *   2. Call request_otp API → server generates OTP and sends SMS
 *   3. Store token from server response for later verification
 *   4. Start countdown timer
 *   5. Show OTP input screen
 */
async function handleSendOtp(): Promise<void> {
  if (!validatePhone()) return

  isSendingOtp.value = true
  errorMessage.value = null
  phoneError.value = null

  try {
    // Call Bling OTP API: request_otp
    // Server generates OTP and sends to user's phone via SMS
    const { token, ref_code } = await requestOtp(phoneNumber.value)

    // Store token for verification step
    otpToken.value = token
    refCode.value = ref_code

    // Start countdown before resend is allowed
    startCountdown()

    // Show OTP input screen
    currentStep.value = OtpStep.OTP_INPUT
    hasOtpError.value = false

    // Focus first OTP input after transition
    await nextTick()
    otpInputRefs.value[0]?.focus()
  } catch (error: any) {
    errorMessage.value = error.message ?? 'เกิดข้อผิดพลาดในการส่งรหัส OTP กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSendingOtp.value = false
  }
}

/**
 * Handle OTP digit input
 */
function onOtpInput(index: number, event: Event): void {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '')

  if (value) {
    otpCode.value[index] = value.charAt(0)
    hasOtpError.value = false
    errorMessage.value = null

    // Auto-focus to next input
    if (index < otpLength - 1) {
      nextTick(() => {
        otpInputRefs.value[index + 1]?.focus()
      })
    } else {
      // Auto-submit when last digit is entered
      nextTick(() => {
        if (isOtpComplete.value) {
          handleVerifyOtp()
        }
      })
    }
  }
}

/**
 * Handle OTP delete/backspace - focus previous input
 */
function onOtpDelete(index: number): void {
  if (otpCode.value[index] === '' && index > 0) {
    otpCode.value[index - 1] = ''
    nextTick(() => {
      otpInputRefs.value[index - 1]?.focus()
    })
  } else {
    otpCode.value[index] = ''
  }
  hasOtpError.value = false
}

/**
 * Handle paste event for OTP - paste full code
 */
function onOtpPaste(event: ClipboardEvent): void {
  const pastedData = event.clipboardData?.getData('text') ?? ''
  const digits = pastedData.replace(/\D/g, '').split('').slice(0, otpLength)

  digits.forEach((digit: string, index: number) => {
    otpCode.value[index] = digit
  })

  // Focus the next empty input or the last input
  const nextEmptyIndex = otpCode.value.findIndex((d: string) => d === '')
  const focusIndex = nextEmptyIndex === -1 ? otpLength - 1 : nextEmptyIndex
  nextTick(() => {
    otpInputRefs.value[focusIndex]?.focus()
  })
}

/**
 * Handle Verify OTP button click
 *
 * Flow:
 *   1. Call verify_otp API with token + PIN
 *   2. Server validates the OTP code
 *   3. On success: show success screen
 *   4. On failure: clear OTP fields, show error, refocus
 */
async function handleVerifyOtp(): Promise<void> {
  if (!isOtpComplete.value) return

  isVerifyingOtp.value = true
  errorMessage.value = null
  hasOtpError.value = false

  try {
    const otpString = otpCode.value.join('')

    // Call Bling OTP API: verify_otp
    // Server validates the PIN against the previously generated OTP
    await verifyOtp(otpToken.value!, otpString)

    // Success - show success screen
    currentStep.value = OtpStep.SUCCESS
    successMessage.value = 'ยืนยันตัวตนสำเร็จ'
    stopCountdown()

  } catch (error: any) {
    errorMessage.value = error.message ?? 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    hasOtpError.value = true

    // Clear OTP fields for retry
    otpCode.value = Array(otpLength).fill('')
    await nextTick()
    otpInputRefs.value[0]?.focus()
  } finally {
    isVerifyingOtp.value = false
  }
}

/**
 * Handle Resend OTP
 */
async function handleResendOtp(): Promise<void> {
  if (countdown.value > 0) return
  await handleSendOtp()
}

/**
 * Start countdown timer
 */
function startCountdown(): void {
  stopCountdown()
  countdown.value = COUNTDOWN_DURATION
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

/**
 * Stop countdown timer
 */
function stopCountdown(): void {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

/**
 * Go back to phone number input step
 */
function goBackToPhone(): void {
  currentStep.value = OtpStep.PHONE_INPUT
  errorMessage.value = null
  hasOtpError.value = false
  stopCountdown()
  countdown.value = 0
  otpCode.value = Array(otpLength).fill('')
  otpToken.value = null
  refCode.value = null

  nextTick(() => {
    phoneInputRef.value?.focus()
  })
}

/**
 * Clear error message
 */
function clearError(): void {
  errorMessage.value = null
}

/**
 * Reset entire flow back to initial state
 */
function resetFlow(): void {
  currentStep.value = OtpStep.PHONE_INPUT
  phoneNumber.value = ''
  phoneError.value = null
  otpCode.value = Array(otpLength).fill('')
  otpToken.value = null
  refCode.value = null
  countdown.value = 0
  isSendingOtp.value = false
  isVerifyingOtp.value = false
  errorMessage.value = null
  successMessage.value = null
  hasOtpError.value = false
  stopCountdown()

  nextTick(() => {
    phoneInputRef.value?.focus()
  })
}

// ============================================================
// Lifecycle Hooks
// ============================================================
onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
/* OTP Input Styles */
.otp-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.2s;
  color: #1f2937;
  caret-color: #6366f1;
}

.otp-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.otp-input.filled {
  border-color: #6366f1;
  background-color: #eef2ff;
}

.otp-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
  animation: shake 0.3s ease-in-out;
}

.otp-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@media (min-width: 768px) {
  .otp-input {
    width: 3.5rem;
    height: 4rem;
    font-size: 1.75rem;
  }
}
</style>