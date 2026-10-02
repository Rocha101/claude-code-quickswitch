/** One account as `ccswitch list` prints it. */
export type Account = { n: number; email: string; token: string; isActive: boolean }

declare module 'claude-code' {
  interface PluginState {
    quickswitch: { accounts: Account[]; isOpen: boolean }
  }
}
