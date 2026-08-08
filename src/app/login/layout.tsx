export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-surface px-gutter py-xl pt-safe pb-safe">
      <div className="flex w-full max-w-dialog flex-col justify-center">{children}</div>
    </div>
  );
}
