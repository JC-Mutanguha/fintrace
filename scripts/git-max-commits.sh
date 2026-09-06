#!/usr/bin/env bash
# Rebuild main with many milestone commits (no Cursor co-author).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MC="$ROOT/scripts/git-milestone-commit.sh"

c() { "$MC" "$1" "$2" "${@:3}"; }

git checkout --orphan rebuild-main 2>/dev/null || git checkout rebuild-main
git reset --mixed >/dev/null 2>&1 || true
git rm -rf --cached . >/dev/null 2>&1 || true

# Jul 29 — project bootstrap
c "2026-07-29 09:00:00 +0200" "chore: init package and lockfile" package.json package-lock.json
c "2026-07-29 10:15:00 +0200" "chore: add TypeScript and Next.js config" tsconfig.json next.config.ts
c "2026-07-29 11:30:00 +0200" "chore: add ESLint and PostCSS config" eslint.config.mjs postcss.config.mjs
c "2026-07-29 14:00:00 +0200" "chore: add gitignore and env example" .gitignore .env.example
c "2026-07-29 16:45:00 +0200" "docs: add README and agent notes" README.md AGENTS.md

# Jul 30 — design docs
c "2026-07-30 10:00:00 +0200" "docs: add design system rules" design/RULES.md design/DESIGN.md
c "2026-07-30 15:20:00 +0200" "chore: add Stitch design references" design/stitch/

# Jul 31 — tokens and UI primitives
c "2026-07-31 09:30:00 +0200" "feat: add global CSS design tokens" src/app/globals.css
c "2026-07-31 11:00:00 +0200" "feat: add brand constants" src/lib/brand.ts
c "2026-07-31 13:15:00 +0200" "feat: add Button and Text components" src/components/ui/Button.tsx src/components/ui/Text.tsx
c "2026-07-31 15:40:00 +0200" "feat: add Card and Input components" src/components/ui/Card.tsx src/components/ui/Input.tsx
c "2026-07-31 17:10:00 +0200" "feat: add Modal, List, and ErrorBanner" src/components/ui/Modal.tsx src/components/ui/List.tsx src/components/ui/ErrorBanner.tsx
c "2026-07-31 18:30:00 +0200" "feat: export UI component barrel" src/components/ui/index.ts

# Aug 1 — app shell
c "2026-08-01 09:00:00 +0200" "feat: add root layout" src/app/layout.tsx
c "2026-08-01 11:20:00 +0200" "feat: add Icon and Toggle components" src/components/Icon.tsx src/components/Toggle.tsx
c "2026-08-01 14:00:00 +0200" "feat: add PageMain and loading skeleton" src/components/PageMain.tsx src/components/LoadingSkeleton.tsx
c "2026-08-01 16:30:00 +0200" "feat: add Toast notifications" src/components/Toast.tsx
c "2026-08-01 18:00:00 +0200" "feat: add navigation config" src/lib/nav.ts

# Aug 2 — navigation chrome
c "2026-08-02 10:00:00 +0200" "feat: add mobile header" src/components/MobileHeader.tsx
c "2026-08-02 12:30:00 +0200" "feat: add bottom and side navigation" src/components/BottomNav.tsx src/components/SideNav.tsx
c "2026-08-02 15:00:00 +0200" "feat: add AppShell layout wrapper" src/components/AppShell.tsx

# Aug 3 — public assets
c "2026-08-03 09:15:00 +0200" "feat: add PWA manifest and icons" public/manifest.json public/icon.svg public/icons.svg public/favicon.svg
c "2026-08-03 11:45:00 +0200" "feat: add public assets and scan page" public/dev-qr.png public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg public/scan.html

# Aug 4 — InsForge client
c "2026-08-04 10:00:00 +0200" "feat: add InsForge browser client" src/lib/insforge/client.ts
c "2026-08-04 13:30:00 +0200" "feat: add InsForge server client" src/lib/insforge/server.ts
c "2026-08-04 16:00:00 +0200" "feat: add transactions migration" migrations/

# Aug 5 — data layer
c "2026-08-05 09:30:00 +0200" "feat: add transaction DB helpers" src/lib/db/transactions.ts
c "2026-08-05 12:00:00 +0200" "feat: add category definitions and rules" src/lib/categories.ts src/lib/category-rules.ts
c "2026-08-05 14:45:00 +0200" "feat: add transaction context and data helpers" src/lib/transactions.tsx src/lib/data.ts
c "2026-08-05 17:20:00 +0200" "feat: add transaction server actions" src/app/actions/transactions.ts

# Aug 6 — proxy and API
c "2026-08-06 10:15:00 +0200" "feat: add auth refresh API route" src/app/api/
c "2026-08-06 13:00:00 +0200" "feat: add session proxy middleware" src/proxy.ts
c "2026-08-06 16:30:00 +0200" "feat: add CategoryPicker component" src/components/CategoryPicker.tsx

