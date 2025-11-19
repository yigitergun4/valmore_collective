"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.register.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    const success = await register(name, email, password);

    setIsLoading(false);

    if (success) {
      router.push("/");
      router.refresh();
    } else {
      setError(t("auth.register.emailExists"));
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-3">
            {t("auth.register.title")}
          </h1>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {t("auth.register.hasAccount")}{" "}
            <Link
              href="/login"
              className="font-bold text-primary-600 underline underline-offset-4 hover:text-primary-700 transition-colors"
            >
              {t("auth.register.login")}
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
        </form>
      </div>
    </div>
  );
}
