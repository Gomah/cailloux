import { type ButtonProps, Button as ReactEmailButton } from '@react-email/components';

export function Button(props: ButtonProps) {
  return (
    <ReactEmailButton
      className="rounded bg-zinc-900 px-5 py-3 text-center font-semibold text-base text-zinc-50 no-underline"
      {...props}
    />
  );
}
