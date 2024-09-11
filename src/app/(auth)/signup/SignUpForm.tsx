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
import { signUpSchema, SignUpSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignIn";
import { GitHubSignInButton } from "@/components/auth/GitHubSignIn";

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpSchema) {
    setError(undefined);
    startTransition(async () => {
      const result = await signUp(values);

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
          description:
            "Your account has been created successfully. Please check your email for verification.",
          variant: "success",
        });
      }
    });
  }

  return (
    <>
      <div className="space-y-3">
        <GoogleSignInButton />
        <GitHubSignInButton />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <p className="text-center text-destructive">{error}</p>}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            Create account
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}
