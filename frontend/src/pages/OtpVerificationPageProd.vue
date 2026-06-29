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
          {{ store.currentStep === OtpStep.PHONE_INPUT ? 'กรุณากรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP' : 'กรุณากรอกรหัส OTP ที่ได้รับทาง SMS' }}
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
          v-if="store.errorMessage"
          class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          role="alert"
        >
          <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-red-700">{{ store.errorMessage }}</span>
          <button
            @click="store.clearError()"
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
          v-if="store.successMessage"
          class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
          role="alert"
        >
          <svg class="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-green-700">{{ store.successMessage }}</span>
        </div>
      </Transition>

      <!-- Step 1: Phone Number Input -->
      <Transition mode="out-in" name="fade-slide">
        <div v-if="store.currentStep === OtpStep.PHONE_INPUT" key="phone-step">
          <div class="mb-6">
            <label for="phone-number" class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์มือถือ</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span class="text-gray-500 font-medium text-sm">+66</span>
              </div>
              <input
                id="phone-number"
                ref="phoneInputRef"
                :value="displayPhone"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                placeholder="XX-XXX-XXXX"
                :class="[
                  'w-full pl-14 pr-4 py-3.5 border-2 rounded-xl text-gray-800 text-lg font-medium',
                  'transition-all duration-200 outline-none',
                  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                  store.phoneError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300',
                ]"
                :disabled="store.isSendingOtp"
                @input="onPhoneInputHandler"
                @keyup.enter="handleSendOtp"
              />
            </div>
            <Transition name="fade">
              <p v-if="store.phoneError" class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ store.phoneError }}
              </p>
            </Transition>
          </div>

          <button
            @click="handleSendOtp"
            :disabled="!store.isPhoneValid || store.isSendingOtp"
            :class="[
              'w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200',
              'flex items-center justify-center gap-2',
              store.isPhoneValid && !store.isSendingOtp
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            <svg v-if="store.isSendingOtp" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="store.isSendingOtp">กำลังส่งรหัส OTP ทาง SMS...</span>
            <span v-else>ส่งรหัส OTP</span>
          </button>

          <div class="mt-3 text-center">
            <p class="text-xs text-gray-400">กรุณาตรวจสอบรหัส OTP ที่โทรศัพท์ของคุณ</p>
          </div>
        </div>

        <!-- Step 2: OTP Input -->
        <div v-else-if="store.currentStep === OtpStep.OTP_INPUT" key="otp-step">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3 text-center">กรอกรหัส OTP</label>
            <div class="flex items-center justify-center gap-2 md:gap-3">
              <input
                v-for="(_, index) in store.OTP_LENGTH"
                :key="index"
                :ref="(el: any) => setOtpInputRef(el as HTMLInputElement, index)"
                :value="store.otpCode[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                :class="['otp-input', store.otpCode[index] ? 'filled' : '', hasOtpError ? 'error' : '']"
                :disabled="store.isVerifyingOtp"
                @input="onOtpInput(index, $event)"
                @keydown.delete="onOtpDelete(index)"
                @keydown.backspace="onOtpDelete(index)"
                @paste.prevent="onOtpPaste"
              />
            </div>
          </div>

          <div class="text-center mb-4 space-y-1">
            <p class="text-xs text-gray-400">
              ระบบได้ส่งรหัส OTP ไปยังเบอร์
              <span class="font-medium text-gray-500">{{ store.maskedPhone }}</span>
            </p>
            <p class="text-xs text-gray-400" v-if="store.refCode">
              รหัสอ้างอิง (Ref Code):
              <span class="font-mono font-medium text-indigo-500 select-all">{{ store.refCode }}</span>
            </p>
          </div>

          <div class="text-center mb-6">
            <p v-if="store.countdown > 0" class="text-sm text-gray-500">
              ส่งรหัสใหม่ได้ใน
              <span class="font-semibold text-indigo-600">{{ store.formatCountdown }}</span>
            </p>
            <button
              v-else
              @click="handleResendOtp"
              :disabled="store.isSendingOtp"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="store.isSendingOtp">กำลังส่งรหัสใหม่...</span>
              <span v-else>ส่งรหัส OTP อีกครั้ง</span>
            </button>
          </div>

          <button
            @click="handleVerifyOtp"
            :disabled="!store.isOtpComplete || store.isVerifyingOtp"
            :class="[
              'w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200',
              'flex items-center justify-center gap-2',
              store.isOtpComplete && !store.isVerifyingOtp
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            <svg v-if="store.isVerifyingOtp" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="store.isVerifyingOtp">กำลังยืนยันรหัส...</span>
            <span v-else>ยืนยันรหัส</span>
          </button>

          <div class="mt-4 text-center">
            <button
              @click="store.goBackToPhone()"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              :disabled="store.isVerifyingOtp"
            >
              ← แก้ไขเบอร์โทรศัพท์
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="store.currentStep === OtpStep.SUCCESS" key="success-step">
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
              @click="goHome"
              class="w-full py-3.5 rounded-xl font-semibold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 active:scale-[0.98]"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <p class="text-center text-xs text-gray-400 mt-2">
      หากมีข้อสงสัย กรุณาติดต่อฝ่ายบริการลูกค้า 02-743-8787
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * OtpVerificationPage.vue
 *
 * OTP Verification page using Pinia store for state management.
 * Calls backend API proxy (not directly to Bling) to bypass CORS.
 */
