import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';

import { Button } from '../components/Button';
import { TransactionalFooter } from '../components/Footer';
import { Logo } from '../components/Logo';
import { Tailwind } from '../components/Tailwind';

export type ResetPasswordProps = {
  action_url: string;
  expiresIn: number;
};

export const ResetPassword = ({ action_url, expiresIn }: ResetPasswordProps) => {
  const hours = Math.floor(expiresIn / 60).toString();

  return (
    <Html lang="en">
      <Preview>
        Use this link to reset your password. The link is only valid for {hours} hours.
      </Preview>
      <Tailwind>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Body className="bg-zinc-50 font-sans dark:bg-zinc-900">
          <Logo />
          <Container className="rounded border border-zinc-200 border-solid bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
            <Text className="mt-0 text-base text-zinc-600 leading-2 dark:text-zinc-300">
              Hello,
              <br />
              <br />
              Someone recently requested a password change for your Acme account. If this was you,
              you can set a new password here:
            </Text>

            <Section>
              <Button href={action_url}>Reset your password</Button>
            </Section>

            <Text className="text-xs text-zinc-500">
              Please note this link expires in {hours} hours.
            </Text>

            <Hr className="mx-0 my-8 w-full border border-zinc-200 border-solid dark:border-zinc-800" />

            <Text className="mb-0 text-xs text-zinc-600 leading-tight dark:text-zinc-400">
              If you don't want to change your password or didn't request this, just ignore and
              delete this message.
              <br />
              <br />
              Thanks,
              <br />
              The Acme Team
            </Text>
          </Container>

          <TransactionalFooter />
        </Body>
      </Tailwind>
    </Html>
  );
};

ResetPassword.PreviewProps = {
  action_url: 'https://example.com/reset-password?token=123',
  expiresIn: 120,
} as ResetPasswordProps;

export default ResetPassword;
