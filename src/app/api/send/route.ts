import { EmailTemplate } from "@/components/email/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, username, verificationUrl } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "yigitbaba.com <noreply@yigitbaba.com>",
      to: [to],
      subject: "Verify Your Email",
      react: EmailTemplate({ username: username, url: verificationUrl }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
