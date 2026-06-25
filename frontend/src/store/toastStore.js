import { create } from "zustand";

/**
 * Lightweight global toast channel.
 *
 * Exists so plain JS modules that aren't React components — like the axios
 * interceptor in api/client.js — can surface a message to the user without
 * needing a callback prop threaded all the way down. Any component can call
 * `useToastStore.getState().show(...)`; <GlobalToast /> (mounted once in
 * App.jsx) is what actually renders it.
 */
export const useToastStore = create((set) => ({
    toast: null, // { message, severity } | null

    show: (message, severity = "info") => set({ toast: { message, severity } }),
    clear: () => set({ toast: null }),
}));
