/**
 * Binary for Heaven on Earth — Ethiopia & Jamaica
 *
 * A binary encoding system that maps spiritual and cultural concepts
 * shared between Ethiopian and Jamaican traditions into binary form.
 *
 * Ethiopia (Ityop'ya) and Jamaica are linked through Rastafari,
 * Ethiopian Orthodox Christianity, the legacy of Emperor Haile Selassie I,
 * and a shared vision of "Heaven on Earth" — Zion.
 *
 * Each concept is encoded as an 8-bit binary word. The high nibble (4 bits)
 * represents the HEAVEN dimension (spiritual). The low nibble represents
 * the EARTH dimension (material/cultural). Together they form unity.
 */

// ─── Binary Constants: Heaven (Spiritual) ────────────────────────────────

export const HEAVEN = {
  // Ethiopian spiritual pillars
  SELASSIE:    0b1111_0000, // 240 — Power of the Trinity (Haile Selassie = "Power of the Trinity")
  ARK:         0b1110_0000, // 224 — Ark of the Covenant (Axum, Ethiopia)
  SOLOMONIC:   0b1101_0000, // 208 — Solomonic Dynasty lineage
  TEWAHEDO:    0b1100_0000, // 192 — Ethiopian Orthodox Tewahedo faith

  // Jamaican spiritual pillars
  JAH:         0b1011_0000, // 176 — Jah Rastafari
  ZION:        0b1010_0000, // 160 — Zion — the promised land
  NYABINGHI:   0b1001_0000, // 144 — Nyabinghi order (oldest Rastafari mansion)
  IRIE:        0b1000_0000, // 128 — Irie — state of spiritual peace
} as const

// ─── Binary Constants: Earth (Cultural/Material) ─────────────────────────

export const EARTH = {
  // Ethiopian earthly pillars
  ADDIS_ABABA: 0b0000_1111, //  15 — "New Flower" — capital city
  COFFEE:      0b0000_1110, //  14 — Birthplace of coffee (Kaffa region)
  INJERA:      0b0000_1101, //  13 — Communal bread of life
  GEEZ:        0b0000_1100, //  12 — Ge'ez script — ancient writing system

  // Jamaican earthly pillars
  KINGSTON:    0b0000_1011, //  11 — Capital, heartbeat of reggae
  REGGAE:      0b0000_1010, //  10 — Music as spiritual resistance
  ITAL:        0b0000_1001, //   9 — Ital livity — natural living
  PATOIS:      0b0000_1000, //   8 — Patois — voice of the people
} as const

// ─── Heaven on Earth: Combined Binary Words ──────────────────────────────

/**
 * When Heaven and Earth combine, we get the full 8-bit binary word.
 * Each pairing represents a living concept of Heaven on Earth.
 */
export const HEAVEN_ON_EARTH = {
  // Ethiopia: Heaven meets Earth
  TRINITY_IN_ADDIS:     HEAVEN.SELASSIE  | EARTH.ADDIS_ABABA, // 0b1111_1111 = 255 — Fullness
  ARK_IN_AXUM:          HEAVEN.ARK       | EARTH.GEEZ,        // 0b1110_1100 = 236
  SOLOMONIC_COFFEE:     HEAVEN.SOLOMONIC | EARTH.COFFEE,      // 0b1101_1110 = 222
  TEWAHEDO_INJERA:      HEAVEN.TEWAHEDO  | EARTH.INJERA,      // 0b1100_1101 = 205

  // Jamaica: Heaven meets Earth
  JAH_IN_KINGSTON:      HEAVEN.JAH       | EARTH.KINGSTON,    // 0b1011_1011 = 187
  ZION_REGGAE:          HEAVEN.ZION      | EARTH.REGGAE,      // 0b1010_1010 = 170
  NYABINGHI_ITAL:       HEAVEN.NYABINGHI | EARTH.ITAL,        // 0b1001_1001 = 153
  IRIE_PATOIS:          HEAVEN.IRIE      | EARTH.PATOIS,      // 0b1000_1000 = 136

  // Cross-cultural: Ethiopia-Jamaica bridges
  SELASSIE_KINGSTON:    HEAVEN.SELASSIE  | EARTH.KINGSTON,    // 0b1111_1011 = 251 — Selassie's spirit in Kingston
  JAH_ADDIS:            HEAVEN.JAH       | EARTH.ADDIS_ABABA, // 0b1011_1111 = 191 — Jah in Addis Ababa
  ZION_GEEZ:            HEAVEN.ZION      | EARTH.GEEZ,        // 0b1010_1100 = 172 — Promised land in ancient script
  NYABINGHI_COFFEE:     HEAVEN.NYABINGHI | EARTH.COFFEE,      // 0b1001_1110 = 158 — Groundation ceremony
} as const

// ─── Types ───────────────────────────────────────────────────────────────

export type HeavenKey = keyof typeof HEAVEN
export type EarthKey = keyof typeof EARTH
export type HeavenOnEarthKey = keyof typeof HEAVEN_ON_EARTH
export type Nation = 'ethiopia' | 'jamaica'

