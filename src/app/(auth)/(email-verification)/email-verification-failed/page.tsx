import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function EmailVerificationFailed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Verification Failed
          </h1>
          <p className="mb-6 text-gray-600">
            We couldn&apos;t verify your email. The link may have expired or is
            invalid.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/signup"
            className="block w-full rounded-md bg-primary px-4 py-2 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 hover:shadow-md"
          >
            Try Registration Again
          </Link>
          <Link
            href="/login"
            className="block w-full rounded-md bg-gray-200 px-4 py-2 text-center font-semibold text-gray-800 transition-colors hover:bg-gray-300"
          >
            Back to Login
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          If you&apos;ve already verified your email, clicking &quot;Back to
          Login&quot; will redirect you to the homepage.
        </p>
      </div>
    </div>
  );
}
