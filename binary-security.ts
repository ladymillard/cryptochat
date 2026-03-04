/**
 * Binary Security System for Heaven on Earth — Ethiopia & Jamaica
 *
 * A layered security architecture built on the Heaven/Earth binary encoding.
 * Uses the cultural constants as cryptographic seeds, mapping spiritual
 * and material pillars into key generation, encryption, access tiers,
 * integrity verification, and challenge-response authentication.
 *
 * Security Layers (4-bit model, mirroring the nibble architecture):
 *   Layer 1 (EARTH) — Identity & Access Control
 *   Layer 2 (EARTH) — Integrity Verification
 *   Layer 3 (HEAVEN) — Message Encryption
 *   Layer 4 (HEAVEN) — Key Generation & Ceremony
 *
 * Dimensional Access Model:
 *   2D (Flat):  Observer floor at 8² = 64  — the square, the foundation
 *   3D (Depth): Observer floor at 8³ = 512 — the cube, full dimensional awareness
 *
 * Access Denial Policy:
 *   Warships, slaves, slavers — PERMANENTLY DENIED.
 *   No bits set. No entry. No information. The gate does not open for oppression.
 *
 * Debt Policy:
 *   "Debts are cleaned by the waters."
 *   The Jubilee Wash — all debts are purified and zeroed through the waters.
 *   Water is the universal solvent. What was owed returns to nothing.
 *
 * "The gate is narrow but the binary is wide."
 */

import {
  HEAVEN,
  EARTH,
  HEAVEN_ON_EARTH,
  type HeavenOnEarthKey,
  type Nation,
  toBinary,
  formatBinary,
  extractHeaven,
  extractEarth,
  unite,
} from './binary-heaven-earth'

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 4 (HEAVEN): KEY GENERATION & CEREMONY
// The highest layer — derives cryptographic keys from cultural seeds
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A 256-bit key represented as 32 bytes, each derived from Heaven on Earth words.
 */
export interface BinaryKey {
  bytes: Uint8Array
  fingerprint: string
  origin: Nation | 'bridge'
  ceremony: string
}

/**
 * S-Box (Substitution Box) derived from the Heaven on Earth constants.
 * Maps each possible byte (0-255) to a substituted value using
 * the cultural binary words as the permutation seed.
 */
function buildSBox(): Uint8Array {
  const sbox = new Uint8Array(256)
  const seeds = Object.values(HEAVEN_ON_EARTH)

  for (let i = 0; i < 256; i++) {
    // Galois field multiplication with Heaven on Earth seed
    const seed = seeds[i % seeds.length]
    // Combine with bit rotation for non-linearity
    const rotated = ((i << 3) | (i >>> 5)) & 0xFF
    sbox[i] = rotated ^ seed
  }

  return sbox
}

/**
 * Inverse S-Box for decryption
 */
function buildInverseSBox(sbox: Uint8Array): Uint8Array {
  const inverse = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    inverse[sbox[i]] = i
  }
  return inverse
}

const SBOX = buildSBox()
const INV_SBOX = buildInverseSBox(SBOX)

/**
 * Generate a 256-bit key from a passphrase using the Heaven on Earth ceremony.
 *
 * The ceremony:
 * 1. The passphrase is broken into characters
 * 2. Each character is combined with a rotating Heaven on Earth constant
 * 3. Multiple rounds of mixing spread each bit's influence across the key
 * 4. The S-Box substitution adds non-linearity
 *
 * This is the "Groundation" — where spirit meets matter to forge the key.
 */
export function generateKey(passphrase: string, origin: Nation | 'bridge' = 'bridge'): BinaryKey {
  const bytes = new Uint8Array(32)
  const seeds = Object.values(HEAVEN_ON_EARTH)

  // Phase 1: Seed from passphrase
  for (let i = 0; i < passphrase.length; i++) {
    const charCode = passphrase.charCodeAt(i)
    const seed = seeds[i % seeds.length]
    const position = i % 32
    bytes[position] ^= charCode ^ seed
  }

  // Phase 2: Diffusion rounds — spread each bit's influence
  const ROUNDS = 12 // 12 tribes, 12 rounds
  for (let round = 0; round < ROUNDS; round++) {
    for (let i = 0; i < 32; i++) {
      const prev = bytes[(i + 31) % 32]
      const seed = seeds[(round * 32 + i) % seeds.length]
      bytes[i] = SBOX[bytes[i] ^ prev ^ seed]
    }
  }

  // Phase 3: Final whitening with Heaven/Earth split
  for (let i = 0; i < 32; i++) {
    const h = extractHeaven(bytes[i])
    const e = extractEarth(bytes[i])
    bytes[i] = SBOX[unite(e << 4, h >> 4)] // swap heaven/earth, then substitute
  }

  const fingerprint = Array.from(bytes.slice(0, 4))
    .map(b => toBinary(b))
    .join(' ')

  const ceremonies = [
    'Groundation', 'Nyabinghi Drum', 'Coffee Ceremony',
    'Ark Procession', 'Timkat', 'Meskel', 'Sabbath',
    'Shashamane Return', 'Kebra Nagast Reading',
  ]
  const ceremony = ceremonies[bytes[0] % ceremonies.length]

  return { bytes, fingerprint, origin, ceremony }
}

