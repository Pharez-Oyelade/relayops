import { api } from "./api";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";

/**
 * Cleanly logs out the user:
 * 1. Calls the backend logout endpoint to invalidate the refresh token in the DB and clear httpOnly cookies.
 * 2. Wipes in-memory user authentication and JWT tokens.
 * 3. Wipes active workspace and tenant localStorage cache.
 * 4. Redirects to /login.
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Even if server is temporarily unreachable, client-side session must be cleared
    console.warn("Server logout request failed:", error);
  } finally {
    useAuthStore.getState().clearAuth();
    useTenantStore.getState().clearTenants();
    if (typeof window !== "undefined") {
      localStorage.removeItem("relayops_active_tenant");
      window.location.href = "/login";
    }
  }
}
