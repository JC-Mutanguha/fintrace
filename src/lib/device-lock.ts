import { APP_NAME, DEFAULT_USER_LABEL } from "@/lib/brand";

export const APP_LOCK_CREDENTIAL_KEY = "paytrace-app-lock-credential";

export type DeviceLockSupport = {
  available: boolean;
  reason: string | null;
};

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function isIpHostname(hostname: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

/** Why device lock may be unavailable on this page. */
export function getDeviceLockSupport(): DeviceLockSupport {
  if (typeof window === "undefined") {
    return { available: false, reason: null };
  }

  if (!window.isSecureContext) {
    const host = window.location.host;
    return {
      available: false,
      reason: `Device lock needs HTTPS. You are on http://${host}. For phone testing run npm run dev:https, accept the certificate warning, then open https://${host}.`,
    };
  }

  if (!window.PublicKeyCredential) {
    return {
      available: false,
      reason:
        "This browser does not support device lock. Try Safari or Chrome on your phone, or install FinTrace from a secure https:// link.",
    };
  }

  if (isIpHostname(window.location.hostname)) {
    return {
      available: false,
      reason:
        "Face ID and fingerprint usually do not work in the browser when the address is an IP (192.168…). Use an https:// domain — for example your deployed FinTrace URL or an HTTPS tunnel.",
    };
  }

  return { available: true, reason: null };
}

export async function canUseDeviceBiometric(): Promise<boolean> {
  const support = getDeviceLockSupport();
  if (!support.available) return false;

  if (!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function getDeviceLockAvailability(): Promise<DeviceLockSupport> {
  const support = getDeviceLockSupport();
  if (!support.available) return support;

  const platformReady = await canUseDeviceBiometric();
  if (!platformReady) {
    return {
      available: false,
      reason:
        "This browser does not expose Face ID, fingerprint, or screen lock to websites. Try Safari or Chrome, or open FinTrace over HTTPS from your production URL.",
    };
  }

  return { available: true, reason: null };
}

export function hasDeviceLockRegistered(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(APP_LOCK_CREDENTIAL_KEY));
}

export function clearDeviceLock() {
  localStorage.removeItem(APP_LOCK_CREDENTIAL_KEY);
}

export async function registerDeviceLock(input: {
  userId: string;
  email?: string;
  name?: string;
}): Promise<{ error?: string }> {
  const support = await getDeviceLockAvailability();
  if (!support.available) {
    return { error: support.reason ?? "Device lock is not available here." };
  }

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: {
          name: APP_NAME,
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(input.userId),
          name: input.email ?? input.userId,
          displayName: input.name ?? DEFAULT_USER_LABEL,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: 60_000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!credential?.rawId) {
      return { error: "Could not register device lock" };
    }

    localStorage.setItem(
      APP_LOCK_CREDENTIAL_KEY,
      bufferToBase64url(credential.rawId),
    );
    return {};
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      return { error: "Device lock setup was cancelled" };
    }
    if (err instanceof DOMException && err.name === "SecurityError") {
      return {
        error:
          "Browser blocked device lock on this address. Open FinTrace over HTTPS from a domain name, not http:// or an IP address.",
      };
    }
    return { error: "Could not set up device lock on this browser" };
  }
}

export async function verifyDeviceLock(): Promise<{ error?: string }> {
  const stored = localStorage.getItem(APP_LOCK_CREDENTIAL_KEY);
  if (!stored) {
    return { error: "Device lock is not set up" };
  }

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [
          {
            id: base64urlToBuffer(stored),
            type: "public-key",
          },
        ],
        userVerification: "required",
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { error: "Unlock failed" };
    }
    return {};
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      return { error: "Unlock cancelled" };
    }
    return { error: "Could not verify with device lock" };
  }
}
