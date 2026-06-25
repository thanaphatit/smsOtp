<template>
  <div class="min-h-screen flex flex-col items-center justify-center py-8 px-4">
    <div class="w-full max-w-md mx-auto">
      <!-- Card Container -->
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
        <!-- Logo / Icon -->
        <div class="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
          <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-4">SMS OTP Verification</h1>
        <p class="text-gray-500 mb-8">
          ระบบยืนยันตัวตนด้วยรหัส OTP ทาง SMS<br />
          พร้อมระบบบันทึกประวัติการทำรายการ
        </p>

        <router-link
          to="/verify"
          class="inline-block w-full py-3.5 rounded-xl font-semibold text-base
                 bg-indigo-600 hover:bg-indigo-700 text-white
                 shadow-lg shadow-indigo-200 hover:shadow-indigo-300
                 transition-all duration-200 active:scale-[0.98]"
        >
          เริ่มต้นยืนยันตัวตน
        </router-link>

        <div class="mt-4 space-y-2">
          <p class="text-xs text-gray-400">
            ส่งผ่าน Bling Innovation OTP Service
          </p>
          <p class="text-xs text-gray-400">
            พร้อมระบบ API Proxy และบันทึก Log
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page - simple landing with link to verification
</script>