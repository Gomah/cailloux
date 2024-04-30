import { type TailwindProps, Tailwind as TailwindReactEmail } from '@react-email/components';

export function Tailwind(props: TailwindProps) {
  return (
    <TailwindReactEmail
      config={{
        ...(process.env.NODE_ENV === 'development' && {
          darkMode: 'class',
        }),
        ...props.config,
      }}
    >
      {props.children}
    </TailwindReactEmail>
  );
}
