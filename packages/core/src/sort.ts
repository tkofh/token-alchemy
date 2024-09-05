import type { ResolvedToken } from '@token-alchemy/types'

const aComesFirst = -1
const bComesFirst = 1

function mostDepended<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  token: ResolvedToken<Attributes, GroupAttributes>,
): ResolvedToken<Attributes, GroupAttributes> {
  return Array.from(token.dependencies).sort(
    (a, b) => a.dependencies.size - b.dependencies.size,
  )[0]
}

export function compareTokenOrder<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  a: ResolvedToken<Attributes, GroupAttributes>,
  b: ResolvedToken<Attributes, GroupAttributes>,
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
