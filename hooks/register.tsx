import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Account } from '../types'

const accounts = atom({ plugin: 'quickswitch', key: 'accounts' } as const, [])
const isOpen = atom({ plugin: 'quickswitch', key: 'isOpen' } as const, false)

// `▶  1  me@x.com  [~7h]  (active)`, colours stripped
const ROW = /^\s*(▶)?\s*(\d+)\s+(\S+@\S+)\s+\[([^\]]*)\]/

async function refresh($: EngineInterface) {
  const r = await $.process.run(['ccswitch', 'list'], { env: { NO_COLOR: '1' } })
  if (r.exitCode) return
  const list: Account[] = []
  for (const line of r.stdout.replace(/\x1b\[[0-9;]*m/g, '').split('\n')) {
    const m = ROW.exec(line)
    if (m) list.push({ n: Number(m[2]), email: m[3]!, token: m[4]!, isActive: Boolean(m[1]) || line.includes('(active)') })
  }
  await update($, accounts, () => list)
}

async function switchTo($: EngineInterface, a: Account) {
  await update($, isOpen, () => false)
  if (a.isActive) return
  const r = await $.process.run(['ccswitch', 'switch', String(a.n)], { env: { NO_COLOR: '1' } })
  // ccswitch swaps the stored credentials; a running Claude Code picks them up on restart
  $.ui.toast(
    r.exitCode
      ? `ccswitch failed: ${(r.stderr || r.stdout).trim().slice(-120)}`
      : `switched to ${a.email} · restart Claude Code to use it (/exit, then claude -c)`,
    { timeoutMs: 8000 },
  )
  await refresh($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await refresh($)
    return started
  })

  // tokens expire and other terminals switch too: re-read once a turn
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    await refresh($)
    return done
  })

  // lives on the hint line under the prompt, right after the mode label, so it reads as part
  // of the status line; open, the same spot turns into the account list
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const list = await read($, accounts)
    if (list.length === 0) return next(e)
    const active = list.find(a => a.isActive)
    const open = await read($, isOpen)
    const { Box, Button } = $.ui.resolve(e)
    if (open) {
      return (
        <Box flexDirection="row" columnGap={2} flexWrap="wrap">
          {list.map(a => (
            <Button
              key={`acc${a.n}`}
              plain
              label={`${a.isActive ? '●' : '○'} ${a.email} ${a.token}`}
              variant={a.isActive ? 'primary' : undefined}
              dimColor={a.token === 'expired'}
              onPress={() => switchTo($, a)}
            />
          ))}
          <Button key="close" plain dimColor label="✕" onPress={() => update($, isOpen, () => false)} />
        </Box>
      )
    }
    // same spot as the open list (right after the mode label): the account alone, in place of the
    // engine's hint, which claims the whole row and pushes anything beside it to a new line
    return <Button key="who" plain dimColor label={`⇄ ${active?.email ?? 'no account'}`} onPress={() => update($, isOpen, () => true)} />
  })
}
