#!/bin/sh
# Vercel build for one app: `sh ../../scripts/vercel-build.sh @sofora/web` (see each app's vercel.json).
# With CONVEX_DEPLOY_KEY set, it deploys the Convex backend first and builds against that deployment.
# Without it, it only builds, using VITE_CONVEX_URL. Give the key to one project (the website), so the
# backend is deployed once per push; the portal project just needs VITE_CONVEX_URL. See docs/deployment.md.
set -e
cd "$(dirname "$0")/.."
if [ -n "$CONVEX_DEPLOY_KEY" ]; then
  pnpm exec convex deploy --cmd "pnpm --filter $1 build" --cmd-url-env-var-name VITE_CONVEX_URL
elif [ -n "$VITE_CONVEX_URL" ]; then
  pnpm --filter "$1" build
else
  echo "Set CONVEX_DEPLOY_KEY (deploys the backend) or VITE_CONVEX_URL (build only) in the Vercel project." >&2
  exit 1
fi
