import { Snackbar, Alert } from "@mui/material";
import { useToastStore } from "../store/toastStore";

/**
 * Mount this once near the root (see App.jsx). Anything in the app —
 * including non-component code via useToastStore.getState().show(...) —
 * can trigger a toast here without prop-drilling.
 */
export default function GlobalToast() {
    const toast = useToastStore((s) => s.toast);
    const clear = useToastStore((s) => s.clear);

    return (
        <Snackbar
            open={Boolean(toast)}
            autoHideDuration={4000}
            onClose={clear}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            {toast ? (
                <Alert severity={toast.severity} onClose={clear} variant="filled">
                    {toast.message}
                </Alert>
            ) : undefined}
        </Snackbar>
    );
}