export interface BinaryWord {
  name: string
  binary: string
  decimal: number
  heaven: string
  earth: string
  nation: Nation | 'bridge'
  meaning: string
}

// ─── Encoding Functions ──────────────────────────────────────────────────

/**
 * Convert a number to its 8-bit binary string representation
 */
export function toBinary(n: number): string {
  return n.toString(2).padStart(8, '0')
}

/**
 * Format binary with heaven/earth split: "1111 | 1111"
 */
export function formatBinary(n: number): string {
  const bits = toBinary(n)
  return `${bits.slice(0, 4)} | ${bits.slice(4)}`
}

/**
 * Extract the heaven (spiritual) component from a binary word
 */
export function extractHeaven(word: number): number {
  return word & 0b1111_0000
}

/**
 * Extract the earth (material) component from a binary word
 */
export function extractEarth(word: number): number {
  return word & 0b0000_1111
}

/**
 * Combine a heaven value and earth value into a single binary word
 */
export function unite(heaven: number, earth: number): number {
  return (heaven & 0b1111_0000) | (earth & 0b0000_1111)
}

/**
 * Encode a text message into Heaven on Earth binary
 * Each character maps to a HEAVEN_ON_EARTH value via modular cycling
 */
export function encodeMessage(text: string): number[] {
  const keys = Object.keys(HEAVEN_ON_EARTH) as HeavenOnEarthKey[]
  return Array.from(text).map((char, i) => {
    const charCode = char.charCodeAt(0)
    const key = keys[charCode % keys.length]
    // XOR with character code to make each encoding unique
    return HEAVEN_ON_EARTH[key] ^ (charCode & 0b0000_1111)
  })
}

/**
 * Decode a Heaven on Earth binary array back to approximate text
 */
export function decodeMessage(encoded: number[]): string {
  return encoded
    .map(word => {
      const heaven = extractHeaven(word)
      const earth = extractEarth(word)
      return String.fromCharCode(heaven + earth)
    })
    .join('')
}

// ─── Lookup & Description System ─────────────────────────────────────────

