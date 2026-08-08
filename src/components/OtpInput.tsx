"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

const LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const labelId = useId();
  const autofillRef = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const setCode = useCallback(
    (next: string) => {
      const cleaned = next.replace(/\D/g, "").slice(0, LENGTH);
      onChange(cleaned);
      if (cleaned.length === LENGTH) {
        onComplete?.(cleaned);
      }
    },
    [onChange, onComplete],
  );

  useEffect(() => {
    if (autoFocus) {
      digitRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  function focusDigit(index: number) {
    const target = digitRefs.current[Math.max(0, Math.min(index, LENGTH - 1))];
    target?.focus();
    target?.select();
  }

  function handleDigitChange(index: number, raw: string) {
    const chunk = raw.replace(/\D/g, "");
    if (!chunk) {
      const next = digits.map((d, i) => (i === index ? "" : d)).join("");
      setCode(next);
      return;
    }

    if (chunk.length > 1) {
      setCode(chunk);
      focusDigit(Math.min(chunk.length, LENGTH - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = chunk[0];
    const next = nextDigits.join("");
    setCode(next);
    if (index < LENGTH - 1) {
      focusDigit(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      setCode(nextDigits.join(""));
      focusDigit(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusDigit(index - 1);
    }
    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      focusDigit(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    setCode(pasted);
    focusDigit(Math.min(pasted.length, LENGTH - 1));
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <span id={labelId} className="font-label text-sm font-medium text-on-surface">
        Verification code
      </span>

      {/* Lets iOS/Android suggest the SMS code */}
      <input
        ref={autofillRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
        onChange={(event) => setCode(event.target.value)}
      />

      <div
        role="group"
        aria-labelledby={labelId}
        className="grid w-full grid-cols-6 gap-2"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              digitRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            maxLength={6}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className="h-12 w-full rounded-lg border border-outline-variant/30 bg-surface text-center font-headline text-xl text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        ))}
      </div>
    </div>
  );
}

export function useResendCooldown(active: boolean, resetKey: string | number) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!active) return;
    setSeconds(60);
  }, [active, resetKey]);

  useEffect(() => {
    if (!active || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [active, seconds]);

  return seconds;
}

export function preventEmptyOtpSubmit(
  event: FormEvent<HTMLFormElement>,
  otp: string,
) {
  if (otp.replace(/\D/g, "").length !== LENGTH) {
    event.preventDefault();
  }
}
