import { Dictionary } from './dictionary'

type MyTokenBase = {
  $tier:
    | 'system'
    | 'theme'
    | 'group'
    | 'entity'
    | 'kind'
    | 'scope'
    | 'variant'
    | 'modifier'
    | 'state'
    | 'scale'
    | 'mode'
}

type Modal<T> = T | { light: T; dark: T }

type DimensionToken = Omit<
  MyTokenBase & {
    $type: 'dimension'
    $value: Modal<string | number>
  },
  never
>
type ColorToken = Omit<
  MyTokenBase & {
    $type: 'color'
    $value: Modal<string>
  },
  never
>

type MyToken = MyTokenBase | DimensionToken | ColorToken

type MyContext = { mode: 'light' | 'dark' }

const dictionary = new Dictionary<MyToken, MyContext>({
  formatter: ({ token, context, replace }) => {
    const data = token.data()

    const value = String(
      typeof data.$value === 'object' ? data.$value[context.mode] : data.$value,
    )

    return replace(value, (token) => `var(--${token.key()})`)
  },
})

dictionary.insert({
  color: {
    $tier: 'system',
    gray: {
      $tier: 'kind',
      1: {
        $tier: 'variant',
        $value: { light: '{color.gray.1.light}', dark: '{color.gray.1.dark}' },
        $type: 'color',

        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.988 0.988 0.988)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.067 0.067 0.067)',
        },
      },
      2: {
        $tier: 'variant',
        $value: { light: '{color.gray.2.light}', dark: '{color.gray.2.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.975 0.975 0.975)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.098 0.098 0.098)',
        },
      },
      3: {
        $tier: 'variant',
        $value: { light: '{color.gray.3.light}', dark: '{color.gray.3.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.939 0.939 0.939)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.135 0.135 0.135)',
        },
      },
      4: {
        $tier: 'variant',
        $value: { light: '{color.gray.4.light}', dark: '{color.gray.4.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.908 0.908 0.908)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.163 0.163 0.163)',
        },
      },
      5: {
        $tier: 'variant',
        $value: { light: '{color.gray.5.light}', dark: '{color.gray.5.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.88 0.88 0.88)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.192 0.192 0.192)',
        },
      },
      6: {
        $tier: 'variant',
        $value: { light: '{color.gray.6.light}', dark: '{color.gray.6.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.849 0.849 0.849)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.228 0.228 0.228)',
        },
      },
      7: {
        $tier: 'variant',
        $value: { light: '{color.gray.7.light}', dark: '{color.gray.7.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.807 0.807 0.807)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.283 0.283 0.283)',
        },
      },
      8: {
        $tier: 'variant',
        $value: { light: '{color.gray.8.light}', dark: '{color.gray.8.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.732 0.732 0.732)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.375 0.375 0.375)',
        },
      },
      9: {
        $tier: 'variant',
        $value: { light: '{color.gray.9.light}', dark: '{color.gray.9.dark}' },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.553 0.553 0.553)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.431 0.431 0.431)',
        },
      },
      10: {
        $tier: 'variant',
        $value: {
          light: '{color.gray.10.light}',
          dark: '{color.gray.10.dark}',
        },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.512 0.512 0.512)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.484 0.484 0.484)',
        },
      },
      11: {
        $tier: 'variant',
        $value: {
          light: '{color.gray.11.light}',
          dark: '{color.gray.11.dark}',
        },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.392 0.392 0.392)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.706 0.706 0.706)',
        },
      },
      12: {
        $tier: 'variant',
        $value: {
          light: '{color.gray.12.light}',
          dark: '{color.gray.12.dark}',
        },
        $type: 'color',
        light: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.125 0.125 0.125)',
        },
        dark: {
          $tier: 'mode',
          $type: 'color',
          $value: 'color(display-p3 0.933 0.933 0.933)',
        },
      },
    },

    overlay: {
      $tier: 'kind',
      $type: 'color',
      $value: 'color(from {color.gray.1} in xyz x y z / {opacity.50})',
    },
  },
  opacity: {
    $tier: 'system',
    0: {
      $tier: 'variant',
      $value: '0',
      $type: 'dimension',
    },
    5: {
      $tier: 'variant',
      $value: '0.05',
      $type: 'dimension',
    },
    10: {
      $tier: 'variant',
      $value: '0.1',
      $type: 'dimension',
    },
    20: {
      $tier: 'variant',
      $value: '0.2',
      $type: 'dimension',
    },
    30: {
      $tier: 'variant',
      $value: '0.3',
      $type: 'dimension',
    },
    40: {
      $tier: 'variant',
      $value: '0.4',
      $type: 'dimension',
    },
    50: {
      $tier: 'variant',
      $value: '0.5',
      $type: 'dimension',
    },
    60: {
      $tier: 'variant',
      $value: '0.6',
      $type: 'dimension',
    },
    70: {
      $tier: 'variant',
      $value: '0.7',
      $type: 'dimension',
    },
    80: {
      $tier: 'variant',
      $value: '0.8',
      $type: 'dimension',
    },
    90: {
      $tier: 'variant',
      $value: '0.9',
      $type: 'dimension',
    },
    95: {
      $tier: 'variant',
      $value: '0.95',
      $type: 'dimension',
    },
    100: {
      $tier: 'variant',
      $value: '1',
      $type: 'dimension',
    },
  },
})

console.log(dictionary.format('{color.overlay}', { mode: 'light' }))
