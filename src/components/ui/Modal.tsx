"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Text } from "@/components/ui/Text";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleId?: string;
  size?: "dialog" | "sheet";
  showClose?: boolean;
  children: ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  titleId,
  size = "dialog",
  showClose = true,
  children,
}: ModalProps) {
  if (!open) return null;

  const widthClass = size === "sheet" ? "max-w-sheet" : "max-w-dialog";

  return (
    <div className="fixed inset-0 z-overlay flex items-end justify-center bg-scrim p-gutter sm:items-center">
      <div
        className={`w-full ${widthClass} rounded-sheet bg-surface p-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {title && (
          <div className="mb-md flex items-center justify-between">
            <Text as="h2" variant="heading" id={titleId}>
              {title}
            </Text>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-pill text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
