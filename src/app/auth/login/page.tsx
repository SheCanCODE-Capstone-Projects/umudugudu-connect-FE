'use client';
/**
 * Login Page — OTP-based phone authentication.
 *
 * Flow:
 *   1. User enters phone number → POST /api/v1/auth/otp/request
 *   2. User enters OTP received via SMS → POST /api/v1/auth/otp/verify
 *   3. On success: store JWT in cookie, dispatch setUser, redirect to role dashboard
 *
 * TODO: Wire up authApi.requestOtp() and authApi.verifyOtp()
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">UC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Umudugudu Connect</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your phone number to continue</p>
        {/* TODO: implement OTP request + verify form */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-700 text-sm font-medium">⚠️ Login form — TODO</p>
          <p className="text-yellow-600 text-xs mt-1">Wire up authApi.requestOtp() and authApi.verifyOtp()</p>
        </div>
      </div>
    </div>
  );
}
