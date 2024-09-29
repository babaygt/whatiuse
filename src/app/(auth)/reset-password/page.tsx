import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import Link from "next/link";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password.",
};

export default async function ResetPasswordPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[32rem] w-full max-w-[26rem] overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="w-full space-y-6 overflow-y-auto p-8">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Please enter your new password.
            </p>
          </div>
          <div className="space-y-4">
            <ResetPasswordForm />
            <div className="flex justify-center">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
