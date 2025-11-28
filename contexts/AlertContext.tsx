"use strict";
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  confirmText?: string;
  cancelText?: string; // If provided, shows cancel button (confirm mode)
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({ title: "" });

  const showAlert = useCallback((options: AlertOptions) => {
    setConfig(options);
    setOpen(true);
  }, []);

  const showError = useCallback((message: string) => {
    showAlert({
      title: "Hata",
      description: message,
      variant: "destructive",
      confirmText: "Tamam",
    });
  }, [showAlert]);

  const showSuccess = useCallback((message: string) => {
    showAlert({
      title: "Başarılı",
      description: message,
      variant: "default",
      confirmText: "Tamam",
    });
  }, [showAlert]);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    showAlert({
      title: "Onay",
      description: message,
      variant: "default",
      confirmText: "Evet",
      cancelText: "İptal",
      onConfirm,
    });
  }, [showAlert]);

  const handleConfirm = () => {
    setOpen(false);
    if (config.onConfirm) config.onConfirm();
  };

  const handleCancel = () => {
    setOpen(false);
    if (config.onCancel) config.onCancel();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showError, showSuccess, showConfirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
            {config.description && (
              <AlertDialogDescription>{config.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {config.cancelText && (
              <AlertDialogCancel onClick={handleCancel}>{config.cancelText}</AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={handleConfirm}
              className={config.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {config.confirmText || "Tamam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
