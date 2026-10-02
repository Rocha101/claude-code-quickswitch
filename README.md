<div align="center">

# quickswitch

**Switch Claude accounts in one click — from the Claude Code status line.**

Work seat, personal seat, the team account: one click on your email and pick.

[![MIT](https://img.shields.io/badge/license-MIT-10b981)](LICENSE)
[![Claude Code mod](https://img.shields.io/badge/Claude%20Code-mod-0ea5e9)](#install)
[![powered by ccswitch](https://img.shields.io/badge/powered%20by-ccswitch-6366f1)](https://github.com/vyshnavsdeepak/ccswitch)
[![Stars](https://img.shields.io/github/stars/Rocha101/claude-code-quickswitch?style=social)](https://github.com/Rocha101/claude-code-quickswitch/stargazers)

**English** · [Português](README.pt-BR.md)

<img src="assets/demo.gif" alt="The account next to the mode label opens into a list of accounts with their token status" width="100%">

</div>

## Why

Hitting the usage limit on one seat while another sits idle is the worst. [ccswitch](https://github.com/vyshnavsdeepak/ccswitch) already swaps Claude Code credentials without the log-out/log-in dance — **quickswitch** puts it one click away, right where you're looking.

## What you get

Your current account lives in the status line, next to the mode label:

<img src="assets/closed.png" alt="auto mode on · ⇄ ada@lovelace.dev" width="100%">

Click it and the same spot turns into every account you manage, with how long each token has left:

<img src="assets/open.png" alt="the account list: active highlighted, expired dimmed" width="100%">

- **●** the active account, highlighted · **○** the others · expired tokens dimmed
- click one → `ccswitch switch` → a toast confirms; **✕** closes without switching
- the list refreshes on session start, after each switch and every turn — switches made in another terminal show up too
- zero extra rows: no band, no panel, it *is* part of the status line

## Install

You need [ccswitch](https://github.com/vyshnavsdeepak/ccswitch) with your accounts added (`ccswitch add`).

```bash
curl -fsSL https://raw.githubusercontent.com/Rocha101/claude-code-quickswitch/main/install.sh | bash
```

Then open a **new** Claude Code session.

<details>
<summary>Manual install</summary>

```bash
git clone https://github.com/Rocha101/claude-code-quickswitch ~/.claude/mods/claude-code-quickswitch
```

Add the folder to `CLAUDE_CODE_PLUGIN_DIRS` in the `env` block of `~/.claude/settings.json` (`:`-separated), or start Claude Code with `claude --plugin-dir ~/.claude/mods/claude-code-quickswitch`.

</details>

**Requirements:** Claude Code 2.1.287+ (mods), [ccswitch](https://github.com/vyshnavsdeepak/ccswitch), `jq`, `git`. Clicking needs a terminal that reports the mouse (Claude Code's fullscreen mode); without one, `ctrl+x tab` focuses it and Enter presses.

## Good to know

**A switch applies on restart.** ccswitch swaps the stored credentials; a running Claude Code keeps the old session until it restarts. After switching: `/exit`, then `claude -c` to continue right where you were. The toast reminds you.

If you also print your email in a custom status line script, drop it — quickswitch already shows it.

## How it works

A Claude Code **mod** (`hooks/register.tsx`, ~80 lines):

1. `session.start` and `turn.complete` run `ccswitch list` and parse the accounts.
2. `ui.render` on `PromptHint` draws the account (or the open list) in the hint slot under the prompt.
3. A press runs `ccswitch switch <n>` and refreshes.

## Contributing

```bash
claude plugin validate .
claude plugin test .
```

Issues and PRs welcome. If quickswitch rescued you from a rate limit, **[leave a star](https://github.com/Rocha101/claude-code-quickswitch)** ⭐

See also: **[glance](https://github.com/Rocha101/claude-code-glance)** — images and rendered HTML inline in Claude Code.

## License

[MIT](LICENSE) © Rocha101 · account switching by [ccswitch](https://github.com/vyshnavsdeepak/ccswitch)
