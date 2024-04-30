import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';

import { TransactionalFooter } from '../components/Footer';
import { Logo } from '../components/Logo';
import { Tailwind } from '../components/Tailwind';

export type VerifyEmailWithCodeProps = {
  code: string;
  expiresIn: number;
};

export const VerifyEmailWithCode = ({ code, expiresIn }: VerifyEmailWithCodeProps) => {
  return (
    <Html lang="en">
      <Preview>Verify your email address</Preview>
      <Tailwind>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Body className="bg-zinc-50 font-sans dark:bg-zinc-900">
          <Logo />
          <Container className="rounded border border-zinc-200 border-solid bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
            <Text className="my-0 font-semibold text-2xl text-zinc-900 dark:text-zinc-100">
              Verify your email address
            </Text>

            <Text className="text-base text-zinc-600 leading-2 dark:text-zinc-300">
              Your verification code is below - enter it in your open browser window and we'll help
              you get signed in.
            </Text>

            <Section className="rounded bg-zinc-100 text-center dark:bg-zinc-900">
              <Text className="text-5xl text-zinc-900 tracking-widest dark:text-zinc-50">
                {code}
              </Text>
            </Section>

            <Text className="text-xs text-zinc-500">
              Please note this code is only valid for {expiresIn} minutes.
            </Text>

            <Hr className="mx-0 my-8 w-full border border-zinc-200 border-solid dark:border-zinc-800" />

            <Text className="mb-0 text-xs text-zinc-600 leading-tight dark:text-zinc-400">
              If you didn't sign up for Acme, you can safely ignore this email.
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

VerifyEmailWithCode.PreviewProps = {
  code: '123854',
  expiresIn: 15,
} as VerifyEmailWithCodeProps;

export default VerifyEmailWithCode;
