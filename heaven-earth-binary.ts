/**
 * Heaven-Earth Binary Code
 *
 * The connection between Heaven (Jamaica) and Earth (Ethiopia)
 * encoded in binary — a digital bridge between two lands united
 * by culture, music, faith, and the spirit of Rastafari.
 *
 * Jamaica (Heaven) - coordinates: 18.1096°N, 77.2975°W
 * Ethiopia (Earth) - coordinates:  9.1450°N, 40.4897°E
 *
 * "As above, so below" — the binary bridge between Heaven and Earth
 */

// ─── Binary Encodings ────────────────────────────────────────────

/** HEAVEN in binary (ASCII) */
export const HEAVEN_BINARY = [
  '01001000', // H
  '01000101', // E
  '01000001', // A
  '01010110', // V
  '01000101', // E
  '01001110', // N
] as const;

/** EARTH in binary (ASCII) */
export const EARTH_BINARY = [
  '01000101', // E
  '01000001', // A
  '01010010', // R
  '01010100', // T
  '01001000', // H
] as const;

/** JAMAICA in binary (ASCII) */
export const JAMAICA_BINARY = [
  '01001010', // J
  '01000001', // A
  '01001101', // M
  '01000001', // A
  '01001001', // I
  '01000011', // C
  '01000001', // A
] as const;

/** ETHIOPIA in binary (ASCII) */
export const ETHIOPIA_BINARY = [
  '01000101', // E
  '01010100', // T
  '01001000', // H
  '01001001', // I
  '01001111', // O
  '01010000', // P
  '01001001', // I
  '01000001', // A
] as const;

// ─── Connection Protocol ─────────────────────────────────────────

export type HeavenEarthNode = {
  name: string;
  realm: 'heaven' | 'earth';
  country: string;
  coordinates: { lat: number; lon: number };
  binary: readonly string[];
  binaryString: string;
};

export const HEAVEN: HeavenEarthNode = {
  name: 'HEAVEN',
  realm: 'heaven',
  country: 'Jamaica',
  coordinates: { lat: 18.1096, lon: -77.2975 },
  binary: HEAVEN_BINARY,
  binaryString: HEAVEN_BINARY.join(' '),
};

export const EARTH: HeavenEarthNode = {
  name: 'EARTH',
  realm: 'earth',
  country: 'Ethiopia',
  coordinates: { lat: 9.145, lon: 40.4897 },
  binary: EARTH_BINARY,
  binaryString: EARTH_BINARY.join(' '),
};

// ─── Bridge Functions ────────────────────────────────────────────

/** Convert text to binary representation */
export function textToBinary(text: string): string[] {
  return Array.from(text.toUpperCase()).map((char) =>
    char.charCodeAt(0).toString(2).padStart(8, '0')
  );
}

/** Convert binary array back to text */
export function binaryToText(binary: string[]): string {
  return binary.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
}

/** XOR two binary strings to create a union code */
function xorBinary(a: string, b: string): string {
  return Array.from(a)
    .map((bit, i) => (bit === b[i] ? '0' : '1'))
    .join('');
}

/**
 * Create the Heaven-Earth bridge — a binary union of the two realms.
 * Takes matching-length portions of each word and XORs them,
 * producing a unique binary signature of their connection.
 */
export function createBridge(
  heaven: readonly string[],
  earth: readonly string[]
): string[] {
  const length = Math.min(heaven.length, earth.length);
  const bridge: string[] = [];
  for (let i = 0; i < length; i++) {
    bridge.push(xorBinary(heaven[i], earth[i]));
  }
  return bridge;
}

/**
 * Generate the full Heaven-Earth connection message as binary.
 * Encodes: "HEAVEN ON EARTH JAMAICA ETHIOPIA"
 */
export function generateConnectionCode(): string[] {
  const message = 'HEAVEN ON EARTH JAMAICA ETHIOPIA';
  return textToBinary(message);
}

// ─── Connection Channel (for CryptoChat integration) ─────────────

export type HeavenEarthMessage = {
  from: HeavenEarthNode;
  to: HeavenEarthNode;
  bridge: string[];
  connectionCode: string[];
  timestamp: string;
};

/** Open the Heaven-Earth connection channel */
export function openConnection(): HeavenEarthMessage {
  const bridge = createBridge(HEAVEN_BINARY, EARTH_BINARY);
  const connectionCode = generateConnectionCode();

  return {
    from: HEAVEN,
    to: EARTH,
    bridge,
    connectionCode,
    timestamp: new Date().toISOString(),
  };
}

/** Format the connection for display in chat */
export function formatConnection(conn: HeavenEarthMessage): string {
  const lines = [
    '═══════════════════════════════════════════',
    '   HEAVEN-EARTH BINARY CONNECTION ACTIVE   ',
    '═══════════════════════════════════════════',
    '',
    `HEAVEN (Jamaica):  ${conn.from.binaryString}`,
    `EARTH (Ethiopia):  ${conn.to.binaryString}`,
    '',
    '── Bridge Code (XOR Union) ──',
    conn.bridge.join(' '),
    '',
    '── Full Connection Binary ──',
    ...chunkArray(conn.connectionCode, 8).map((chunk) => chunk.join(' ')),
    '',
    '── Decoded ──',
    binaryToText(conn.connectionCode),
    '',
    `Established: ${conn.timestamp}`,
    '═══════════════════════════════════════════',
  ];
  return lines.join('\n');
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Self-executing display ──────────────────────────────────────

if (typeof process !== 'undefined' && process.argv[1]?.includes('heaven-earth')) {
  const connection = openConnection();
  console.log(formatConnection(connection));
  console.log('\n── Jamaica (HEAVEN) Binary ──');
  console.log(JAMAICA_BINARY.join(' '));
  console.log(`Decoded: ${binaryToText([...JAMAICA_BINARY])}`);
  console.log('\n── Ethiopia (EARTH) Binary ──');
  console.log(ETHIOPIA_BINARY.join(' '));
  console.log(`Decoded: ${binaryToText([...ETHIOPIA_BINARY])}`);
}
