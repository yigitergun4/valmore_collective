"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserProfile, updateUserProfile } from "@/lib/firestore/users";
import { toast } from "react-hot-toast";
import { Loader2, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "Unisex" as "Male" | "Female" | "Unisex",
  });

  useEffect(() => {
    const fetchProfile: () => Promise<void> = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFormData({
              fullName: profile.fullName || user.fullName || "",
              phone: profile.phone || "",
              gender: profile.gender || "Unisex",
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

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
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

      {/* Form */}
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
            value={formData.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, phone: val });
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
            {(["Male", "Female", "Unisex"] as const).map((option) => (
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
  );
}

