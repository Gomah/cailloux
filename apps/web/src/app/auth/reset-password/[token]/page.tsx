import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata = {
  title: 'Reset Password',
  description: 'Reset Password Page',
};

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div>
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
