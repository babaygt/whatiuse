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
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "./actions";
import Alert from "@/components/Alert";

export default function ResetPasswordForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      newPassword: "",
      logoutFromAllDevices: false,
    },
  });

  async function onSubmit() {
    setOpen(true);
  }

  async function handleResetPassword() {
    setOpen(false);
    setError(undefined);
    startTransition(async () => {
      const res = await resetPassword(form.getValues());
      if (res.error) {
        setError(res.error);
        toast({
          title: "Error",
          description: res.error ? res.error : "Something went wrong.",
          variant: "destructive",
        });
      } else if (res.success) {
        toast({
          title: "Success",
          description: "Password has been reset successfully.",
          variant: "success",
        });
      }
      form.reset();
    });
  }

  return (
    <>
      <Alert
        title="Are you sure to reset your password?"
        description="This action cannot be undone. This will change your password."
        action={handleResetPassword}
        actionText="Continue"
        open={open}
        setOpen={setOpen}
        triggerElement={null}
        checkboxText="Sign out from all devices"
        onCheckedChange={(checked) => {
          form.setValue("logoutFromAllDevices", checked, {
            shouldValidate: true,
          });
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <p className="text-center text-destructive">{error}</p>}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Current Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="New Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm New Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isPending} type="submit" className="w-full">
            Reset Password
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}
