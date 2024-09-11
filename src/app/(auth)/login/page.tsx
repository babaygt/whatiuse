import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[30rem] overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold"> Login </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Please enter your details.
            </p>
          </div>
          <div className="space-y-5">
            <LoginForm />
            <Link
              href="/signup"
              className="mt-4 block text-center font-semibold text-primary hover:underline"
            >
              Don&apos;t have an account? Sign Up
            </Link>

            <Link
              href="/forgot-password"
              className="mt-4 block text-center font-semibold text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