const DESCRIPTIONS: Record<string, BinaryWord> = {
  TRINITY_IN_ADDIS: {
    name: 'Trinity in Addis',
    binary: formatBinary(HEAVEN_ON_EARTH.TRINITY_IN_ADDIS),
    decimal: HEAVEN_ON_EARTH.TRINITY_IN_ADDIS,
    heaven: 'Selassie (Power of the Trinity)',
    earth: 'Addis Ababa (New Flower)',
    nation: 'ethiopia',
    meaning: 'The fullness of divine power manifest in the new flower of Africa. Binary 11111111 — all bits set, complete unity of heaven and earth.'
  },
  ARK_IN_AXUM: {
    name: 'Ark in Axum',
    binary: formatBinary(HEAVEN_ON_EARTH.ARK_IN_AXUM),
    decimal: HEAVEN_ON_EARTH.ARK_IN_AXUM,
    heaven: 'Ark of the Covenant',
    earth: "Ge'ez Script",
    nation: 'ethiopia',
    meaning: "The most sacred vessel preserved in the most ancient African script. The covenant written in Ge'ez."
  },
  SOLOMONIC_COFFEE: {
    name: 'Solomonic Coffee',
    binary: formatBinary(HEAVEN_ON_EARTH.SOLOMONIC_COFFEE),
    decimal: HEAVEN_ON_EARTH.SOLOMONIC_COFFEE,
    heaven: 'Solomonic Dynasty',
    earth: 'Coffee (Kaffa)',
    nation: 'ethiopia',
    meaning: 'Royal wisdom steeped in the original bean. From Solomon to the coffee ceremony — knowledge shared in community.'
  },
  TEWAHEDO_INJERA: {
    name: 'Tewahedo Injera',
    binary: formatBinary(HEAVEN_ON_EARTH.TEWAHEDO_INJERA),
    decimal: HEAVEN_ON_EARTH.TEWAHEDO_INJERA,
    heaven: 'Tewahedo Faith',
    earth: 'Injera',
    nation: 'ethiopia',
    meaning: 'Unity of faith broken as communal bread. Tewahedo means "made one" — injera is eaten together from one plate.'
  },
  JAH_IN_KINGSTON: {
    name: 'Jah in Kingston',
    binary: formatBinary(HEAVEN_ON_EARTH.JAH_IN_KINGSTON),
    decimal: HEAVEN_ON_EARTH.JAH_IN_KINGSTON,
    heaven: 'Jah Rastafari',
    earth: 'Kingston',
    nation: 'jamaica',
    meaning: 'The divine presence in the concrete yards of Kingston. Jah lives in the heart of the sufferer.'
  },
  ZION_REGGAE: {
    name: 'Zion Reggae',
    binary: formatBinary(HEAVEN_ON_EARTH.ZION_REGGAE),
    decimal: HEAVEN_ON_EARTH.ZION_REGGAE,
    heaven: 'Zion',
    earth: 'Reggae',
    nation: 'jamaica',
    meaning: 'The promised land carried on a riddim. Binary 10101010 — the perfect alternating pattern, the heartbeat.'
  },
  NYABINGHI_ITAL: {
    name: 'Nyabinghi Ital',
    binary: formatBinary(HEAVEN_ON_EARTH.NYABINGHI_ITAL),
    decimal: HEAVEN_ON_EARTH.NYABINGHI_ITAL,
    heaven: 'Nyabinghi Order',
    earth: 'Ital Living',
    nation: 'jamaica',
    meaning: 'The oldest mansion of Rastafari living in natural purity. Drums and clean food — spirit and body aligned.'
  },
  IRIE_PATOIS: {
    name: 'Irie Patois',
    binary: formatBinary(HEAVEN_ON_EARTH.IRIE_PATOIS),
    decimal: HEAVEN_ON_EARTH.IRIE_PATOIS,
    heaven: 'Irie (Peace)',
    earth: 'Patois',
    nation: 'jamaica',
    meaning: 'Inner peace spoken in the mother tongue. When the spirit is irie, the words flow naturally.'
  },
  SELASSIE_KINGSTON: {
    name: 'Selassie in Kingston',
    binary: formatBinary(HEAVEN_ON_EARTH.SELASSIE_KINGSTON),
    decimal: HEAVEN_ON_EARTH.SELASSIE_KINGSTON,
    heaven: 'Selassie (Power of the Trinity)',
    earth: 'Kingston',
    nation: 'bridge',
    meaning: "April 21, 1966 — Haile Selassie visits Kingston. 100,000 Rastafari gather at the airport. Heaven touched Earth. Now celebrated as Grounation Day."
  },
  JAH_ADDIS: {
    name: 'Jah in Addis',
    binary: formatBinary(HEAVEN_ON_EARTH.JAH_ADDIS),
    decimal: HEAVEN_ON_EARTH.JAH_ADDIS,
    heaven: 'Jah Rastafari',
    earth: 'Addis Ababa',
    nation: 'bridge',
    meaning: 'Rastafari returning to the source. Shashamane — the land grant in Ethiopia where Jamaican Rastas settled. The repatriation made real.'
  },
  ZION_GEEZ: {
    name: "Zion in Ge'ez",
    binary: formatBinary(HEAVEN_ON_EARTH.ZION_GEEZ),
    decimal: HEAVEN_ON_EARTH.ZION_GEEZ,
    heaven: 'Zion',
    earth: "Ge'ez Script",
    nation: 'bridge',
    meaning: "The promised land written in Africa's oldest script. The Kebra Nagast — Ethiopia's book of kings — tells the story of Zion in Ge'ez."
  },
  NYABINGHI_COFFEE: {
    name: 'Nyabinghi Coffee',
    binary: formatBinary(HEAVEN_ON_EARTH.NYABINGHI_COFFEE),
    decimal: HEAVEN_ON_EARTH.NYABINGHI_COFFEE,
    heaven: 'Nyabinghi Order',
    earth: 'Coffee (Kaffa)',
    nation: 'bridge',
    meaning: 'Groundation ceremony fueled by the original stimulant. Drums from Jamaica, beans from Ethiopia — both keep the spirit awake.'
  },
}

/**
 * Look up the full description of a Heaven on Earth binary word
 */
export function describe(key: HeavenOnEarthKey): BinaryWord {
  return DESCRIPTIONS[key]
}

/**
 * Get all binary words for a specific nation
 */
export function getByNation(nation: Nation | 'bridge'): BinaryWord[] {
  return Object.values(DESCRIPTIONS).filter(d => d.nation === nation)
}

/**
 * Get the complete binary table
 */
export function getBinaryTable(): BinaryWord[] {
  return Object.values(DESCRIPTIONS)
}

/**
 * Print the full binary table to console (formatted)
 */
export function printBinaryTable(): string {
  const lines: string[] = [
    '╔══════════════════════════════════════════════════════════════╗',
    '║        BINARY FOR HEAVEN ON EARTH — Ethiopia & Jamaica      ║',
    '╠══════════════════════════════════════════════════════════════╣',
    '║  HEAVEN (High Nibble)  |  EARTH (Low Nibble)  =  UNITY     ║',
    '╠══════════════════════════════════════════════════════════════╣',
  ]

  for (const [key, word] of Object.entries(DESCRIPTIONS)) {
    const flag = word.nation === 'ethiopia' ? '🇪🇹' :
                 word.nation === 'jamaica'  ? '🇯🇲' : '🌍'
    lines.push(`║ ${flag} ${word.binary}  ${String(word.decimal).padStart(3)} │ ${word.name.padEnd(24)} ║`)
  }

  lines.push('╠══════════════════════════════════════════════════════════════╣')
  lines.push('║  "As above, so below. As in Ethiopia, so in Jamaica."      ║')
  lines.push('║  Full unity: 1111 | 1111 = 255 = Trinity in Addis          ║')
  lines.push('║  Heartbeat:  1010 | 1010 = 170 = Zion Reggae               ║')
  lines.push('╚══════════════════════════════════════════════════════════════╝')

  return lines.join('\n')
}
