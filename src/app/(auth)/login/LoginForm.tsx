"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signInSchema, SignInSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signIn, resendVerificationEmail } from "./actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCountdown } from "usehooks-ts";
import { GoogleSignInButton } from "@/components/auth/GoogleSignIn";
import { GitHubSignInButton } from "@/components/auth/GitHubSignIn";

export default function LoginForm() {
  const [error, setError] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const [showResendVerificationEmail, setShowResendVerificationEmail] =
    useState(false);

  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    });

  useEffect(() => {
    if (count === 0) {
      stopCountdown();
      resetCountdown();
    }
  }, [count, stopCountdown, resetCountdown]);

  const { toast } = useToast();

  const router = useRouter();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInSchema) {
    setError(undefined);
    startTransition(async () => {
      const result = await signIn(values);

      if (result.error) {
        if (result.key === "email_not_verified") {
          setShowResendVerificationEmail(true);
        }
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        toast({
          title: "Success",
          description: "You have successfully logged in.",
          variant: "success",
        });
        // Delay the redirect to allow the toast to be shown
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    });
  }

  async function onResendVerificationEmail() {
    const result = await resendVerificationEmail(form.getValues("email"));
    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.success) {
      toast({
        title: "Success",
        description: "Email verification sent",
        variant: "success",
      });
      startCountdown();
    }
  }

  return (
    <>
      <div className="space-y-3">
        <GoogleSignInButton />
        <GitHubSignInButton />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <p className="text-center text-destructive">{error}</p>}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isPending} type="submit" className="w-full">
            Log in
          </LoadingButton>
        </form>
        {showResendVerificationEmail && (
          <div className="mt-2 flex flex-col items-center justify-center gap-2">
            <Button
              variant="link"
              onClick={onResendVerificationEmail}
              disabled={count > 0 && count < 60}
            >
              Resend verification email
            </Button>
            {count > 0 && (
              <p className="text-sm text-muted-foreground">
                Resend in {count} seconds
              </p>
            )}
          </div>
        )}
      </Form>
    </>
  );
}
