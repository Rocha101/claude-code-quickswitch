import { expect, test } from 'claude-code/testing'

const LIST = `
  Managed Accounts
  ────────────────
  \x1b[32m▶  1  a@x.com  [~7h]  (active)\x1b[0m
     2  b@x.com  [expired]
     3  c@y.com  [~2h]
`

test('click the email, pick an account, ccswitch switches to it', async ($, on) => {
  const ran: string[][] = []
  on('process.run', (_$, e) => {
    ran.push([...e.argv])
    return { value: { exitCode: 0, stdout: e.argv[1] === 'list' ? LIST : 'switched', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('ui.render', ($, e) => { const { Text } = $.ui.resolve(e); return <Text>engine</Text> })

  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  const band = { plugin: 'quickswitch', surface: 'terminal', component: 'PromptHint',
    props: { isDraft: false, isWorking: false, hint: '? for shortcuts' } } as const
  const ui = await $.ui.mount(band)
  expect((await ui.find({ key: 'who' }))?.text).toContain('a@x.com')
  expect(await ui.find({ key: 'acc2' })).toBeUndefined()

  await ui.press({ key: 'who' })
  expect((await ui.findAll({ type: 'Button' })).length).toBe(4) // 3 accounts + close

  await ui.press({ key: 'acc3' })
  expect(ran.some(a => a.join(' ') === 'ccswitch switch 3')).toBe(true)
  expect(await ui.find({ key: 'acc3' })).toBeUndefined()
  await ui.unmount()
})
