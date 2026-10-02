#!/usr/bin/env bash
# Installs claude-code-quickswitch: one-click Claude account switching from the status line.
set -euo pipefail
REPO="https://github.com/Rocha101/claude-code-quickswitch"
DIR="$HOME/.claude/mods/claude-code-quickswitch"

missing=0
for bin in git jq; do command -v "$bin" >/dev/null || { echo "✗ missing: $bin"; missing=1; }; done
command -v ccswitch >/dev/null || { echo "✗ missing: ccswitch — cargo install --git https://github.com/vyshnavsdeepak/ccswitch"; missing=1; }
[ "$missing" = 0 ] || { echo "install the missing tools and run again"; exit 1; }

if [ -d "$DIR/.git" ]; then git -C "$DIR" pull --ff-only --quiet; else git clone --depth 1 --quiet "$REPO" "$DIR"; fi

S="$HOME/.claude/settings.json"; mkdir -p "$(dirname "$S")"; [ -f "$S" ] || echo '{}' > "$S"
jq --arg d "$DIR" '.env.CLAUDE_CODE_PLUGIN_DIRS = ([(.env.CLAUDE_CODE_PLUGIN_DIRS // "" | split(":") | map(select(. != "" and . != $d))), [$d]] | add | join(":"))' "$S" > "$S.tmp" && mv "$S.tmp" "$S"

echo "✓ quickswitch installed in $DIR"
echo "  open a new Claude Code session: your account sits next to the mode label under the prompt — click it"
