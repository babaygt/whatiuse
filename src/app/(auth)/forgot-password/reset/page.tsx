import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[30rem] overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Please enter your new password.
            </p>
          </div>
          <div className="space-y-5">
            <ResetPasswordForm />
            <Link href="/login" className="block text-center hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
