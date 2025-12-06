"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { PaginationProps } from "@/types/profile";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-2 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{t("common.previous")}</span>
      </Button>
      
      <span className="text-sm text-gray-600 font-medium">
        {t("common.pageOf")
          .replace("{current}", currentPage.toString())
          .replace("{total}", totalPages.toString())}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 text-sm"
      >
        <span className="hidden sm:inline">{t("common.next")}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
