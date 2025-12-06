"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserProfile, updateUserProfile } from "@/lib/firestore/users";
import { toast } from "react-hot-toast";
import { Loader2, Calendar, Lock, X } from "lucide-react";
import { User } from "@/types";
import { auth } from "@/lib/firebase";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword
} from "firebase/auth";


export default function ProfilePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<{fullName: string, phone: string, gender: User["gender"]}>({
    fullName: "",
    phone: "",
    gender: "" as User["gender"],
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordModalData, setPasswordModalData] = useState<{currentPassword: string, newPassword: string, confirmPassword: string}>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState<boolean>(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{currentPassword?: string, newPassword?: string, confirmPassword?: string}>({});

  useEffect(() => {
    const fetchProfile: () => Promise<void> = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            // Strip leading "0" from phone number if present
            const phoneNumber:string = profile.phoneNumber || "";
            const displayPhone:string = phoneNumber.startsWith("0") ? phoneNumber.slice(1) : phoneNumber;
            
            setFormData({
              fullName: profile.fullName || user.fullName || "",
              phone: displayPhone,
              gender: profile.gender || "",
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error(t("profile.loadError"));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user, t]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if(!formData.phone.startsWith("5")) {
      toast.error(t("profile.phoneError"));
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        fullName: formData.fullName,
        phoneNumber: "0" + formData.phone,
        gender: formData.gender,
      });
      toast.success(t("profile.success"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange: () => Promise<void> = async () => {
    if (!auth.currentUser || !user?.email) return;
    
    const errors: {currentPassword?: string, newPassword?: string, confirmPassword?: string} = {};
    
    // Validate fields
    if (!passwordModalData.currentPassword) {
      errors.currentPassword = t("checkout.required");
    }
    
    if (!passwordModalData.newPassword) {
      errors.newPassword = t("checkout.required");
    } else if (passwordModalData.newPassword.length < 6) {
      errors.newPassword = t("auth.register.passwordTooShort");
    } else if (passwordModalData.newPassword === passwordModalData.currentPassword) {
      errors.newPassword = t("profile.samePassword");
    }
    
    if (!passwordModalData.confirmPassword) {
      errors.confirmPassword = t("checkout.required");
    } else if (passwordModalData.newPassword !== passwordModalData.confirmPassword) {
      errors.confirmPassword = t("profile.passwordsDontMatch");
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordFieldErrors(errors);
      return;
    }

    setIsPasswordSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordModalData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordModalData.newPassword);

      toast.success(t("profile.passwordChangeSuccess"));
      setShowPasswordModal(false);
      setPasswordModalData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFieldErrors({});
    } catch (error: any) {
      
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setPasswordFieldErrors({ currentPassword: t("profile.wrongPassword") });
      } else {
        setPasswordFieldErrors({ currentPassword: t("profile.error") });
      }
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const getInitials: (name: string) => string = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate: (dateString?: string) => string = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Memoize formatted phone to prevent hydration issues
  const formattedPhone: string = useMemo(() => {
    if (!formData.phone) return "";
    return formData.phone.replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, (match, p1, p2, p3, p4) => {
      let result: string = p1;
      if (p2) result += ' ' + p2;
      if (p3) result += ' ' + p3;
      if (p4) result += ' ' + p4;
      return result;
    });
  }, [formData.phone]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center text-lg font-bold text-primary-600">
            {getInitials(formData.fullName || user?.email || "")}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {formData.fullName || t("profile.user")}
            </h1>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Member Since */}
        {user?.createdAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg w-fit">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span>{t("profile.memberSince")}: {formatDate(user.createdAt)}</span>
          </div>
        )}

        {/* Personal Information Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("profile.personalInfo")}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("profile.fullName")}
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm"
                placeholder={t("profile.fullName")}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("profile.phone")}
              </label>
              <input
                type="tel"
                id="phone"
                value={formattedPhone}
                onChange={(e) => {
                  const value: string = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setFormData((prev) => ({ ...prev, phone: value }));
                  }
                }}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm"
                placeholder="5XX XXX XX XX"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile.genderLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Male", "Female", "NotSelected"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: option })}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                      formData.gender === option
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t(`profile.gender.${option.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 h-10 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? t("profile.saving") : t("profile.update")}
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Security Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t("profile.passwordSection")}</h2>
          <div className="space-y-3">

            {/* Password Change */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t("profile.currentPassword")}</p>
                  <p className="text-sm text-gray-500">••••••••</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {t("profile.changePassword")}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t("profile.changePassword")}</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordModalData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordFieldErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600">{t("profile.reauthRequired")}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("profile.currentPassword")}
                </label>
                <input
                  type="password"
                  value={passwordModalData.currentPassword}
                  onChange={(e) => {
                    setPasswordModalData({ ...passwordModalData, currentPassword: e.target.value });
                    setPasswordFieldErrors({ ...passwordFieldErrors, currentPassword: undefined });
                  }}
                  className={`w-full h-10 px-3 bg-gray-50 border rounded-lg focus:bg-white focus:ring-1 transition-all outline-none text-sm ${
                    passwordFieldErrors.currentPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                />
                {passwordFieldErrors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordFieldErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("profile.newPassword")}
                </label>
                <input
                  type="password"
                  value={passwordModalData.newPassword}
                  onChange={(e) => {
                    setPasswordModalData({ ...passwordModalData, newPassword: e.target.value });
                    setPasswordFieldErrors({ ...passwordFieldErrors, newPassword: undefined });
                  }}
                  className={`w-full h-10 px-3 bg-gray-50 border rounded-lg focus:bg-white focus:ring-1 transition-all outline-none text-sm ${
                    passwordFieldErrors.newPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                />
                {passwordFieldErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordFieldErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("profile.confirmNewPassword")}
                </label>
                <input
                  type="password"
                  value={passwordModalData.confirmPassword}
                  onChange={(e) => {
                    setPasswordModalData({ ...passwordModalData, confirmPassword: e.target.value });
                    setPasswordFieldErrors({ ...passwordFieldErrors, confirmPassword: undefined });
                  }}
                  className={`w-full h-10 px-3 bg-gray-50 border rounded-lg focus:bg-white focus:ring-1 transition-all outline-none text-sm ${
                    passwordFieldErrors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                />
                {passwordFieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordFieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordModalData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordFieldErrors({});
                }}
                className="flex-1 px-4 h-10 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {t("profile.cancel")}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isPasswordSaving}
                className="flex-1 px-4 h-10 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPasswordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPasswordSaving ? t("profile.saving") : t("profile.save")}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
