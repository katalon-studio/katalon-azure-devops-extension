#!/usr/bin/env bash
# Usage: ./verify-vsix.sh [file.vsix] [manifest.json]
# Without a file argument, checks the newest *.vsix in the current directory.
# With a manifest (for example vss-extension-dev.json), also compares id, publisher and version.
# Needs: unzip, node.

# Restart in bash when started with sh, which lacks features used below.
[ -n "${BASH_VERSION:-}" ] || exec bash "$0" "$@"

set -u

VSIX="${1:-$(ls -t ./*.vsix 2>/dev/null | head -1)}"
MANIFEST="${2:-}"
TASK_DIR="katalonTask"

FAILS=0
WARNS=0
pass() { echo "  [PASS] $1"; }
fail() { echo "  [FAIL] $1"; FAILS=$((FAILS + 1)); }
warn() { echo "  [WARN] $1"; WARNS=$((WARNS + 1)); }

for tool in unzip node; do
  command -v "$tool" >/dev/null || { echo "Missing tool: $tool"; exit 2; }
done

if [ -z "$VSIX" ] || [ ! -f "$VSIX" ]; then
  echo "File not found: ${VSIX:-<no .vsix in current directory>}"
  echo "Usage: $0 [file.vsix] [manifest.json]"
  exit 2
fi

echo "Checking: $VSIX ($(du -h "$VSIX" | cut -f1))"

echo "1. Zip integrity"
if unzip -tq "$VSIX" >/dev/null 2>&1; then pass "zip is readable"; else fail "zip is corrupt"; exit 1; fi

ENTRIES="$(unzip -Z1 "$VSIX")"
has_entry() { printf '%s\n' "$ENTRIES" | grep -Fxq "$1"; }
# unzip treats [ and ] as wildcards, so escape them to read "[Content_Types].xml".
read_entry() { unzip -p "$VSIX" "$(printf '%s' "$1" | sed 's/[][]/\\&/g')" 2>/dev/null; }

echo "2. Required files"
for entry in "extension.vsixmanifest" "[Content_Types].xml" "$TASK_DIR/task.json" "$TASK_DIR/package.json"; do
  if has_entry "$entry"; then pass "$entry"; else fail "$entry is missing"; fi
done

echo "3. Extension identity"
IDENTITY="$(read_entry extension.vsixmanifest | grep -o '<Identity [^>]*>')"
attr() { printf '%s' "$IDENTITY" | sed -n "s/.* $1=\"\([^\"]*\)\".*/\1/p"; }
EXT_ID="$(attr Id)"
EXT_VERSION="$(attr Version)"
EXT_PUBLISHER="$(attr Publisher)"
if [ -n "$EXT_ID" ] && [ -n "$EXT_VERSION" ] && [ -n "$EXT_PUBLISHER" ]; then
  pass "id=$EXT_ID publisher=$EXT_PUBLISHER version=$EXT_VERSION"
else
  fail "cannot read Id, Version or Publisher from extension.vsixmanifest"
fi

if [ -n "$MANIFEST" ]; then
  if [ -f "$MANIFEST" ]; then
    EXPECTED="$(node -e 'const m=require(require("path").resolve(process.argv[1]));console.log([m.id,m.publisher,m.version].join(" "))' "$MANIFEST")"
    if [ "$EXPECTED" = "$EXT_ID $EXT_PUBLISHER $EXT_VERSION" ]; then
      pass "matches $MANIFEST"
    else
      fail "differs from $MANIFEST (expected: $EXPECTED)"
    fi
  else
    fail "manifest not found: $MANIFEST"
  fi
fi

echo "4. Task entry point"
TASK_JSON="$(read_entry "$TASK_DIR/task.json")"
TARGETS="$(printf '%s' "$TASK_JSON" | node -e 'const t=JSON.parse(require("fs").readFileSync(0,"utf8"));for(const k of Object.keys(t.execution||{}))console.log(t.execution[k].target)' 2>/dev/null)"
if [ -z "$TARGETS" ]; then
  fail "no execution target in task.json"
else
  for target in $TARGETS; do
    if has_entry "$TASK_DIR/$target"; then pass "$TASK_DIR/$target exists"; else fail "$TASK_DIR/$target is missing (the Babel build did not run or failed)"; fi
  done
fi

TASK_IDENTITY="$(printf '%s' "$TASK_JSON" | node -e 'const t=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(t.name+" ("+t.id+")")' 2>/dev/null)"
pass "task $TASK_IDENTITY"

echo "5. Versions"
TASK_VERSION="$(printf '%s' "$TASK_JSON" | node -e 'const v=JSON.parse(require("fs").readFileSync(0,"utf8")).version;console.log(v.Major+"."+v.Minor+"."+v.Patch)' 2>/dev/null)"
PKG_JSON="$(read_entry "$TASK_DIR/package.json")"
PKG_VERSION="$(printf '%s' "$PKG_JSON" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0,"utf8")).version)' 2>/dev/null)"
if [ "$EXT_VERSION" = "$TASK_VERSION" ] && [ "$EXT_VERSION" = "$PKG_VERSION" ]; then
  pass "extension, task.json and package.json all use $EXT_VERSION"
else
  fail "versions differ: extension=$EXT_VERSION task.json=$TASK_VERSION package.json=$PKG_VERSION"
fi

echo "6. Content_Types"
CONTENT_TYPES="$(read_entry '[Content_Types].xml')"
if [ -z "$CONTENT_TYPES" ]; then
  fail "cannot read [Content_Types].xml"
else
  ARM_COUNT="$(printf '%s' "$CONTENT_TYPES" | grep -c arm64 || true)"
  if [ "$ARM_COUNT" = "0" ]; then pass "no arm64 entries"; else fail "$ARM_COUNT arm64 lines in [Content_Types].xml"; fi
fi

echo "7. Dependencies"
DEPS="$(printf '%s' "$PKG_JSON" | node -e 'for(const d of Object.keys(JSON.parse(require("fs").readFileSync(0,"utf8")).dependencies||{}))console.log(d)' 2>/dev/null)"
MISSING=""
for dep in $DEPS; do
  has_entry "$TASK_DIR/node_modules/$dep/package.json" || MISSING="$MISSING $dep"
done
if [ -z "$MISSING" ]; then pass "all runtime dependencies are packed"; else fail "missing in node_modules:$MISSING"; fi
if has_entry "$TASK_DIR/node_modules/@babel/core/package.json"; then
  warn "dev dependencies are packed (package is bigger than needed)"
fi

echo
if [ "$FAILS" -eq 0 ]; then
  echo "RESULT: VALID ($WARNS warning(s))"
  exit 0
fi
echo "RESULT: INVALID ($FAILS failure(s), $WARNS warning(s))"
exit 1
