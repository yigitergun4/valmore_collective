"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
        router.refresh();
      } else {
        setError(t("auth.login.error"));
      }
    } catch (err: any) {
      if (err.message === "Email not verified") {
        setError(t("auth.login.emailNotVerified"));
      } else {
        setError(t("auth.login.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-3">
            {t("auth.login.title")}
          </h1>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {t("auth.login.noAccount")}{" "}
            <Link
              href="/register"
              className="font-bold text-primary-600 underline underline-offset-4 hover:text-primary-700 transition-colors"
            >
              {t("auth.login.register")}
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
            >
              {t("auth.login.email")}
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

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2"
            >
              {t("auth.login.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 border-2 border-primary-600 text-primary-600 focus:ring-0 focus:ring-offset-0"
              />
              <span className="ml-2 text-xs uppercase tracking-wider">
                {t("auth.login.remember")}
              </span>
            </label>

            <Link
              href="#"
              className="text-xs uppercase tracking-wider text-primary-600 underline underline-offset-4 hover:text-primary-700 transition-colors"
            >
              {t("auth.login.forgot")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-all ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span>{t("auth.login.loading")}</span>
            ) : (
              <>
                <span>{t("auth.login.submit")}</span>
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
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