import { ref, computed, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useOtpStore, OtpStep } from '@/stores/otp';

const router = useRouter();
const store = useOtpStore();

const hasOtpError = ref(false);
const phoneInputRef = ref<HTMLInputElement | null>(null);
const otpInputRefs = ref<HTMLInputElement[]>([]);

// Display phone with leading 0
const displayPhone = computed(() => {
  return store.phoneNumber ? `0${store.phoneNumber}` : '';
});

function onPhoneInputHandler(event: Event) {
  const input = event.target as HTMLInputElement;
  let digits = input.value.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  store.onPhoneInput(digits);
}

function setOtpInputRef(el: HTMLInputElement, index: number): void {
  if (el) {
    otpInputRefs.value[index] = el;
  }
}

async function handleSendOtp(): Promise<void> {
  const success = await store.requestOtp();
  if (success) {
    hasOtpError.value = false;
    await nextTick();
    otpInputRefs.value[0]?.focus();
  }
}

function onOtpInput(index: number, event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '');

  if (value) {
    store.otpCode[index] = value.charAt(0);
    hasOtpError.value = false;
    store.clearError();

    if (index < store.OTP_LENGTH - 1) {
      nextTick(() => {
        otpInputRefs.value[index + 1]?.focus();
      });
    } else {
      nextTick(() => {
        if (store.isOtpComplete) {
          handleVerifyOtp();
        }
      });
    }
  }
}

function onOtpDelete(index: number): void {
  if (store.otpCode[index] === '' && index > 0) {
    store.otpCode[index - 1] = '';
    nextTick(() => {
      otpInputRefs.value[index - 1]?.focus();
    });
  } else {
    store.otpCode[index] = '';
  }
  hasOtpError.value = false;
}

function onOtpPaste(event: ClipboardEvent): void {
  const pastedData = event.clipboardData?.getData('text') ?? '';
  const digits = pastedData.replace(/\D/g, '').split('').slice(0, store.OTP_LENGTH);

  digits.forEach((digit: string, index: number) => {
    store.otpCode[index] = digit;
  });

  const nextEmptyIndex = store.otpCode.findIndex((d: string) => d === '');
  const focusIndex = nextEmptyIndex === -1 ? store.OTP_LENGTH - 1 : nextEmptyIndex;
  nextTick(() => {
    otpInputRefs.value[focusIndex]?.focus();
  });
}

async function handleVerifyOtp(): Promise<void> {
  const success = await store.verifyOtp();
  if (!success) {
    hasOtpError.value = true;
    await nextTick();
    otpInputRefs.value[0]?.focus();
  }
}

async function handleResendOtp(): Promise<void> {
  if (store.countdown > 0) return;
  await handleSendOtp();
}

function goHome(): void {
  store.resetFlow();
  router.push('/');
}

/**
 * Request OTP from SMS using WebOTP API (navigator.credentials.get)
 * Automatically fills OTP fields when SMS is received.
 * Only works on HTTPS or localhost, supported on Android Chrome & Samsung Internet.
 */
async function requestSmsOtp(): Promise<void> {
  // Check if WebOTP API is supported
  if (!navigator.credentials || !('otp' in navigator)) {
    console.log('WebOTP API not supported on this browser');
    return;
  }

  try {
    const otpResult = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      // Signal allows aborting the request later if needed
    } as any);

    if (!otpResult) return;

    // Parse the OTP code - type assertion since the result type may vary
    const otpData = otpResult as any;
    const otpCode = otpData?.code ?? '';

    if (otpCode && /^\d+$/.test(otpCode)) {
      // Fill OTP fields
      const digits = otpCode.replace(/\D/g, '').split('').slice(0, store.OTP_LENGTH);
      digits.forEach((digit: string, index: number) => {
        store.otpCode[index] = digit;
      });

      // Focus on last filled input
      const focusIndex = digits.length - 1;
      await nextTick();
      otpInputRefs.value[focusIndex]?.focus();

      // Auto-verify if all digits filled
      await nextTick();
      if (store.isOtpComplete) {
        await handleVerifyOtp();
      }
    }
  } catch (error: any) {
    // User cancelled or API not available - silently fail
    // User can still type OTP manually
    console.log('WebOTP API request cancelled or failed:', error?.message ?? error);
  }
}

// Watch for step changes and trigger SMS OTP auto-fill
watch(() => store.currentStep, (newStep) => {
  if (newStep === OtpStep.OTP_INPUT) {
    // Delay a bit to let UI render, then attempt SMS OTP auto-fill
    setTimeout(() => {
      requestSmsOtp();
    }, 500);
  }
});

onUnmounted(() => {
  store.stopCountdown();
});
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

/* Transition classes */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>