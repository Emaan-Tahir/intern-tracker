import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async (email, name, token, role) => {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

  await resend.emails.send({
    from: 'Internship Portal <onboarding@resend.dev>',
    to: email,
    subject: `You've been invited as an ${role}`,
    html: `
      <p>Hi ${name},</p>
      <p>You've been added as an ${role} on the internship portal.</p>
      <p><a href="${inviteUrl}">Click here to set your password and get started</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });
};
