#!/usr/bin/env bash
# Builds a .vsix from one manifest and verifies it.
# Use the wrappers instead of calling this directly:
#   ./package-dev.sh    builds from vss-extension-dev.json (private test extension)
#   ./package-prod.sh   builds from vss-extension.json (public release)
# Needs: node 20, npm, tfx (npm install -g tfx-cli), zip, unzip.

# Restart in bash when started with sh, which lacks features used below.
[ -n "${BASH_VERSION:-}" ] || exec bash "$0" "$@"

set -euo pipefail
cd "$(dirname "$0")"

MANIFEST="${1:-}"
if [ ! -f "$MANIFEST" ]; then
  echo "Usage: $0 <manifest.json>   (for example vss-extension-dev.json)"
  exit 2
fi

for tool in node npm tfx zip unzip; do
  command -v "$tool" >/dev/null || { echo "Missing tool: $tool (see README, section 1)"; exit 1; }
done

EXTENSION_FILENAME="$(node -e 'const m=require("./'"$MANIFEST"'");console.log(m.publisher+"."+m.id+"-"+m.version+".vsix")')"

echo "== Building $EXTENSION_FILENAME"

(
  cd katalonTask
  npm install
  rm -rf build
  npx babel src --out-dir build
  test -f build/index.js
  npm prune --omit=dev
)

rm -f "$EXTENSION_FILENAME"
tfx extension create --manifest-globs "$MANIFEST"

# The Marketplace rejects arm64 entries in [Content_Types].xml
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
unzip -p "$EXTENSION_FILENAME" '\[Content_Types\].xml' | grep -v 'arm64' > "$TMP_DIR/[Content_Types].xml"
(cd "$TMP_DIR" && zip "$OLDPWD/$EXTENSION_FILENAME" '[Content_Types].xml')

echo "== Verifying"
./verify-vsix.sh "$EXTENSION_FILENAME" "$MANIFEST"

echo "== Done: $PWD/$EXTENSION_FILENAME"
