import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  // If user is already logged in, redirect to admin
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/admin");
  }

  return <LoginForm />;
}
