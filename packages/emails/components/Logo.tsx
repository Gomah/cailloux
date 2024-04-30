import { Img } from '@react-email/components';

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '/static';

export function Logo() {
  return (
    <>
      <Img
        src={`${baseUrl}/images/email/logo-dark@2x.png`}
        width="80"
        className="mx-auto my-8 hidden dark:block"
        alt="Acme"
      />

      <Img
        src={`${baseUrl}/images/email/logo@2x.png`}
        width="80"
        className="mx-auto my-8 dark:hidden"
        alt="Acme"
      />
    </>
  );
}