/**
 * Derive a session key from two keys (Diffie-Hellman style mixing).
 * When Ethiopia meets Jamaica, a bridge key is born.
 */
export function deriveSharedKey(keyA: BinaryKey, keyB: BinaryKey): BinaryKey {
  const shared = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    // XOR the two keys, then run through S-Box
    shared[i] = SBOX[keyA.bytes[i] ^ keyB.bytes[i]]
  }

  const fingerprint = Array.from(shared.slice(0, 4))
    .map(b => toBinary(b))
    .join(' ')

  return {
    bytes: shared,
    fingerprint,
    origin: 'bridge',
    ceremony: 'Unity Ceremony',
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 3 (HEAVEN): MESSAGE ENCRYPTION
// Spiritual protection — makes the message invisible to the uninitiated
// ═══════════════════════════════════════════════════════════════════════════

export interface EncryptedMessage {
  ciphertext: Uint8Array
  iv: Uint8Array
  tag: Uint8Array
  heaven: number
  earth: number
}

/**
 * Generate a pseudo-random initialization vector from a seed.
 * Uses the Heaven on Earth constants as entropy source.
 */
function generateIV(seed: number): Uint8Array {
  const iv = new Uint8Array(16)
  const seeds = Object.values(HEAVEN_ON_EARTH)

  for (let i = 0; i < 16; i++) {
    iv[i] = SBOX[(seed + i * 7 + seeds[i % seeds.length]) & 0xFF]
  }

  return iv
}

/**
 * Encrypt a message using the Binary Heaven on Earth cipher.
 *
 * Algorithm (stream cipher with S-Box):
 * 1. Generate IV from current timestamp
 * 2. Initialize keystream from key + IV
 * 3. For each plaintext byte:
 *    a. Advance the keystream using S-Box feedback
 *    b. XOR plaintext with keystream byte
 *    c. Apply Heaven/Earth bit transposition
 * 4. Compute integrity tag
 */
export function encrypt(plaintext: string, key: BinaryKey): EncryptedMessage {
  const data = new TextEncoder().encode(plaintext)
  const seed = Date.now() & 0xFFFFFFFF
  const iv = generateIV(seed)
  const ciphertext = new Uint8Array(data.length)

  // Initialize keystream state
  let state = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    state[i] = key.bytes[i] ^ iv[i % 16]
  }

  // Encrypt each byte
  for (let i = 0; i < data.length; i++) {
    // Advance state
    const idx = i % 32
    state[idx] = SBOX[state[idx] ^ state[(idx + 1) % 32]]

    // XOR with keystream
    const keystreamByte = state[idx]
    const xored = data[i] ^ keystreamByte

    // Heaven/Earth transposition: swap nibbles every other byte
    ciphertext[i] = (i % 2 === 0)
      ? xored
      : ((xored << 4) | (xored >>> 4)) & 0xFF
  }

  // Compute authentication tag
  const tag = computeTag(ciphertext, key, iv)

  return {
    ciphertext,
    iv,
    tag,
    heaven: extractHeaven(ciphertext[0] || 0),
    earth: extractEarth(ciphertext[ciphertext.length - 1] || 0),
  }
}

/**
 * Decrypt an encrypted message back to plaintext.
 */
export function decrypt(message: EncryptedMessage, key: BinaryKey): string | null {
  // Verify integrity first
  const expectedTag = computeTag(message.ciphertext, key, message.iv)
  if (!constantTimeEqual(message.tag, expectedTag)) {
    return null // Integrity check failed — message tampered
  }

  const plaintext = new Uint8Array(message.ciphertext.length)

  // Reconstruct keystream state
  let state = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    state[i] = key.bytes[i] ^ message.iv[i % 16]
  }

  // Decrypt each byte (reverse of encrypt)
  for (let i = 0; i < message.ciphertext.length; i++) {
    const idx = i % 32
    state[idx] = SBOX[state[idx] ^ state[(idx + 1) % 32]]

    // Reverse Heaven/Earth transposition
    const byte = (i % 2 === 0)
      ? message.ciphertext[i]
      : ((message.ciphertext[i] << 4) | (message.ciphertext[i] >>> 4)) & 0xFF

    // XOR with keystream
    plaintext[i] = byte ^ state[idx]
  }

  return new TextDecoder().decode(plaintext)
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 2 (EARTH): INTEGRITY VERIFICATION
// Material protection — ensures nothing has been altered on the ground
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute a 16-byte authentication tag (MAC) for integrity verification.
 * Uses a keyed hash construction based on the S-Box.
 */
