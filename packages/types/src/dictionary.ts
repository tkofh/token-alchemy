import type {
  ResolvedDesignTokenAttributes,
  ResolvedDesignTokenGroupAttributes,
  DesignTokenValue,
} from './tokens'
import type { OneOrBoth } from './util'

interface DictionaryTokenPathSegment {
  segmentKey: string
  attributes: OneOrBoth<
    ResolvedDesignTokenGroupAttributes,
    ResolvedDesignTokenAttributes
  >
}

export interface DictionaryToken {
  key: string
  attributes: OneOrBoth<
    ResolvedDesignTokenAttributes,
    ResolvedDesignTokenGroupAttributes
  >
  value: DesignTokenValue
  path: DictionaryTokenPathSegment[]
}

export interface Dictionary {}
