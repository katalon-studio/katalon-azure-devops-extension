#!/usr/bin/env bash
# Usage: ./vsix-summary.sh <file.vsix>
# Prints the package metadata and the steps to upload it, as Markdown.
# Needs: unzip.

[ -n "${BASH_VERSION:-}" ] || exec bash "$0" "$@"

set -euo pipefail

VSIX="${1:-}"
if [ ! -f "$VSIX" ]; then
  echo "Usage: $0 <file.vsix>"
  exit 2
fi

IDENTITY="$(unzip -p "$VSIX" extension.vsixmanifest | grep -o '<Identity [^>]*>')"
attr() { printf '%s' "$IDENTITY" | sed -n "s/.* $1=\"\([^\"]*\)\".*/\1/p"; }
DISPLAY_NAME="$(unzip -p "$VSIX" extension.vsixmanifest | sed -n 's:.*<DisplayName>\(.*\)</DisplayName>.*:\1:p' | head -1)"
EXT_ID="$(attr Id)"
EXT_PUBLISHER="$(attr Publisher)"
EXT_VERSION="$(attr Version)"

if command -v sha256sum >/dev/null; then
  SHA256="$(sha256sum "$VSIX" | cut -d' ' -f1)"
else
  SHA256="$(shasum -a 256 "$VSIX" | cut -d' ' -f1)"
fi

cat <<EOF
### $DISPLAY_NAME $EXT_VERSION

| Field | Value |
| --- | --- |
| File | \`$(basename "$VSIX")\` |
| Size | $(du -h "$VSIX" | cut -f1) |
| SHA-256 | \`$SHA256\` |
| Extension id | \`$EXT_ID\` |
| Publisher | \`$EXT_PUBLISHER\` |
| Version | \`$EXT_VERSION\` |

**Upload**
1. Download the \`.vsix\` from this run's artifacts.
2. Open https://marketplace.visualstudio.com/manage and select the publisher \`$EXT_PUBLISHER\`. You must be a member of it.
3. Find **$DISPLAY_NAME** in the list. The list shows display names, not ids.
   - Not in the list: click **New extension → Azure DevOps** and upload the file.
   - In the list: click \`...\` next to **$DISPLAY_NAME**, then **Update**, and upload the file.
4. The version must be higher than the one already published. See the **Version** column on the manage page. A public extension also shows it at https://marketplace.visualstudio.com/items?itemName=$EXT_PUBLISHER.$EXT_ID
5. Wait for validation. A private extension also needs **Share/Unshare** with the organization that tests it.
EOF
