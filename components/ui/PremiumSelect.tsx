"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Option, PremiumSelectProps } from "@/types/components";
import { useLanguage } from "@/contexts/LanguageContext";

export const PremiumSelect: React.FC<PremiumSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  className,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption: Option | undefined = options.find((opt: Option) => opt.value === value);

  // Default placeholder if not provided
  const displayPlaceholder: string = placeholder || t("addresses.select"); 

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside: (event: MouseEvent) => void = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility
  const handleKeyDown: (e: React.KeyboardEvent) => void = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      const currentIndex: number = options.findIndex((opt: Option) => opt.value === value);
      const nextIndex: number = (currentIndex + 1) % options.length;
      onChange(options[nextIndex].value);
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      const currentIndex: number = options.findIndex((opt: Option) => opt.value === value);
      const prevIndex: number = (currentIndex - 1 + options.length) % options.length;
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "relative w-full min-h-[48px] px-4 py-3 bg-white border-2 cursor-pointer transition-all duration-300",
          "flex items-center justify-between gap-2",
          isOpen ? "border-primary-100 shadow-lg" : "border-gray-100 hover:border-gray-300",
          error ? "border-red-500" : "",
          disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""
        )}
      >
        <span className={cn(
          "text-sm font-medium transition-colors",
          selectedOption ? "text-black" : "text-gray-400"
        )}>
          {selectedOption ? selectedOption.label : displayPlaceholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform duration-300",
          isOpen ? "rotate-180 text-black" : ""
        )} />
      </div>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border-2 border-primary-100 shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "px-4 py-3 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between",
                value === option.value 
                  ? "bg-primary-600 font-bold text-white" 
                  : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              {option.label}
              {value === option.value && <Check className="w-4 h-4 text-white" />}
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 italic">{t("products.noResults")}</li>
          )}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};
