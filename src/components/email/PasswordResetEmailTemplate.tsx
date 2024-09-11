interface PasswordResetEmailTemplateProps {
  username: string;
  url: string;
}

export const PasswordResetEmailTemplate: React.FC<
  Readonly<PasswordResetEmailTemplateProps>
> = ({ username, url }) => (
  <div className="mx-auto max-w-md rounded-lg bg-white p-8 font-sans">
    <div className="mb-6 text-center">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">
        Reset Your Password, {username}!
      </h1>
      <p className="text-gray-600">
        We received a request to reset your password.
      </p>
    </div>
    <div className="mb-6 rounded-md bg-gray-100 p-6">
      <p className="mb-4 text-gray-700">
        To reset your password, please click the button below:
      </p>
      <a
        href={url}
        className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center font-bold text-white transition duration-300 hover:bg-blue-700"
      >
        Reset Password
      </a>
    </div>
    <p className="text-center text-sm text-gray-500">
      If you didn&apos;t request a password reset, please ignore this email.
    </p>
  </div>
);
