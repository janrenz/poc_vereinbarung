import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token");
  return authToken?.value === "authenticated";
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user-id");
  
  if (!userId) return null;
  
  return await prisma.user.findUnique({
    where: { id: userId.value },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      active: true,
    },
  });
}

export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "SUPERADMIN" && user?.active === true;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return (user?.role === "ADMIN" || user?.role === "SUPERADMIN") && user?.active === true;
}