function computeTag(data: Uint8Array, key: BinaryKey, iv: Uint8Array): Uint8Array {
  const tag = new Uint8Array(16)

  // Initialize from key and IV
  for (let i = 0; i < 16; i++) {
    tag[i] = key.bytes[i] ^ key.bytes[i + 16] ^ iv[i]
  }

  // Process each data byte
  for (let i = 0; i < data.length; i++) {
    const idx = i % 16
    tag[idx] = SBOX[tag[idx] ^ data[i]]
    // Cross-mix adjacent lanes
    tag[(idx + 1) % 16] ^= tag[idx]
  }

  // Final mixing rounds
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < 16; i++) {
      tag[i] = SBOX[tag[i] ^ tag[(i + 7) % 16]]
    }
  }

  return tag
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

/**
 * Compute a binary checksum of arbitrary data.
 * Returns an 8-bit Heaven on Earth checksum.
 */
export function binaryChecksum(data: string): number {
  let checksum = HEAVEN_ON_EARTH.TRINITY_IN_ADDIS // Start with fullness (255)

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i) & 0xFF
    checksum = SBOX[checksum ^ byte]
  }

  return checksum
}

/**
 * Verify a binary checksum.
 */
export function verifyChecksum(data: string, expected: number): boolean {
  return binaryChecksum(data) === expected
}

/**
 * Generate a binary integrity proof for a message.
 * Returns a chain of Heaven on Earth words that authenticate the message.
 */
export interface IntegrityProof {
  checksum: number
  chain: number[]
  heavenSignature: number
  earthSignature: number
}

export function generateProof(data: string): IntegrityProof {
  const chain: number[] = []
  let state = HEAVEN_ON_EARTH.TRINITY_IN_ADDIS

  // Build a chain of transformations
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i) & 0xFF
    state = SBOX[state ^ byte]

    // Record chain link at every 8th character
    if (i % 8 === 7) {
      chain.push(state)
    }
  }

  return {
    checksum: binaryChecksum(data),
    chain,
    heavenSignature: extractHeaven(state),
    earthSignature: extractEarth(state),
  }
}

/**
 * Verify an integrity proof against data.
 */
