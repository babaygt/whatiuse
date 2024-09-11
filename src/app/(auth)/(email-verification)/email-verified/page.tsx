import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function EmailVerified() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mb-4 text-center text-3xl font-bold text-green-600">
          Email Verified Successfully!
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Your email has been verified. You can now use all features of our
          application.
        </p>
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 hover:shadow-md"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
