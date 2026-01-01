import { useEffect, useState } from "react";
import { useUiStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function ToastManager() {
    const { toast, hideToast } = useUiStore();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(hideToast, 300); // Wait for fade out animation
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, hideToast]);

    if (!toast && !visible) return null;

    const variantStyles = {
        success: "border-green-200 bg-green-200 text-green-900 dark:bg-green-950/20 dark:border-green-500/20 dark:text-green-400",
        error: "border-red-200 bg-red-50 text-red-900 dark:bg-red-950/20 dark:border-red-500/20 dark:text-red-400",
        warning: "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:border-amber-500/20 dark:text-amber-400",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/20 dark:border-blue-500/20 dark:text-blue-400",
    };

    return (
        <div className="fixed right-4 top-4 z-9999 flex w-full max-w-[400px] flex-col gap-2">
            <div
                className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300",
                    toast ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
                    variantStyles[toast?.variant || "info"]
                )}
            >
                <p className="text-sm font-medium">{toast?.message}</p>
                <button
                    onClick={() => {
                        setVisible(false);
                        hideToast();
                    }}
                    className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
