export type ToastTone = "success" | "warn";

export interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

const MAX_TOASTS = 3;
let lastId = 0;

export function useToast() {
  const toasts = useState<Toast[]>("toasts", () => []);

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function show(text: string, tone: ToastTone = "success", duration = 2500) {
    const id = ++lastId;
    toasts.value = [...toasts.value, { id, text, tone }].slice(-MAX_TOASTS);
    setTimeout(() => dismiss(id), duration);
  }

  return { toasts: readonly(toasts), show, dismiss };
}
