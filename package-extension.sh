#!/usr/bin/env bash
# Builds a .vsix from one manifest and verifies it.
# Usage: package-extension.sh <manifest.json> [task-overrides.json]
# Use the wrappers instead of calling this directly:
#   ./package-dev.sh    builds from vss-extension-dev.json (private test extension)
#   ./package-prod.sh   builds from vss-extension.json (public release)
# The optional overrides file replaces fields of katalonTask/task.json inside the package only.
# The dev build needs its own task id and name: an organization allows each task id once,
# and the production extension already owns the id in task.json.
# Needs: node 20, npm, tfx (npm install -g tfx-cli), zip, unzip.

# Restart in bash when started with sh, which lacks features used below.
[ -n "${BASH_VERSION:-}" ] || exec bash "$0" "$@"

set -euo pipefail
cd "$(dirname "$0")"

MANIFEST="${1:-}"
TASK_OVERRIDES="${2:-}"
if [ ! -f "$MANIFEST" ] || { [ -n "$TASK_OVERRIDES" ] && [ ! -f "$TASK_OVERRIDES" ]; }; then
  echo "Usage: $0 <manifest.json> [task-overrides.json]   (for example vss-extension-dev.json)"
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

TMP_DIR="$(mktemp -d)"
TASK_JSON=katalonTask/task.json
cp "$TASK_JSON" "$TMP_DIR/task.json.orig"
# Always put the original task.json back, even when a step below fails.
trap 'cp "$TMP_DIR/task.json.orig" "$TASK_JSON"; rm -rf "$TMP_DIR"' EXIT

if [ -n "$TASK_OVERRIDES" ]; then
  node -e '
    const fs = require("fs");
    const [taskPath, overridesPath] = process.argv.slice(1);
    const task = JSON.parse(fs.readFileSync(taskPath, "utf8"));
    const merged = Object.assign(task, JSON.parse(fs.readFileSync(overridesPath, "utf8")));
    fs.writeFileSync(taskPath, JSON.stringify(merged, null, 4) + "\n");
  ' "$TASK_JSON" "$TASK_OVERRIDES"
fi

rm -f "$EXTENSION_FILENAME"
tfx extension create --manifest-globs "$MANIFEST"

# The Marketplace rejects arm64 entries in [Content_Types].xml
unzip -p "$EXTENSION_FILENAME" '\[Content_Types\].xml' | grep -v 'arm64' > "$TMP_DIR/[Content_Types].xml"
(cd "$TMP_DIR" && zip "$OLDPWD/$EXTENSION_FILENAME" '[Content_Types].xml')

echo "== Verifying"
./verify-vsix.sh "$EXTENSION_FILENAME" "$MANIFEST"

echo "== Done: $PWD/$EXTENSION_FILENAME"
