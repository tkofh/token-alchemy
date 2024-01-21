import type { Immutable, ResolvedToken } from '@token-alchemy/types'

const aComesFirst = -1
const bComesFirst = 1

function mostDepended(
  token: Immutable<ResolvedToken>,
): Immutable<ResolvedToken> {
  return Array.from(token.dependencies).sort(
    (a, b) => a.dependencies.size - b.dependencies.size,
  )[0]
}

export function compareTokenOrder(
  a: Immutable<ResolvedToken>,
  b: Immutable<ResolvedToken>,
): number {
  let result = 0
  if (a.dependencies.size === 0) {
    result = aComesFirst
  }

  if (b.dependencies.size === 0) {
    result = bComesFirst
  }

  if (a.dependencies.has(b)) {
    result = bComesFirst
  }

  if (b.dependencies.has(a)) {
    result = aComesFirst
  }

  if (result === 0) {
    result = compareTokenOrder(mostDepended(a), mostDepended(b))
  }

  return result
}
