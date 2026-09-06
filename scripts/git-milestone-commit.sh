#!/usr/bin/env bash
# Create a commit without Cursor co-author injection (uses git commit-tree).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUTHOR_NAME="${GIT_AUTHOR_NAME:-JC Mutanguha}"
AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-mutanguhajeanclaude824@gmail.com}"
AUTHOR="$AUTHOR_NAME <$AUTHOR_EMAIL>"

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <author-date> <message> [paths...]" >&2
  echo "  Stages given paths (or all if none), then commits with commit-tree." >&2
  exit 1
fi

DATE="$1"
shift
MSG="$1"
shift

if [ "$#" -gt 0 ]; then
  git add "$@"
else
  git add -A
fi

if git diff --cached --quiet; then
  echo "Nothing staged to commit." >&2
  exit 1
fi

TREE=$(git write-tree)
PARENT=""
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  PARENT=$(git rev-parse HEAD)
fi

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo main)

if [ -n "$PARENT" ]; then
  COMMIT=$(printf '%s\n' "$MSG" | GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
    GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
    GIT_COMMITTER_DATE="$DATE" git commit-tree "$TREE" -p "$PARENT")
else
  COMMIT=$(printf '%s\n' "$MSG" | GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
    GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
    GIT_COMMITTER_DATE="$DATE" git commit-tree "$TREE")
fi

git update-ref "refs/heads/$BRANCH" "$COMMIT"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git reset --mixed HEAD >/dev/null
else
  git read-tree "$COMMIT" && git reset --mixed "$COMMIT" >/dev/null
fi

echo "$COMMIT $(git show -s --format='%ad %s' --date=short "$COMMIT")"
