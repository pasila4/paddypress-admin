import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  message: string;
  variant: ToastVariant;
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message, variant = 'info') => {
    set({ toast: { message, variant } });
  },
  hideToast: () => set({ toast: null }),
}));
