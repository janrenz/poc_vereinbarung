import { getSession } from "./session";

/**
 * Check if user is authenticated
 * Uses secure session management system
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    name: session.user.name,
    active: session.user.active,
  };
}

/**
 * Check if current user is a superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "SUPERADMIN" && user?.active === true;
}

/**
 * Check if current user is an admin (includes superadmin)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return (
    (user?.role === "ADMIN" || user?.role === "SUPERADMIN") &&
    user?.active === true
  );
}