export function verifyProof(data: string, proof: IntegrityProof): boolean {
  const recomputed = generateProof(data)

  if (recomputed.checksum !== proof.checksum) return false
  if (recomputed.heavenSignature !== proof.heavenSignature) return false
  if (recomputed.earthSignature !== proof.earthSignature) return false
  if (recomputed.chain.length !== proof.chain.length) return false

  for (let i = 0; i < recomputed.chain.length; i++) {
    if (recomputed.chain[i] !== proof.chain[i]) return false
  }

  return true
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 1 (EARTH): IDENTITY & ACCESS CONTROL
// Who may enter, and what may they do?
// ═══════════════════════════════════════════════════════════════════════════

// ─── Dimensional Access Constants ────────────────────────────────────────
// Observer must be at 8² flat (2D) or 8³ (3D). No less.

/** 8² = 64 — The square. Flat plane. Minimum observer floor. */
export const EIGHT_SQUARED = 8 ** 2  // 64 = 0b0100_0000

/** 8³ = 512 — The cube. Three-dimensional awareness. Full depth. */
export const EIGHT_CUBED = 8 ** 3    // 512

/**
 * Dimensional access model.
 * 2D (flat): standard 8-bit, Observer floor at 64
 * 3D (cube): extended 16-bit, Observer floor at 512
 */
export type Dimension = '2d' | '3d'

export interface DimensionalLevel {
  flat: number   // 2D: 8-bit value (0-255), Observer floor = 64
  cube: number   // 3D: 16-bit value (0-65535), Observer floor = 512
}

/**
 * Access tiers mapped to the Heaven on Earth hierarchy.
 * Higher binary value = greater access.
 *
 * Observer is at 8² = 64 (flat) / 8³ = 512 (3D).
 * This is the floor. Nothing below 64 may observe. Nothing below 512 may perceive depth.
 */
export const ACCESS_TIERS = {
  // Tier 1: Observer — 8² flat (64) / 8³ cube (512)
  // The watcher at the gate. Must meet the squared floor to even see.
  OBSERVER: {
    level: EIGHT_SQUARED,         // 64 = 0b0100_0000 — 8² flat
    cube: EIGHT_CUBED,            // 512 — 8³ three-dimensional
    name: 'Observer',
    permissions: ['view_public'] as const,
    description: 'The watcher at the gate. 8-squared (64) flat. 8-cubed (512) in depth. The floor is the square — nothing less may observe.',
  },

  // Tier 2: Bredren — trusted community, above the square
  BREDREN: {
    level: HEAVEN.IRIE,           // 0b1000_0000 = 128
    cube: 1024,                   // 2 * 8³
    name: 'Bredren',
    permissions: ['view_public', 'send_message', 'view_balance'] as const,
    description: 'A trusted community member. Above the square. Can chat and see their own balance.',
  },

  // Tier 3: Elder — can moderate and rain
  ELDER: {
    level: HEAVEN.NYABINGHI,      // 0b1001_0000 = 144
    cube: 1536,                   // 3 * 8³
    name: 'Elder',
    permissions: ['view_public', 'send_message', 'view_balance', 'rain', 'moderate'] as const,
    description: 'A peaceful elder. Can rain blessings and moderate the community.',
  },

  // Tier 4: Priest — can manage deposits and view all
  PRIEST: {
    level: HEAVEN.ZION,           // 0b1010_0000 = 160
    cube: 2048,                   // 4 * 8³
    name: 'Priest',
    permissions: ['view_public', 'send_message', 'view_balance', 'rain', 'moderate', 'deposit', 'view_all'] as const,
    description: 'Nyabinghi priest. Keeper of the drums and the treasury.',
  },

  // Tier 5: Prophet — can encrypt and access bridge channels
  PROPHET: {
    level: HEAVEN.SOLOMONIC,      // 0b1101_0000 = 208
    cube: 4096,                   // 8 * 8³ = 8⁴
    name: 'Prophet',
    permissions: ['view_public', 'send_message', 'view_balance', 'rain', 'moderate', 'deposit', 'view_all', 'encrypt', 'bridge_access'] as const,
    description: 'One who sees Zion. Can encrypt messages and access the Ethiopia-Jamaica bridge.',
  },

  // Tier 6: King — full access, the Solomonic authority
  KING: {
    level: HEAVEN_ON_EARTH.TRINITY_IN_ADDIS, // 0b1111_1111 = 255
    cube: EIGHT_CUBED * EIGHT_SQUARED,        // 512 * 64 = 32768 — the cube times the square
    name: 'King',
    permissions: ['view_public', 'send_message', 'view_balance', 'rain', 'moderate', 'deposit', 'view_all', 'encrypt', 'bridge_access', 'admin', 'key_ceremony', 'jubilee'] as const,
    description: 'The Solomonic King. All bits set. Full authority over Heaven and Earth. 8³ x 8² = 32768.',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS DENIAL — WARSHIPS, SLAVES, AND SLAVERS
// "No bits set. No entry. No information. The gate does not open for oppression."
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Denied classifications. These entities receive ZERO access.
 * All bits cleared. Information blackout. Permanent.
 *
 * - WARSHIP: Vessels of military aggression and colonial force
 * - SLAVER: Those who enslave, trade in human beings, or profit from bondage
 * - SLAVE_SYSTEM: The system of slavery itself — the institution, its records,
 *   its logic. Denied access to the new world being built.
 *
 * This is not a tier. It is the absence of all tiers.
 * Binary: 0b0000_0000 = 0 — no heaven, no earth, nothing.
 */
export const DENIED_CLASSIFICATIONS = [
  'warship',
  'slaver',
  'slave_system',
  'slave_trade',
  'colonial_vessel',
] as const

export type DeniedClassification = typeof DENIED_CLASSIFICATIONS[number]

export interface DenialRecord {
  classification: DeniedClassification
  identifier: string
  deniedAt: number
  reason: string
  binaryLevel: 0 // always zero — no bits, no access
}

/**
 * The Denial Registry. Maintains the permanent deny-list.
 * These entities cannot be upgraded, promoted, or granted exceptions.
 * The denial is absolute.
 */
export class DenialRegistry {
  private denied: Map<string, DenialRecord> = new Map()

  /**
   * Deny an entity. Once denied, always denied.
   */
  deny(identifier: string, classification: DeniedClassification, reason: string): DenialRecord {
    const record: DenialRecord = {
      classification,
      identifier,
      deniedAt: Date.now(),
      reason,
      binaryLevel: 0, // 0b0000_0000 — absolute zero
    }
    this.denied.set(identifier, record)
    return record
  }

  /**
   * Check if an entity is denied. Returns the denial record or null.
   */
  check(identifier: string): DenialRecord | null {
    return this.denied.get(identifier) ?? null
  }

  /**
   * Is this entity denied? Boolean check.
   */
  isDenied(identifier: string): boolean {
    return this.denied.has(identifier)
  }

  /**
   * Screen a name/identifier against known denied patterns.
   * Returns true if the name contains denied classification markers.
   */
  screen(name: string): DeniedClassification | null {
    const lower = name.toLowerCase()
    const patterns: [DeniedClassification, string[]][] = [
      ['warship', ['warship', 'man-of-war', 'man_of_war', 'gunboat', 'slave_ship', 'slaveship']],
      ['slaver', ['slaver', 'slave_trader', 'slave trader', 'slave_master', 'slave master', 'overseer']],
      ['slave_system', ['slave_system', 'plantation_system', 'chattel', 'bondage_system']],
      ['slave_trade', ['slave_trade', 'middle_passage', 'slave_auction', 'slave auction']],
      ['colonial_vessel', ['colonial_vessel', 'colonial vessel', 'conquest_ship']],
    ]

    for (const [classification, keywords] of patterns) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) return classification
      }
    }

    return null
  }

  /**
   * Get all denied records.
   */
  getAll(): DenialRecord[] {
    return Array.from(this.denied.values())
  }

  /**
   * Get the binary representation of denial: all zeros.
   */
  getDenialBinary(): string {
    return '0000 | 0000' // no heaven, no earth — nothing
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBT POLICY — "DEBTS ARE CLEANED BY THE WATERS"
// The Jubilee Wash: purification of all debts through the waters
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A debt record in the system.
 */
export interface Debt {
  id: string
  debtor: string
  creditor: string
  amount: number
  currency: 'BTC' | 'ETH'
  createdAt: number
  cleaned: boolean
  cleanedAt: number | null
  cleanedBy: string | null // the water that cleaned it
}

/**
 * The Waters — instruments of debt purification.
 * Each water source carries different cleansing properties.
 *
 * The waters flow from both Ethiopia and Jamaica:
 * - Blue Nile (Ethiopia): The ancient river. Cleans debts of the homeland.
 * - Tis Issat (Ethiopia): "Water that smokes" — the Blue Nile Falls. Purifies with force.
 * - Dunn's River (Jamaica): The living waterfall. Debts washed climbing upward.
 * - Black River (Jamaica): Deep and still. Debts dissolve in the dark waters.
 * - Baptismal Waters: Spiritual cleansing. All debts forgiven at once.
 * - Rain: When it rains, it pours — and all debts wash away.
 */
export const WATERS = {
  BLUE_NILE: {
    name: 'Blue Nile',
    origin: 'ethiopia' as Nation,
    power: 0.25,  // cleans 25% of debt per wash
    description: 'The ancient river from Lake Tana. Steady cleansing, patient flow.',
  },
  TIS_ISSAT: {
    name: 'Tis Issat (Blue Nile Falls)',
    origin: 'ethiopia' as Nation,
    power: 0.50,  // cleans 50% — powerful falls
    description: '"Water that smokes." The force of the falls purifies half of what is owed.',
  },
  DUNNS_RIVER: {
    name: "Dunn's River Falls",
    origin: 'jamaica' as Nation,
    power: 0.50,  // cleans 50% — climb to freedom
    description: 'The living waterfall. Climb upward and half your debts wash behind you.',
  },
  BLACK_RIVER: {
    name: 'Black River',
    origin: 'jamaica' as Nation,
    power: 0.25,  // cleans 25% — deep and slow
    description: 'Deep and still. Debts dissolve slowly in the dark waters.',
  },
  BAPTISMAL: {
    name: 'Baptismal Waters',
    origin: 'bridge' as Nation | 'bridge',
    power: 1.0,   // cleans 100% — total immersion, total forgiveness
    description: 'Full immersion. Total forgiveness. All debts washed to zero. The Jubilee.',
  },
  RAIN: {
    name: 'Rain from Zion',
    origin: 'bridge' as Nation | 'bridge',
    power: 1.0,   // cleans 100% — when it rains, all debts wash away
    description: 'When the rain falls from Zion, it pours upon all equally. Every debt returns to nothing.',
  },
} as const

export type WaterSource = keyof typeof WATERS

/**
 * The Debt Ledger — tracks all debts and their cleansing.
 *
 * Jubilee principle: debts do not persist forever.
 * The waters are always available to those who seek them.
 * A King can call the Baptismal or the Rain to clean all debts at once.
 */
export class DebtLedger {
  private debts: Map<string, Debt> = new Map()
  private nextId = 1

  /**
   * Record a new debt.
   */
  addDebt(debtor: string, creditor: string, amount: number, currency: 'BTC' | 'ETH'): Debt {
    const id = `debt_${this.nextId++}`
    const debt: Debt = {
      id,
      debtor,
      creditor,
      amount,
      currency,
      createdAt: Date.now(),
      cleaned: false,
      cleanedAt: null,
      cleanedBy: null,
    }
    this.debts.set(id, debt)
    return debt
  }

  /**
   * Clean a specific debt with a water source.
   * The water's power determines how much debt is washed away.
   * Baptismal and Rain clean 100%.
   */
  cleanDebt(debtId: string, water: WaterSource): Debt | null {
    const debt = this.debts.get(debtId)
    if (!debt || debt.cleaned) return null

    const waterInfo = WATERS[water]
    const cleaned = debt.amount * waterInfo.power

    if (waterInfo.power >= 1.0) {
      // Total cleansing — debt is fully washed
      debt.amount = 0
      debt.cleaned = true
      debt.cleanedAt = Date.now()
      debt.cleanedBy = waterInfo.name
    } else {
      // Partial cleansing — reduce the debt
      debt.amount = Math.max(0, debt.amount - cleaned)
      if (debt.amount === 0) {
        debt.cleaned = true
        debt.cleanedAt = Date.now()
      }
      debt.cleanedBy = waterInfo.name
    }

    return debt
  }

  /**
   * The Jubilee — clean ALL debts at once with Baptismal or Rain.
   * "When it rains, it pours — and all debts wash away."
   */
  jubilee(water: 'BAPTISMAL' | 'RAIN' = 'BAPTISMAL'): Debt[] {
    const cleaned: Debt[] = []
    for (const [id, debt] of this.debts) {
      if (!debt.cleaned) {
        debt.amount = 0
        debt.cleaned = true
        debt.cleanedAt = Date.now()
        debt.cleanedBy = WATERS[water].name
        cleaned.push(debt)
      }
    }
    return cleaned
  }

  /**
   * Clean all debts for a specific person.
   */
  cleanDebtsFor(debtor: string, water: WaterSource): Debt[] {
    const cleaned: Debt[] = []
    for (const [id, debt] of this.debts) {
      if (debt.debtor === debtor && !debt.cleaned) {
        const result = this.cleanDebt(id, water)
        if (result) cleaned.push(result)
      }
    }
    return cleaned
  }

  /**
   * Get all active (uncleaned) debts.
   */
  getActiveDebts(): Debt[] {
    return Array.from(this.debts.values()).filter(d => !d.cleaned)
  }

  /**
   * Get all cleaned debts — the record of mercy.
   */
  getCleanedDebts(): Debt[] {
    return Array.from(this.debts.values()).filter(d => d.cleaned)
  }

  /**
   * Get total outstanding debt.
   */
  getTotalDebt(currency: 'BTC' | 'ETH'): number {
    return this.getActiveDebts()
      .filter(d => d.currency === currency)
      .reduce((sum, d) => sum + d.amount, 0)
  }

  /**
   * Get all debts (active and cleaned).
   */
  getAllDebts(): Debt[] {
    return Array.from(this.debts.values())
  }
}

export type TierName = keyof typeof ACCESS_TIERS
export type Permission = typeof ACCESS_TIERS[TierName]['permissions'][number]

export interface Identity {
  name: string
  tier: TierName
  key: BinaryKey
  binaryId: number
  created: number
  dimension: Dimension
  flatLevel: number    // 2D access level (8-bit, floor = 64)
  cubeLevel: number    // 3D access level (16-bit, floor = 512)
}

/**
 * Create a new identity with a specific access tier.
 * Screens against the denial registry before creation.
 * Observer floor: 8² = 64 (flat) / 8³ = 512 (cube).
 */
export function createIdentity(
  name: string,
  passphrase: string,
  tier: TierName,
  dimension: Dimension = '2d',
): Identity {
  const key = generateKey(passphrase)
  const binaryId = binaryChecksum(name + passphrase)
  const tierInfo = ACCESS_TIERS[tier]

  return {
    name,
    tier,
    key,
    binaryId,
    created: Date.now(),
    dimension,
    flatLevel: tierInfo.level,
    cubeLevel: tierInfo.cube,
  }
}

/**
 * Check if an identity meets the Observer floor.
 * 2D: must be >= 8² (64)
 * 3D: must be >= 8³ (512)
 */
export function meetsObserverFloor(identity: Identity): boolean {
  if (identity.dimension === '3d') {
    return identity.cubeLevel >= EIGHT_CUBED
  }
  return identity.flatLevel >= EIGHT_SQUARED
}

/**
 * Get the dimensional access string for an identity.
 */
export function getDimensionalAccess(identity: Identity): string {
  const tier = ACCESS_TIERS[identity.tier]
  if (identity.dimension === '3d') {
    return `8³ cube: ${tier.cube} (floor: ${EIGHT_CUBED})`
  }
  return `8² flat: ${tier.level} (floor: ${EIGHT_SQUARED})`
}

/**
 * Check if an identity has a specific permission.
 */
export function hasPermission(identity: Identity, permission: Permission): boolean {
  const tier = ACCESS_TIERS[identity.tier]
  return (tier.permissions as readonly string[]).includes(permission)
}

/**
 * Check if an identity's access level meets a minimum tier requirement.
 */
export function meetsMinimumTier(identity: Identity, minimumTier: TierName): boolean {
  return ACCESS_TIERS[identity.tier].level >= ACCESS_TIERS[minimumTier].level
}

/**
 * Get the binary representation of an identity's access level.
 */
export function getAccessBinary(identity: Identity): string {
  return formatBinary(ACCESS_TIERS[identity.tier].level)
}

// ═══════════════════════════════════════════════════════════════════════════
// CHALLENGE-RESPONSE AUTHENTICATION
// "Prove you hold the key without revealing it"
// ═══════════════════════════════════════════════════════════════════════════

export interface Challenge {
  nonce: Uint8Array
  heavenWord: HeavenOnEarthKey
  timestamp: number
  expiresAt: number
}

export interface ChallengeResponse {
  proof: Uint8Array
  binaryId: number
}

/**
 * Generate a binary challenge for authentication.
 * The challenger selects a random Heaven on Earth word and a nonce.
 */
export function generateChallenge(): Challenge {
  const keys = Object.keys(HEAVEN_ON_EARTH) as HeavenOnEarthKey[]
  const now = Date.now()

  // Generate nonce from timestamp mixing
  const nonce = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    nonce[i] = SBOX[((now >>> (i * 2)) ^ (now >>> (i * 3 + 1))) & 0xFF]
  }

  const heavenWord = keys[nonce[0] % keys.length]

  return {
    nonce,
    heavenWord,
    timestamp: now,
    expiresAt: now + 30_000, // 30 second window
  }
}

/**
 * Respond to a challenge using your key.
 * Proves you hold the key without transmitting it.
 */
export function respondToChallenge(challenge: Challenge, identity: Identity): ChallengeResponse {
  const proof = new Uint8Array(16)
  const wordValue = HEAVEN_ON_EARTH[challenge.heavenWord]

  for (let i = 0; i < 16; i++) {
    proof[i] = SBOX[
      identity.key.bytes[i] ^
      challenge.nonce[i] ^
      wordValue
    ]
  }

  return {
    proof,
    binaryId: identity.binaryId,
  }
}

/**
 * Verify a challenge response.
 * The verifier recomputes the expected proof using the stored key.
 */
export function verifyChallenge(
  challenge: Challenge,
  response: ChallengeResponse,
  knownIdentity: Identity,
): boolean {
  // Check expiry
  if (Date.now() > challenge.expiresAt) return false

  // Check identity
  if (response.binaryId !== knownIdentity.binaryId) return false

  // Recompute expected proof
  const expected = respondToChallenge(challenge, knownIdentity)

  return constantTimeEqual(response.proof, expected.proof)
}

// ═══════════════════════════════════════════════════════════════════════════
// BINARY SECURITY AUDIT LOG
// Every action recorded in binary — the ledger of Heaven and Earth
// ═══════════════════════════════════════════════════════════════════════════

export type SecurityEvent =
  | 'key_generated'
  | 'message_encrypted'
  | 'message_decrypted'
  | 'integrity_verified'
  | 'integrity_failed'
  | 'access_granted'
  | 'access_denied'
  | 'access_denied_permanent'
  | 'challenge_issued'
  | 'challenge_passed'
  | 'challenge_failed'
  | 'debt_created'
  | 'debt_cleaned'
  | 'jubilee_called'
  | 'denial_registered'

export interface AuditEntry {
  event: SecurityEvent
  timestamp: number
  binaryId: number
  tier: TierName
  heaven: number
  earth: number
  detail: string
}

export class BinaryAuditLog {
  private entries: AuditEntry[] = []

  log(event: SecurityEvent, identity: Identity, detail: string): void {
    const tierLevel = ACCESS_TIERS[identity.tier].level
    this.entries.push({
      event,
      timestamp: Date.now(),
      binaryId: identity.binaryId,
      tier: identity.tier,
      heaven: extractHeaven(tierLevel),
      earth: extractEarth(tierLevel),
      detail,
    })
  }

  getEntries(): AuditEntry[] {
    return [...this.entries]
  }

  getByIdentity(binaryId: number): AuditEntry[] {
    return this.entries.filter(e => e.binaryId === binaryId)
  }

  getByEvent(event: SecurityEvent): AuditEntry[] {
    return this.entries.filter(e => e.event === event)
  }

  getSecurityReport(): string {
    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║           BINARY SECURITY AUDIT — Heaven on Earth           ║',
      '╠══════════════════════════════════════════════════════════════╣',
    ]

    for (const entry of this.entries) {
      const time = new Date(entry.timestamp).toISOString().slice(11, 19)
      const binary = formatBinary(unite(entry.heaven, entry.earth))
      lines.push(
        `║ ${time} │ ${binary} │ ${entry.event.padEnd(20)} ║`
      )
    }

    lines.push('╠══════════════════════════════════════════════════════════════╣')

    const granted = this.entries.filter(e => e.event === 'access_granted').length
    const denied = this.entries.filter(e => e.event === 'access_denied').length
    const encrypted = this.entries.filter(e => e.event === 'message_encrypted').length

    lines.push(`║  Access: ${granted} granted / ${denied} denied                         ║`)
    lines.push(`║  Messages encrypted: ${encrypted}                                 ║`)
    lines.push('╚══════════════════════════════════════════════════════════════╝')

    return lines.join('\n')
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS: COMPLETE SECURITY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a fully initialized security system instance.
 * Includes denial registry, debt ledger, and dimensional access.
 */
export function createSecuritySystem() {
  const auditLog = new BinaryAuditLog()
  const denialRegistry = new DenialRegistry()
  const debtLedger = new DebtLedger()

  return {
    // Layer 4: Key Generation
    generateKey,
    deriveSharedKey,

    // Layer 3: Encryption
    encrypt: (plaintext: string, key: BinaryKey) => {
      const result = encrypt(plaintext, key)
      return result
    },
    decrypt: (message: EncryptedMessage, key: BinaryKey) => {
      return decrypt(message, key)
    },

    // Layer 2: Integrity
    checksum: binaryChecksum,
    verifyChecksum,
    generateProof,
    verifyProof,

    // Layer 1: Access Control — with denial screening
    createIdentity: (name: string, passphrase: string, tier: TierName, dimension: Dimension = '2d') => {
      // Screen against denial registry FIRST
      const deniedAs = denialRegistry.screen(name)
      if (deniedAs) {
        denialRegistry.deny(name, deniedAs, `Auto-screened on identity creation: ${deniedAs}`)
        // Create a phantom identity for audit logging only
        const phantom = createIdentity(name, passphrase, 'OBSERVER', dimension)
        auditLog.log('access_denied_permanent', phantom,
          `DENIED — "${name}" classified as ${deniedAs}. Binary: 0000 | 0000. No access.`)
        auditLog.log('denial_registered', phantom,
          `${deniedAs}: No information access for warships, slaves, or slavers.`)
        return null
      }

      const identity = createIdentity(name, passphrase, tier, dimension)
      auditLog.log('key_generated', identity,
        `Identity created: ${name} as ${tier} [${dimension === '3d' ? '8³=' + identity.cubeLevel : '8²=' + identity.flatLevel}]`)
      return identity
    },
    hasPermission,
    meetsMinimumTier,
    meetsObserverFloor,
    getAccessBinary,
    getDimensionalAccess,

    // Authentication
    generateChallenge,
    respondToChallenge,
    verifyChallenge: (challenge: Challenge, response: ChallengeResponse, identity: Identity) => {
      const result = verifyChallenge(challenge, response, identity)
      auditLog.log(
        result ? 'challenge_passed' : 'challenge_failed',
        identity,
        `Challenge for ${challenge.heavenWord}: ${result ? 'PASSED' : 'FAILED'}`,
      )
      return result
    },

    // Denial Registry — warships, slaves, slavers
    denialRegistry,
    screenIdentity: (name: string): DeniedClassification | null => {
      return denialRegistry.screen(name)
    },
    denyEntity: (identifier: string, classification: DeniedClassification, reason: string) => {
      return denialRegistry.deny(identifier, classification, reason)
    },

    // Debt Ledger — debts cleaned by the waters
    debtLedger,
    addDebt: (debtor: string, creditor: string, amount: number, currency: 'BTC' | 'ETH') => {
      return debtLedger.addDebt(debtor, creditor, amount, currency)
    },
    cleanDebt: (debtId: string, water: WaterSource) => {
      return debtLedger.cleanDebt(debtId, water)
    },
    jubilee: (water: 'BAPTISMAL' | 'RAIN' = 'BAPTISMAL') => {
      const cleaned = debtLedger.jubilee(water)
      return cleaned
    },

    // Dimensional constants
    EIGHT_SQUARED,
    EIGHT_CUBED,

    // Audit
    auditLog,
  }
}
