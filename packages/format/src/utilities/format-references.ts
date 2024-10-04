import type {
  DesignTokenValue,
  ResolvedToken,
  ResolvedTokenReference,
} from '@token-alchemy/types'
import { cloneDeep, get, set } from 'lodash-es'

type TokenFormatter<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = (token: ResolvedToken<Attributes, GroupAttributes>) => string

function formatReferenceList<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  value: string,
  references: Array<ResolvedTokenReference<Attributes, GroupAttributes>>,
  format: TokenFormatter<Attributes, GroupAttributes>,
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

export function formatReferences<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  token: ResolvedToken<Attributes, GroupAttributes>,
  format: TokenFormatter<Attributes, GroupAttributes>,
): DesignTokenValue<Attributes> {
  let value: DesignTokenValue<Attributes> = cloneDeep(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (token.attributes as any).$value,
  )

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
