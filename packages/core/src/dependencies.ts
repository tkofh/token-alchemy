import type { ResolvedToken, TokenMap } from '@token-alchemy/types'

function collectDirectDependencies(token: ResolvedToken): Set<ResolvedToken> {
  const dependencies = new Set<ResolvedToken>()

  for (const reference of token.references.values()) {
    for (const { token: dependency } of reference) {
      dependencies.add(dependency)
    }
  }

  return dependencies
}

function resolveTokenDependencies(
  token: ResolvedToken,
  tokens: TokenMap,
  visited: Set<ResolvedToken>,
  chain: Array<ResolvedToken>,
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
    const dependencies = collectDirectDependencies(token)
    for (const dependency of dependencies) {
      resolveTokenDependencies(dependency, tokens, visited, [...chain, token])

      token.dependencies.add(dependency)
      for (const sub of dependency.dependencies) {
        token.dependencies.add(sub)
      }

      visited.add(token)
    }
  }
}

export function resolveDependencies(
  tokens: TokenMap,
  tokensWithDependencies: Set<ResolvedToken>,
) {
  const visited = new Set<ResolvedToken>()

  for (const token of tokensWithDependencies) {
    try {
      resolveTokenDependencies(token, tokens, visited, [])
    } catch (e) {
      throw new Error(
        `Unable to resolve token \`${token.key}\` dependencies: ${
          e instanceof Error ? e.message : 'an unknown error occurred'
        }`,
      )
    }
  }
}
