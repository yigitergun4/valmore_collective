"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";


export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const { register, sendVerificationEmail } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useAlert();
  
  // Form States
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // Validation States
  const passwordMinLength: number = 6;
  
  // UI States
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Verification States
  const [step, setStep] = useState<'register' | 'verify'>('register');

  const handleRegister: React.FormEventHandler<HTMLFormElement> = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    if (password.length < passwordMinLength) {
      setError(t("auth.register.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    // Try to register first
    const success: boolean = await register(name, email, password);

    if (success) {
      // Send verification email
      await sendVerificationEmail();
      setIsLoading(false);
      setStep('verify');
    } else {
      setError(t("auth.register.registrationFailed"));
      showError(t("auth.register.registrationFailed"));
    }
  };

  const handleResendEmail: React.MouseEventHandler<HTMLButtonElement> = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await sendVerificationEmail();
      showSuccess("Verification email resent!");
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-3">
            {step === 'register' ? t("auth.register.title") : "Verify Email"}
          </h1>
          {step === 'register' && (
            <p className="text-xs uppercase tracking-wider text-gray-500">
              {t("auth.register.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-bold text-primary-600 underline underline-offset-4 hover:text-primary-700 transition-colors"
              >
                {t("auth.register.login")}
              </Link>
            </p>
          )}
          {step === 'verify' && (
            <p className="text-xs text-gray-500">
              We have sent a verification link to <strong>{email}</strong>.<br/>
              Please check your inbox and click the link to verify your account.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 px-4 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {step === 'register' ? (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label
                htmlFor="name"
                className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
              >
                {t("auth.register.name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
              >
                {t("auth.register.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all text-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
              >
                {t("auth.register.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-wider">
                {t("auth.register.minLength")}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
              >
                {t("auth.register.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-all ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span>{t("auth.register.loading")}</span>
              ) : (
                <>
                  <span>{t("auth.register.submit")}</span>
                  <ArrowRight className="ml-3 w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative bg-white px-4 text-xs text-gray-500 uppercase tracking-wider">
                {t("auth.login.or")}
              </div>
            </div>

            <GoogleAuthButton />
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 px-4 py-3 text-sm text-green-700">
              Verification email sent successfully!
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              Once you have verified your email, you can proceed to login.
            </p>

            <Link
              href="/login"
              className="w-full flex justify-center items-center py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-all"
            >
              Go to Login
            </Link>
            
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full text-xs text-gray-500 underline hover:text-primary-600 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
