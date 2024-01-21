import type {
  DesignTokenValue,
  Immutable,
  ResolvedToken,
  ResolvedTokenReference,
} from '@token-alchemy/types'
import { cloneDeep, get, set } from 'lodash-es'

type TokenFormatter = (token: Immutable<ResolvedToken>) => string

function formatReferenceList(
  value: string,
  references: Immutable<Array<ResolvedTokenReference>>,
  format: TokenFormatter,
): string {
  let output = value
  let offset = 0
  for (const reference of references) {
    output = `${output.slice(0, reference.start + offset)}${format(
      reference.token,
    )}${output.slice(reference.end + offset)}`
    offset = output.length - value.length
  }

  return output
}

export function formatReferences(
  token: Immutable<ResolvedToken>,
  format: TokenFormatter,
): DesignTokenValue {
  let value: DesignTokenValue = cloneDeep(token.attributes.$value)

  for (const [key, references] of token.references) {
    if (key === '$value') {
      value = formatReferenceList(value as string, references, format)
    } else {
      const valueObj = value as unknown as object
      const access = key.replace('$value.', '')

      set(
        valueObj,
        access,
        formatReferenceList(
          get(valueObj, access) as string,
          references,
          format,
        ),
      )
    }
  }

  return value
}
