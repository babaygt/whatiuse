import { PasswordResetEmailTemplate } from "@/components/email/PasswordResetEmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, username, resetUrl } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "yigitbaba.com <noreply@yigitbaba.com>",
      to: [to],
      subject: "Reset Your Password",
      react: PasswordResetEmailTemplate({ username, url: resetUrl }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
