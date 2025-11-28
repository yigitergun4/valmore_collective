"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const AlertDialog = ({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogTrigger = ({ asChild, children, ...props }: any) => {
  const { setOpen } = React.useContext(AlertDialogContext)!;
  const child = asChild ? React.Children.only(children) : children;

  return React.cloneElement(child, {
    onClick: (e: any) => {
      child.props.onClick?.(e);
      setOpen(true);
    },
    ...props
  });
};

export const AlertDialogContent: React.FC<{ className?: string; children?: React.ReactNode; [key: string]: any }> = ({ className, children, ...props }: any) => {
  const { open, setOpen } = React.useContext(AlertDialogContext)!;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0" onClick={() => setOpen(false)} />
      <div className={cn(
        "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-white p-6 opacity-100 shadow-lg animate-in fade-in-0 zoom-in-95 sm:rounded-lg md:w-full",
        className
      )} {...props}>
        {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader: React.FC<{ className?: string; [key: string]: any }> = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

export const AlertDialogFooter: React.FC<{ className?: string; [key: string]: any }> = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

export const AlertDialogTitle: React.FC<{ className?: string; [key: string]: any }> = ({ className, ...props }: any) => (
  <h2 className={cn("text-lg font-semibold text-gray-900", className)} {...props} />
);

export const AlertDialogDescription: React.FC<{ className?: string; [key: string]: any }> = ({ className, ...props }: any) => (
  <p className={cn("text-sm text-gray-500", className)} {...props} />
);

export const AlertDialogAction: React.FC<{ className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; [key: string]: any }> = ({ className, onClick, ...props }: any) => {
  const { setOpen } = React.useContext(AlertDialogContext)!;
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={async (e) => {
        if (onClick) await onClick(e);
        // Don't close automatically if async? User logic handles closing or we close here.
        // Usually Action closes it.
        // setOpen(false); // Let the user handle closing if they want async loading
      }}
      {...props}
    />
  );
};

export const AlertDialogCancel: React.FC<{ className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; [key: string]: any }> = ({ className, onClick, ...props }: any) => {
  const { setOpen } = React.useContext(AlertDialogContext)!;
  return (
    <button
      className={cn(
        "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
};
