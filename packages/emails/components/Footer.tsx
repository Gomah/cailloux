import { Section, Text } from '@react-email/components';

export function TransactionalFooter() {
  const year = new Date().getFullYear();

  return (
    <Section>
      <Text className="mt-6 text-center text-xs text-zinc-500">
        &copy; {year} Acme Technologies Pty Ltd.
        <br />
        1234 Acme St, Acmeville, AC 12345, United States
      </Text>
    </Section>
  );
}
