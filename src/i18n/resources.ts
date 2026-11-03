import type { Lang } from './languages'
import { messages, type Messages } from './messages'

export type { Lang, Messages }

export { messages }

export const resources = Object.fromEntries(
  Object.entries(messages).map(([code, translation]) => [code, { translation }]),
) as Record<Lang, { translation: Messages }>
