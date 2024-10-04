declare module '@token-alchemy/types' {
  export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  export type BasicDesignTokenValue = string | number

  type OptionalIfNotInitial<T, V> = T extends 'initial' ? V : V | undefined

  export interface ColorModeDesignTokenValue {
    light: BasicDesignTokenValue
    dark: BasicDesignTokenValue
  }

  export type ResponsiveDesignTokenValue = {
    [Key in BreakpointName]?: BasicDesignTokenValue | undefined
  } & {
    initial: BasicDesignTokenValue
  }

  export interface DesignTokenAttributes {
    $value:
      | BasicDesignTokenValue
      | ColorModeDesignTokenValue
      | ResponsiveDesignTokenValue
  }
}
