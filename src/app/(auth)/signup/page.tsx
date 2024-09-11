import Link from "next/link";
import SignUpForm from "./SignUpForm";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[44rem] w-full max-w-[30rem] overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Register</h1>
            <p className="text-sm text-muted-foreground">
              Create an account to get started.
            </p>
          </div>
          <div className="space-y-5">
            <SignUpForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="mt-4 block text-center font-semibold text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
