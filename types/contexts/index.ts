// Context type definitions

export interface AlertOptions {
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
    duration?: number;
    position?: "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left";
    onClose?: () => void;
}

export interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    hideAlert: () => void;
}
