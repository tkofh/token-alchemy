import type { ResolvedToken, TokenMap } from '@token-alchemy/types'

function collectDirectDependencies<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  token: ResolvedToken<Attributes, GroupAttributes>,
): Set<ResolvedToken<Attributes, GroupAttributes>> {
  const dependencies = new Set<ResolvedToken<Attributes, GroupAttributes>>()

  for (const reference of token.references.values()) {
    for (const { token: dependency } of reference) {
      dependencies.add(dependency)
    }
  }

  return dependencies
}

function resolveTokenDependencies<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  token: ResolvedToken<Attributes, GroupAttributes>,
  tokens: TokenMap<Attributes, GroupAttributes>,
  visited: Set<ResolvedToken<Attributes, GroupAttributes>>,
  chain: Array<ResolvedToken<Attributes, GroupAttributes>>,
) {
  if (chain.includes(token)) {
    throw new Error(
      `Circular reference between \`${[
        ...chain.slice(chain.indexOf(token)),
        token,
      ]
        .map((loopToken) => `${loopToken.reference}`)
        .join(' -> ')}\``,
    )
  }

  if (!visited.has(token)) {
    const dependencies = collectDirectDependencies<Attributes, GroupAttributes>(
      token,
    )
    for (const dependency of dependencies) {
      resolveTokenDependencies<Attributes, GroupAttributes>(
        dependency,
        tokens,
        visited,
        [...chain, token],
      )

      token.dependencies.add(dependency)
      for (const sub of dependency.dependencies) {
        token.dependencies.add(sub)
      }

      visited.add(token)
    }
  }
}

export function resolveDependencies<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  tokens: TokenMap<Attributes, GroupAttributes>,
  tokensWithDependencies: Set<ResolvedToken<Attributes, GroupAttributes>>,
) {
  const visited = new Set<ResolvedToken<Attributes, GroupAttributes>>()

  for (const token of tokensWithDependencies) {
    try {
      resolveTokenDependencies<Attributes, GroupAttributes>(
        token,
        tokens,
        visited,
        [],
      )
    } catch (e) {
      throw new Error(
        `Unable to resolve token \`${token.key}\` dependencies: ${
          e instanceof Error ? e.message : 'an unknown error occurred'
        }`,
      )
    }
  }
}
