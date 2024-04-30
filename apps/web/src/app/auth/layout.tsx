export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="container sm:max-w-md">{children}</div>
    </div>
  );
}
