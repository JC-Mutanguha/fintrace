"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Modal, Text } from "@/components/ui";

type RecordChooserProps = {
  open: boolean;
  onClose: () => void;
};

export function RecordChooser({ open, onClose }: RecordChooserProps) {
  const router = useRouter();

  function go(href: "/paste" | "/add") {
    onClose();
    router.push(href);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record transaction"
      titleId="record-chooser-title"
      size="sheet"
    >
      <div className="flex flex-col gap-sm">
        <button
          type="button"
          onClick={() => go("/paste")}
          className="flex items-start gap-md rounded-card border border-outline-variant/30 bg-surface-container-low p-md text-left transition-colors hover:bg-surface-container-high"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-primary-container text-on-primary-container">
            <Icon name="content_paste" fill className="text-heading" />
          </div>
          <div>
            <Text variant="label">From SMS</Text>
            <Text variant="caption" className="mt-xs">
              Copy and paste a payment SMS to record a transaction.
            </Text>
          </div>
        </button>

        <button
          type="button"
          onClick={() => go("/add")}
          className="flex items-start gap-md rounded-card border border-outline-variant/30 bg-surface-container-low p-md text-left transition-colors hover:bg-surface-container-high"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-surface-container-high text-primary">
            <Icon name="edit_note" className="text-heading" />
          </div>
          <div>
            <Text variant="label">Add manually</Text>
            <Text variant="caption" className="mt-xs">
              For cash, salary, or anything without a text message.
            </Text>
          </div>
        </button>
      </div>
    </Modal>
  );
}