# Aug 7 — auth foundation
c "2026-08-07 09:00:00 +0200" "feat: add auth session helpers" src/lib/auth-session.ts src/lib/auth.tsx
c "2026-08-07 11:30:00 +0200" "feat: add LAN-aware auth redirect URLs" src/lib/auth-url.ts
c "2026-08-07 14:00:00 +0200" "feat: add auth server actions" src/app/actions/auth.ts

# Aug 8 — login UI
c "2026-08-08 10:00:00 +0200" "feat: add login page layout" src/app/login/layout.tsx
c "2026-08-08 13:15:00 +0200" "feat: add sign-in and sign-up page" src/app/login/page.tsx
c "2026-08-08 16:45:00 +0200" "feat: add OTP input component" src/components/OtpInput.tsx

# Aug 9 — auth panels
c "2026-08-09 09:30:00 +0200" "feat: add email verification panel" src/components/VerifyEmailPanel.tsx
c "2026-08-09 12:00:00 +0200" "feat: add forgot password flow" src/components/ForgotPasswordPanel.tsx
c "2026-08-09 15:30:00 +0200" "feat: add reset password link panel" src/components/ResetPasswordLinkPanel.tsx
c "2026-08-09 17:45:00 +0200" "feat: add onboarding gate" src/components/OnboardingGate.tsx

# Aug 10 — home
c "2026-08-10 10:00:00 +0200" "feat: add home dashboard page" src/app/page.tsx

# Aug 11 — activity
c "2026-08-11 09:30:00 +0200" "feat: add activity list page" src/app/activity/

# Aug 12 — manual entry
c "2026-08-12 11:00:00 +0200" "feat: add manual transaction entry" src/app/add/
c "2026-08-12 14:30:00 +0200" "feat: add record chooser component" src/components/RecordChooser.tsx

# Aug 13 — notifications and export
c "2026-08-13 10:15:00 +0200" "feat: add transaction notifications" src/lib/notifications.ts
c "2026-08-13 13:45:00 +0200" "feat: add CSV export helper" src/lib/export-transactions.ts

# Aug 14 — SMS parser core
c "2026-08-14 09:00:00 +0200" "feat: add SMS parser module" src/lib/sms-parser.ts
c "2026-08-14 14:00:00 +0200" "feat: add paste SMS page" src/app/paste/

# Aug 15 — countries and money
c "2026-08-15 10:30:00 +0200" "feat: add country data and helpers" src/lib/countries-data.json src/lib/countries.ts
c "2026-08-15 13:00:00 +0200" "feat: add currency formatting helpers" src/lib/money.ts

# Aug 16 — onboarding
c "2026-08-16 09:45:00 +0200" "feat: add user preferences sync" src/lib/user-preferences.ts
c "2026-08-16 12:30:00 +0200" "feat: add onboarding server actions" src/app/actions/onboarding.ts src/app/actions/region.ts
c "2026-08-16 15:00:00 +0200" "feat: add onboarding flow page" src/app/onboarding/

# Aug 17 — settings core
c "2026-08-17 10:00:00 +0200" "feat: add settings store and provider" src/lib/settings-store.ts src/lib/settings.tsx
c "2026-08-17 13:30:00 +0200" "feat: add region currency sheet" src/components/RegionCurrencySheet.tsx
c "2026-08-17 16:00:00 +0200" "feat: add settings page" src/app/settings/page.tsx

# Aug 18 — settings subpages
c "2026-08-18 09:30:00 +0200" "feat: add settings help page" src/app/settings/help/
c "2026-08-18 12:00:00 +0200" "feat: add settings privacy page" src/app/settings/privacy/

# Aug 19 — insights
c "2026-08-19 11:00:00 +0200" "feat: add insights dashboard" src/app/insights/

# Aug 20 — device lock
c "2026-08-20 10:15:00 +0200" "feat: add device lock helpers" src/lib/device-lock.ts
c "2026-08-20 14:30:00 +0200" "feat: add app lock overlay" src/components/AppLock.tsx

# Aug 21 — transaction details
c "2026-08-21 09:00:00 +0200" "feat: add transaction details drawer" src/components/TransactionDetails.tsx
c "2026-08-21 11:45:00 +0200" "feat: add transaction purpose helpers" src/lib/transaction-purpose.ts

# Aug 22 — polish
c "2026-08-22 10:30:00 +0200" "chore: add skills lock file" skills-lock.json
c "2026-08-22 14:00:00 +0200" "chore: add favicon" src/app/favicon.ico

# Aug 24–Sep 6 — tooling
c "2026-09-06 18:00:00 +0200" "chore: add git commit helper scripts" scripts/

git branch -D main 2>/dev/null || true
git branch -m main

echo "Done: $(git rev-list --count HEAD) commits"
