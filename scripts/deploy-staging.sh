#!/usr/bin/env bash
# Build the site and copy it into the banksia.loffler.au staging folder.
#
# Run on the cPanel server from a clone of this repo:
#   bash scripts/deploy-staging.sh            # deploys to ~/banksia.loffler.au
#   bash scripts/deploy-staging.sh /some/dir  # deploys somewhere else
#
# Staging differences from production:
#   - robots.txt blocks all crawlers
#   - cPanel's generated PHP blocks at the top of the existing .htaccess are kept
set -euo pipefail

TARGET="${1:-$HOME/banksia.loffler.au}"
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. In cPanel, use 'Setup Node.js App' or ask the host for Node 22+." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Node.js 22.12 or newer is required (found $(node -v))." >&2
  exit 1
fi

npm ci
npm run build

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -a dist/. "$STAGE/"
rm -f "$STAGE"/sitemap-*.xml
printf 'User-agent: *\nDisallow: /\n' > "$STAGE/robots.txt"

# Keep cPanel's PHP version and ini blocks from the live .htaccess.
if [ -f "$TARGET/.htaccess" ]; then
  awk '/# BEGIN cPanel-generated php ini/,/# END cPanel-generated php ini/;
       /# php -- BEGIN cPanel-generated handler/,/# php -- END cPanel-generated handler/' \
    "$TARGET/.htaccess" > "$STAGE/cpanel-blocks"
  if [ -s "$STAGE/cpanel-blocks" ]; then
    { cat "$STAGE/cpanel-blocks"; echo; cat "$STAGE/.htaccess"; } > "$STAGE/.htaccess.merged"
    mv "$STAGE/.htaccess.merged" "$STAGE/.htaccess"
  fi
  rm -f "$STAGE/cpanel-blocks"
fi

mkdir -p "$TARGET"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude cgi-bin --exclude .well-known --exclude .user.ini --exclude php.ini \
    "$STAGE/" "$TARGET/"
else
  cp -a "$STAGE/." "$TARGET/"
fi

echo "Deployed to $TARGET"
