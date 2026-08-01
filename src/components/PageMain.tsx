import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

type PageMainProps = {
  children: ReactNode;
  className?: string;
};

export function PageMain({ children, className = "" }: PageMainProps) {
  return (
    <main
      className={`mx-auto w-full max-w-content flex-1 px-gutter py-gutter sm:px-lg md:py-lg ${className}`}
    >
      {children}
    </main>
  );
}

type PageTitleProps = {
  title: string;
  subtitle?: string;
};

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-lg hidden md:block">
      <Text as="h1" variant="title">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="muted" className="mt-xs">
          {subtitle}
        </Text>
      ) : null}
    </div>
  );
}
