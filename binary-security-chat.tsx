'use client'

import { useState, useCallback } from 'react'
import {
  HEAVEN_ON_EARTH,
  toBinary,
  formatBinary,
  extractHeaven,
  extractEarth,
} from './binary-heaven-earth'
import {
  ACCESS_TIERS,
  EIGHT_SQUARED,
  EIGHT_CUBED,
  WATERS,
  DENIED_CLASSIFICATIONS,
  type TierName,
  type Permission,
  type Dimension,
  type WaterSource,
  type DeniedClassification,
  type Identity,
  type Debt,
  type DenialRecord,
  type EncryptedMessage,
  type AuditEntry,
  type IntegrityProof,
  type Challenge,
  createSecuritySystem,
} from './binary-security'

/**
 * Binary Security Dashboard for CryptoChat
 *
 * Interactive UI for the 4-layer binary security system:
 *   Layer 1: Identity & Access Control
 *   Layer 2: Integrity Verification
 *   Layer 3: Message Encryption
 *   Layer 4: Key Generation & Ceremony
 */

type SecurityTab = 'identity' | 'encrypt' | 'integrity' | 'denial' | 'debt' | 'audit'

const security = createSecuritySystem()

export default function BinarySecurityChat() {
  // Identity state
  const [identityName, setIdentityName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [selectedTier, setSelectedTier] = useState<TierName>('BREDREN')
  const [currentIdentity, setCurrentIdentity] = useState<Identity | null>(null)

  // Encryption state
  const [plaintext, setPlaintext] = useState('')
  const [encryptedMsg, setEncryptedMsg] = useState<EncryptedMessage | null>(null)
  const [decryptedText, setDecryptedText] = useState<string | null>(null)

  // Integrity state
  const [integrityInput, setIntegrityInput] = useState('')
  const [integrityProof, setIntegrityProof] = useState<IntegrityProof | null>(null)
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)

  // Dimension state
  const [selectedDimension, setSelectedDimension] = useState<Dimension>('2d')

  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeResult, setChallengeResult] = useState<string | null>(null)

  // Denial state
  const [screenInput, setScreenInput] = useState('')
  const [screenResult, setScreenResult] = useState<{ denied: boolean; classification: DeniedClassification | null } | null>(null)
  const [denialRecords, setDenialRecords] = useState<DenialRecord[]>([])

  // Debt state
  const [debtDebtor, setDebtDebtor] = useState('')
  const [debtCreditor, setDebtCreditor] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtCurrency, setDebtCurrency] = useState<'BTC' | 'ETH'>('BTC')
  const [activeDebts, setActiveDebts] = useState<Debt[]>([])
  const [cleanedDebts, setCleanedDebts] = useState<Debt[]>([])
  const [selectedWater, setSelectedWater] = useState<WaterSource>('BLUE_NILE')

  // UI state
  const [activeTab, setActiveTab] = useState<SecurityTab>('identity')
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])

  const refreshAudit = useCallback(() => {
    setAuditEntries(security.auditLog.getEntries())
  }, [])

  // ── Identity Actions ──────────────────────────────────────────────────

  const handleCreateIdentity = () => {
    if (!identityName.trim() || !passphrase.trim()) return
    const identity = security.createIdentity(identityName, passphrase, selectedTier, selectedDimension)
    if (identity === null) {
      // Denied — warship, slaver, slave system
      setCurrentIdentity(null)
      setDenialRecords(security.denialRegistry.getAll())
      refreshAudit()
      alert(`ACCESS DENIED — "${identityName}" is classified under the denial policy. Binary: 0000 | 0000. No information access.`)
      return
    }
    setCurrentIdentity(identity)
    refreshAudit()
  }

  const handleChallenge = () => {
    if (!currentIdentity) return
    const ch = security.generateChallenge()
    setChallenge(ch)

    const response = security.respondToChallenge(ch, currentIdentity)
    const result = security.verifyChallenge(ch, response, currentIdentity)
    setChallengeResult(result ? 'PASSED — Identity verified' : 'FAILED — Key mismatch')
    refreshAudit()
  }

  // ── Encryption Actions ────────────────────────────────────────────────

  const handleEncrypt = () => {
    if (!plaintext.trim() || !currentIdentity) return
    if (!security.hasPermission(currentIdentity, 'encrypt' as Permission)) {
      setDecryptedText('[ACCESS DENIED — Encryption requires PROPHET tier or above]')
      security.auditLog.log('access_denied', currentIdentity, 'Attempted encryption without permission')
      refreshAudit()
      return
    }
    const encrypted = security.encrypt(plaintext, currentIdentity.key)
    setEncryptedMsg(encrypted)
    setDecryptedText(null)
    security.auditLog.log('message_encrypted', currentIdentity, `Encrypted ${plaintext.length} chars`)
    refreshAudit()
  }

  const handleDecrypt = () => {
    if (!encryptedMsg || !currentIdentity) return
    const result = security.decrypt(encryptedMsg, currentIdentity.key)
    setDecryptedText(result ?? '[INTEGRITY FAILED — Message may have been tampered with]')
    security.auditLog.log(
      result ? 'message_decrypted' : 'integrity_failed',
      currentIdentity,
      result ? `Decrypted successfully` : `Integrity check failed`,
    )
    refreshAudit()
  }

  // ── Integrity Actions ─────────────────────────────────────────────────

  const handleGenerateProof = () => {
    if (!integrityInput.trim()) return
    const proof = security.generateProof(integrityInput)
    setIntegrityProof(proof)
    setVerifyResult(null)
  }

  const handleVerifyProof = () => {
    if (!integrityProof) return
    const dataToVerify = verifyInput || integrityInput
    const result = security.verifyProof(dataToVerify, integrityProof)
    setVerifyResult(result)
    if (currentIdentity) {
      security.auditLog.log(
        result ? 'integrity_verified' : 'integrity_failed',
        currentIdentity,
        `Integrity ${result ? 'verified' : 'FAILED'} for data`,
      )
      refreshAudit()
    }
  }

  // ── Denial Actions ───────────────────────────────────────────────────

  const handleScreen = () => {
    if (!screenInput.trim()) return
    const classification = security.screenIdentity(screenInput)
    setScreenResult({ denied: classification !== null, classification })
    if (classification) {
      security.denyEntity(screenInput, classification, `Manually screened: ${classification}`)
      setDenialRecords(security.denialRegistry.getAll())
    }
  }

  const refreshDenials = () => setDenialRecords(security.denialRegistry.getAll())

  // ── Debt Actions ──────────────────────────────────────────────────────

  const refreshDebts = () => {
    setActiveDebts(security.debtLedger.getActiveDebts())
    setCleanedDebts(security.debtLedger.getCleanedDebts())
  }

  const handleAddDebt = () => {
    if (!debtDebtor.trim() || !debtCreditor.trim() || !debtAmount.trim()) return
    security.addDebt(debtDebtor, debtCreditor, parseFloat(debtAmount), debtCurrency)
    setDebtDebtor('')
    setDebtCreditor('')
    setDebtAmount('')
    refreshDebts()
    refreshAudit()
  }

  const handleCleanDebt = (debtId: string) => {
    security.cleanDebt(debtId, selectedWater)
    refreshDebts()
    refreshAudit()
  }

  const handleJubilee = () => {
    security.jubilee('BAPTISMAL')
    refreshDebts()
    refreshAudit()
  }

  const handleRainJubilee = () => {
    security.jubilee('RAIN')
    refreshDebts()
    refreshAudit()
  }

  // ── Styles ────────────────────────────────────────────────────────────

  const panel: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  }

  const input: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '4px',
    color: '#e6edf3',
    fontFamily: 'monospace',
    fontSize: '13px',
    marginBottom: '8px',
    boxSizing: 'border-box',
  }

  const button = (variant: 'primary' | 'secondary' | 'danger' = 'primary'): React.CSSProperties => ({
    padding: '8px 16px',
    background: variant === 'primary' ? '#238636' : variant === 'danger' ? '#da3633' : '#30363d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    marginRight: '8px',
  })

  const label: React.CSSProperties = {
    display: 'block',
    color: '#8b949e',
    fontSize: '12px',
    marginBottom: '4px',
  }

  const mono: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#4fc3f7',
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace', padding: '20px', color: '#e6edf3', background: '#010409', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid #30363d', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', color: '#58a6ff', marginBottom: '4px' }}>
          Binary Security System
        </h1>
        <p style={{ color: '#8b949e', fontSize: '13px' }}>
          4-Layer Protection for Heaven on Earth — CryptoChat
        </p>
        {currentIdentity && (
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
            <span style={{ color: '#3fb950' }}>
              Identity: {currentIdentity.name}
            </span>
            <span style={{ color: '#d29922' }}>
              Tier: {ACCESS_TIERS[currentIdentity.tier].name}
            </span>
            <span style={mono}>
              [{formatBinary(ACCESS_TIERS[currentIdentity.tier].level)}]
            </span>
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <nav style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        {([
          { key: 'identity' as SecurityTab, label: 'L1: Identity', color: '#3fb950' },
          { key: 'denial' as SecurityTab, label: 'Denial', color: '#f85149' },
          { key: 'debt' as SecurityTab, label: 'Debt/Waters', color: '#58a6ff' },
          { key: 'integrity' as SecurityTab, label: 'L2: Integrity', color: '#d29922' },
          { key: 'encrypt' as SecurityTab, label: 'L3: Encrypt', color: '#a371f7' },
          { key: 'audit' as SecurityTab, label: 'Audit', color: '#8b949e' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'audit') refreshAudit() }}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === tab.key ? '#161b22' : '#0d1117',
              color: activeTab === tab.key ? tab.color : '#484f58',
              border: `1px solid ${activeTab === tab.key ? tab.color : '#30363d'}`,
              borderBottom: activeTab === tab.key ? '2px solid ' + tab.color : '1px solid #30363d',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── LAYER 1: IDENTITY & ACCESS CONTROL ──────────────────────── */}
      {activeTab === 'identity' && (
        <div>
          <div style={panel}>
            <h3 style={{ color: '#3fb950', fontSize: '14px', marginBottom: '12px' }}>
              Create Identity
            </h3>

            <span style={label}>Name</span>
            <input
              style={input}
              value={identityName}
              onChange={e => setIdentityName(e.target.value)}
              placeholder="Enter your name..."
            />

            <span style={label}>Passphrase (used for key generation ceremony)</span>
            <input
              style={input}
              type="password"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              placeholder="Enter passphrase..."
            />

            <span style={label}>Access Tier</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {(Object.keys(ACCESS_TIERS) as TierName[]).map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    padding: '6px 12px',
                    background: selectedTier === tier ? '#238636' : '#21262d',
                    color: selectedTier === tier ? '#fff' : '#8b949e',
                    border: `1px solid ${selectedTier === tier ? '#238636' : '#30363d'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                >
                  {ACCESS_TIERS[tier].name} ({ACCESS_TIERS[tier].level})
                </button>
              ))}
            </div>

            <span style={label}>Dimension</span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setSelectedDimension('2d')}
                style={{
                  flex: 1, padding: '8px',
                  background: selectedDimension === '2d' ? '#0d2818' : '#21262d',
                  color: selectedDimension === '2d' ? '#3fb950' : '#8b949e',
                  border: `1px solid ${selectedDimension === '2d' ? '#238636' : '#30363d'}`,
                  borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
                }}
              >
                2D Flat — 8² = {EIGHT_SQUARED} floor
              </button>
              <button
                onClick={() => setSelectedDimension('3d')}
                style={{
                  flex: 1, padding: '8px',
                  background: selectedDimension === '3d' ? '#0d2818' : '#21262d',
                  color: selectedDimension === '3d' ? '#3fb950' : '#8b949e',
                  border: `1px solid ${selectedDimension === '3d' ? '#238636' : '#30363d'}`,
                  borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
                }}
              >
                3D Cube — 8³ = {EIGHT_CUBED} floor
              </button>
            </div>

            <button style={button('primary')} onClick={handleCreateIdentity}>
              Forge Identity
            </button>
          </div>

          {currentIdentity && (
            <>
              {/* Identity Card */}
              <div style={{ ...panel, borderColor: '#3fb950' }}>
                <h3 style={{ color: '#3fb950', fontSize: '14px', marginBottom: '12px' }}>
                  Active Identity
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={label}>Name</span>
                    <div style={{ color: '#e6edf3' }}>{currentIdentity.name}</div>
                  </div>
                  <div>
                    <span style={label}>Binary ID</span>
                    <div style={mono}>{toBinary(currentIdentity.binaryId)}</div>
                  </div>
                  <div>
                    <span style={label}>Tier</span>
                    <div style={{ color: '#d29922' }}>{ACCESS_TIERS[currentIdentity.tier].name}</div>
                  </div>
                  <div>
                    <span style={label}>Access Level ({currentIdentity.dimension === '3d' ? '3D Cube' : '2D Flat'})</span>
                    <div style={mono}>
                      {currentIdentity.dimension === '3d'
                        ? `8³ cube: ${currentIdentity.cubeLevel} (floor: ${EIGHT_CUBED})`
                        : `${formatBinary(currentIdentity.flatLevel)} = ${currentIdentity.flatLevel} (floor: ${EIGHT_SQUARED})`}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={label}>Key Fingerprint</span>
                    <div style={mono}>{currentIdentity.key.fingerprint}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={label}>Key Ceremony</span>
                    <div style={{ color: '#a371f7' }}>{currentIdentity.key.ceremony}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={label}>Description</span>
                    <div style={{ color: '#8b949e' }}>{ACCESS_TIERS[currentIdentity.tier].description}</div>
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div style={panel}>
                <h3 style={{ color: '#d29922', fontSize: '14px', marginBottom: '12px' }}>
                  Permissions
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ACCESS_TIERS[currentIdentity.tier].permissions.map(perm => (
                    <span key={perm} style={{
                      padding: '4px 10px',
                      background: '#0d2818',
                      color: '#3fb950',
                      border: '1px solid #238636',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}>
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Challenge-Response */}
              <div style={panel}>
                <h3 style={{ color: '#58a6ff', fontSize: '14px', marginBottom: '12px' }}>
                  Challenge-Response Authentication
                </h3>
                <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '12px' }}>
                  Prove your identity without revealing your key.
                </p>
                <button style={button('primary')} onClick={handleChallenge}>
                  Issue Challenge
                </button>
                {challenge && (
                  <div style={{ marginTop: '12px', fontSize: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={label}>Heaven Word:</span>
                      <span style={{ color: '#d29922' }}> {challenge.heavenWord}</span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={label}>Nonce:</span>
                      <span style={mono}> {Array.from(challenge.nonce.slice(0, 4)).map(b => toBinary(b)).join(' ')}</span>
                    </div>
                    {challengeResult && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: challengeResult.includes('PASSED') ? '#0d2818' : '#3d1214',
                        border: `1px solid ${challengeResult.includes('PASSED') ? '#238636' : '#da3633'}`,
                        borderRadius: '4px',
                        color: challengeResult.includes('PASSED') ? '#3fb950' : '#f85149',
                      }}>
                        {challengeResult}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Access Tier Reference */}
          <div style={panel}>
            <h3 style={{ color: '#8b949e', fontSize: '14px', marginBottom: '12px' }}>
              Access Tier Reference
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d' }}>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Binary</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Dec</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Tier</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(ACCESS_TIERS) as [TierName, typeof ACCESS_TIERS[TierName]][]).map(([key, tier]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '6px', ...mono }}>{formatBinary(tier.level)}</td>
                    <td style={{ padding: '6px', color: '#e6edf3' }}>{tier.level}</td>
                    <td style={{ padding: '6px', color: '#d29922' }}>{tier.name}</td>
                    <td style={{ padding: '6px', color: '#8b949e' }}>{tier.permissions.length} granted</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LAYER 2: INTEGRITY VERIFICATION ─────────────────────────── */}
      {activeTab === 'integrity' && (
        <div>
          <div style={panel}>
            <h3 style={{ color: '#d29922', fontSize: '14px', marginBottom: '12px' }}>
              Generate Integrity Proof
            </h3>
            <span style={label}>Data to protect</span>
            <textarea
              style={{ ...input, height: '80px', resize: 'vertical' }}
              value={integrityInput}
              onChange={e => setIntegrityInput(e.target.value)}
              placeholder="Enter message or data to generate proof for..."
            />
            <button style={button('primary')} onClick={handleGenerateProof}>
              Generate Proof
            </button>
          </div>

          {integrityProof && (
            <>
              <div style={{ ...panel, borderColor: '#d29922' }}>
                <h3 style={{ color: '#d29922', fontSize: '14px', marginBottom: '12px' }}>
                  Integrity Proof
                </h3>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={label}>Checksum</span>
                    <span style={mono}>{toBinary(integrityProof.checksum)} ({integrityProof.checksum})</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={label}>Heaven Signature</span>
                    <span style={{ ...mono, color: '#ff9800' }}>
                      {toBinary(integrityProof.heavenSignature).slice(0, 4)} ____
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={label}>Earth Signature</span>
                    <span style={{ ...mono, color: '#4caf50' }}>
                      ____ {toBinary(integrityProof.earthSignature).slice(4)}
                    </span>
                  </div>
                  <div>
                    <span style={label}>Chain ({integrityProof.chain.length} links)</span>
                    <div style={{ ...mono, wordBreak: 'break-all' }}>
                      {integrityProof.chain.map(link => toBinary(link)).join(' ')}
                    </div>
                  </div>
                </div>
              </div>

              <div style={panel}>
                <h3 style={{ color: '#d29922', fontSize: '14px', marginBottom: '12px' }}>
                  Verify Integrity
                </h3>
                <span style={label}>Data to verify (leave empty to verify original)</span>
                <textarea
                  style={{ ...input, height: '60px', resize: 'vertical' }}
                  value={verifyInput}
                  onChange={e => setVerifyInput(e.target.value)}
                  placeholder="Paste modified data to check if it matches the proof..."
                />
                <button style={button('primary')} onClick={handleVerifyProof}>
                  Verify
                </button>
                {verifyResult !== null && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px',
                    background: verifyResult ? '#0d2818' : '#3d1214',
                    border: `1px solid ${verifyResult ? '#238636' : '#da3633'}`,
                    borderRadius: '4px',
                    color: verifyResult ? '#3fb950' : '#f85149',
                    fontSize: '13px',
                  }}>
                    {verifyResult
                      ? 'VERIFIED — Data integrity confirmed. Heaven and Earth are aligned.'
                      : 'FAILED — Data has been tampered with. The chain is broken.'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── DENIAL REGISTRY — WARSHIPS, SLAVES, SLAVERS ─────────────── */}
      {activeTab === 'denial' && (
        <div>
          <div style={{ ...panel, borderColor: '#f85149' }}>
            <h3 style={{ color: '#f85149', fontSize: '14px', marginBottom: '8px' }}>
              Information Access Denial
            </h3>
            <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '16px' }}>
              No information access for warships, slaves, and slavers.
              Binary: <span style={mono}>0000 | 0000</span> — no heaven, no earth. Permanent.
            </p>

            <span style={label}>Screen an identity</span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                style={{ ...input, marginBottom: 0 }}
                value={screenInput}
                onChange={e => setScreenInput(e.target.value)}
                placeholder="Enter name or identifier to screen..."
              />
              <button style={button('danger')} onClick={handleScreen}>
                Screen
              </button>
            </div>

            {screenResult && (
              <div style={{
                padding: '10px',
                background: screenResult.denied ? '#3d1214' : '#0d2818',
                border: `1px solid ${screenResult.denied ? '#da3633' : '#238636'}`,
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '12px',
              }}>
                {screenResult.denied ? (
                  <div>
                    <span style={{ color: '#f85149', fontWeight: 'bold' }}>DENIED</span>
                    <span style={{ color: '#f85149' }}> — classified as: {screenResult.classification}</span>
                    <br/>
                    <span style={mono}>Binary level: 0000 | 0000 = 0</span>
                    <br/>
                    <span style={{ color: '#8b949e' }}>No information access. No upgrade path. Permanent.</span>
                  </div>
                ) : (
                  <span style={{ color: '#3fb950' }}>CLEAR — no denial classification found.</span>
                )}
              </div>
            )}
          </div>

          {/* Denied Classifications Reference */}
          <div style={panel}>
            <h3 style={{ color: '#f85149', fontSize: '14px', marginBottom: '12px' }}>
              Denied Classifications
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d' }}>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Classification</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Binary</th>
                  <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {DENIED_CLASSIFICATIONS.map(c => (
                  <tr key={c} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '6px', color: '#f85149' }}>{c}</td>
                    <td style={{ padding: '6px', ...mono, color: '#f85149' }}>0000 | 0000</td>
                    <td style={{ padding: '6px', color: '#da3633' }}>PERMANENT DENIAL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Denial Records */}
          {denialRecords.length > 0 && (
            <div style={{ ...panel, borderColor: '#da3633' }}>
              <h3 style={{ color: '#f85149', fontSize: '14px', marginBottom: '12px' }}>
                Denial Ledger ({denialRecords.length} entries)
              </h3>
              {denialRecords.map((r, i) => (
                <div key={i} style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: '#3d1214',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>
                  <span style={{ color: '#f85149', fontWeight: 'bold' }}>{r.identifier}</span>
                  <span style={{ color: '#8b949e' }}> — {r.classification} — </span>
                  <span style={{ color: '#da3633' }}>{r.reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Policy Statement */}
          <div style={{ ...panel, background: '#1a0000', borderColor: '#da3633', textAlign: 'center' }}>
            <pre style={{ color: '#f85149', fontSize: '11px', lineHeight: '1.6' }}>
{`
  ╔═════════════════════════════════════════════╗
  ║       ACCESS DENIAL POLICY                  ║
  ╠═════════════════════════════════════════════╣
  ║                                             ║
  ║  Warships:      0000 | 0000  DENIED         ║
  ║  Slavers:       0000 | 0000  DENIED         ║
  ║  Slave System:  0000 | 0000  DENIED         ║
  ║  Slave Trade:   0000 | 0000  DENIED         ║
  ║  Colonial:      0000 | 0000  DENIED         ║
  ║                                             ║
  ║  No bits. No heaven. No earth. No entry.    ║
  ║  The gate does not open for oppression.     ║
  ╚═════════════════════════════════════════════╝
`}
            </pre>
          </div>
        </div>
      )}

      {/* ── DEBT POLICY — DEBTS CLEANED BY THE WATERS ────────────────── */}
      {activeTab === 'debt' && (
        <div>
          <div style={panel}>
            <h3 style={{ color: '#58a6ff', fontSize: '14px', marginBottom: '8px' }}>
              Debt Policy — "Debts Are Cleaned by the Waters"
            </h3>
            <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '16px' }}>
              The Jubilee principle: debts do not persist forever. The waters flow from Ethiopia and Jamaica.
              What was owed returns to nothing.
            </p>

            {/* Add Debt */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <span style={label}>Debtor</span>
                <input style={input} value={debtDebtor} onChange={e => setDebtDebtor(e.target.value)} placeholder="Who owes..." />
              </div>
              <div>
                <span style={label}>Creditor</span>
                <input style={input} value={debtCreditor} onChange={e => setDebtCreditor(e.target.value)} placeholder="Owed to..." />
              </div>
              <div>
                <span style={label}>Amount</span>
                <input style={input} type="number" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <span style={label}>Currency</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setDebtCurrency('BTC')} style={{
                    flex: 1, padding: '8px', background: debtCurrency === 'BTC' ? '#21262d' : '#0d1117',
                    color: debtCurrency === 'BTC' ? '#d29922' : '#484f58', border: '1px solid #30363d',
                    borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
                  }}>BTC</button>
                  <button onClick={() => setDebtCurrency('ETH')} style={{
                    flex: 1, padding: '8px', background: debtCurrency === 'ETH' ? '#21262d' : '#0d1117',
                    color: debtCurrency === 'ETH' ? '#58a6ff' : '#484f58', border: '1px solid #30363d',
                    borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
                  }}>ETH</button>
                </div>
              </div>
            </div>
            <button style={button('primary')} onClick={handleAddDebt}>
              Record Debt
            </button>
          </div>

          {/* Waters Selection */}
          <div style={panel}>
            <h3 style={{ color: '#58a6ff', fontSize: '14px', marginBottom: '12px' }}>
              The Waters — Choose Your Cleansing
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(Object.entries(WATERS) as [WaterSource, typeof WATERS[WaterSource]][]).map(([key, water]) => (
                <button
                  key={key}
                  onClick={() => setSelectedWater(key)}
                  style={{
                    padding: '10px',
                    background: selectedWater === key ? '#0d2818' : '#161b22',
                    border: `1px solid ${selectedWater === key ? '#238636' : '#30363d'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ color: selectedWater === key ? '#58a6ff' : '#e6edf3', fontSize: '13px', fontFamily: 'monospace', marginBottom: '4px' }}>
                    {water.name}
                  </div>
                  <div style={{ color: '#8b949e', fontSize: '10px', fontFamily: 'monospace' }}>
                    Power: {water.power * 100}% — {water.origin === 'bridge' ? 'Bridge' : water.origin}
                  </div>
                  <div style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace', marginTop: '2px' }}>
                    {water.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Debts */}
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#d29922', fontSize: '14px' }}>
                Active Debts ({activeDebts.length})
              </h3>
              <div>
                <button style={button('primary')} onClick={handleJubilee}>
                  Baptismal Jubilee
                </button>
                <button style={button('secondary')} onClick={handleRainJubilee}>
                  Rain from Zion
                </button>
                <button style={{ ...button('secondary'), marginRight: 0 }} onClick={refreshDebts}>
                  Refresh
                </button>
              </div>
            </div>

            {activeDebts.length === 0 ? (
              <p style={{ color: '#3fb950', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                No active debts. The waters have done their work. All is clean.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Debtor</th>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Creditor</th>
                    <th style={{ padding: '6px', textAlign: 'right', color: '#8b949e' }}>Amount</th>
                    <th style={{ padding: '6px', textAlign: 'center', color: '#8b949e' }}>Clean</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDebts.map(debt => (
                    <tr key={debt.id} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '6px', color: '#f85149' }}>{debt.debtor}</td>
                      <td style={{ padding: '6px', color: '#e6edf3' }}>{debt.creditor}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#d29922', fontFamily: 'monospace' }}>
                        {debt.amount} {debt.currency}
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleCleanDebt(debt.id)}
                          style={{ padding: '3px 8px', background: '#0c2d6b', color: '#58a6ff', border: '1px solid #1f6feb', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '10px' }}
                        >
                          Wash with {WATERS[selectedWater].name}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Cleaned Debts — Record of Mercy */}
          {cleanedDebts.length > 0 && (
            <div style={{ ...panel, borderColor: '#238636' }}>
              <h3 style={{ color: '#3fb950', fontSize: '14px', marginBottom: '12px' }}>
                Cleaned by the Waters ({cleanedDebts.length})
              </h3>
              {cleanedDebts.map(debt => (
                <div key={debt.id} style={{
                  padding: '6px 10px',
                  marginBottom: '4px',
                  background: '#0d2818',
                  borderRadius: '4px',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#3fb950' }}>
                    {debt.debtor} → {debt.creditor}: {debt.currency} debt
                  </span>
                  <span style={{ color: '#58a6ff' }}>
                    Cleaned by {debt.cleanedBy}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Waters Policy */}
          <div style={{ ...panel, background: '#001529', borderColor: '#1f6feb', textAlign: 'center' }}>
            <pre style={{ color: '#58a6ff', fontSize: '11px', lineHeight: '1.6' }}>
{`
  ╔════════════════════════════════════════════════╗
  ║         DEBT POLICY — THE WATERS               ║
  ╠════════════════════════════════════════════════╣
  ║                                                ║
  ║  Blue Nile (Ethiopia):     25% per wash        ║
  ║  Tis Issat Falls:          50% per wash        ║
  ║  Dunn's River (Jamaica):   50% per wash        ║
  ║  Black River (Jamaica):    25% per wash        ║
  ║  Baptismal Waters:        100% — full Jubilee  ║
  ║  Rain from Zion:          100% — total wash    ║
  ║                                                ║
  ║  "Debts are cleaned by the waters."            ║
  ║  What was owed returns to nothing.             ║
  ║  Water is the universal solvent.               ║
  ╚════════════════════════════════════════════════╝
`}
            </pre>
          </div>
        </div>
      )}

      {/* ── LAYER 3: MESSAGE ENCRYPTION ─────────────────────────────── */}
      {activeTab === 'encrypt' && (
        <div>
          {!currentIdentity ? (
            <div style={{ ...panel, borderColor: '#da3633', textAlign: 'center' }}>
              <p style={{ color: '#f85149', fontSize: '14px' }}>
                Create an identity first (Layer 1) to use encryption.
              </p>
              <p style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>
                Encryption requires PROPHET tier or above.
              </p>
            </div>
          ) : (
            <>
              <div style={panel}>
                <h3 style={{ color: '#a371f7', fontSize: '14px', marginBottom: '12px' }}>
                  Encrypt Message
                </h3>
                <span style={label}>Plaintext</span>
                <textarea
                  style={{ ...input, height: '80px', resize: 'vertical' }}
                  value={plaintext}
                  onChange={e => setPlaintext(e.target.value)}
                  placeholder="Enter message to encrypt..."
                />
                <button style={button('primary')} onClick={handleEncrypt}>
                  Encrypt with {currentIdentity.key.ceremony}
                </button>
              </div>

              {encryptedMsg && (
                <>
                  <div style={{ ...panel, borderColor: '#a371f7' }}>
                    <h3 style={{ color: '#a371f7', fontSize: '14px', marginBottom: '12px' }}>
                      Encrypted Output
                    </h3>

                    {/* Ciphertext binary visualization */}
                    <div style={{
                      padding: '12px',
                      background: '#000',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      overflowX: 'auto',
                    }}>
                      <div style={{ ...mono, fontSize: '11px', wordBreak: 'break-all', lineHeight: '1.8' }}>
                        {Array.from(encryptedMsg.ciphertext).map((byte, i) => (
                          <span key={i} style={{
                            color: i % 2 === 0 ? '#a371f7' : '#8b5cf6',
                            marginRight: '4px',
                          }}>
                            {toBinary(byte)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>
                        <span style={label}>IV (Initialization Vector)</span>
                        <div style={mono}>
                          {Array.from(encryptedMsg.iv.slice(0, 4)).map(b => toBinary(b)).join(' ')}...
                        </div>
                      </div>
                      <div>
                        <span style={label}>Auth Tag</span>
                        <div style={mono}>
                          {Array.from(encryptedMsg.tag.slice(0, 4)).map(b => toBinary(b)).join(' ')}...
                        </div>
                      </div>
                      <div>
                        <span style={label}>Heaven Component</span>
                        <div style={{ ...mono, color: '#ff9800' }}>
                          {toBinary(encryptedMsg.heaven).slice(0, 4)} ____
                        </div>
                      </div>
                      <div>
                        <span style={label}>Earth Component</span>
                        <div style={{ ...mono, color: '#4caf50' }}>
                          ____ {toBinary(encryptedMsg.earth).slice(4)}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <button style={button('secondary')} onClick={handleDecrypt}>
                        Decrypt
                      </button>
                    </div>

                    {decryptedText !== null && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: decryptedText.startsWith('[') ? '#3d1214' : '#0d2818',
                        border: `1px solid ${decryptedText.startsWith('[') ? '#da3633' : '#238636'}`,
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: decryptedText.startsWith('[') ? '#f85149' : '#3fb950',
                      }}>
                        {decryptedText}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── AUDIT LOG ────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div>
          <div style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#8b949e', fontSize: '14px' }}>
                Binary Security Audit Log
              </h3>
              <button style={button('secondary')} onClick={refreshAudit}>
                Refresh
              </button>
            </div>

            {auditEntries.length === 0 ? (
              <p style={{ color: '#484f58', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                No security events recorded yet. Create an identity to begin.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Time</th>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Binary</th>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Event</th>
                    <th style={{ padding: '6px', textAlign: 'left', color: '#8b949e' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry, i) => {
                    const time = new Date(entry.timestamp).toLocaleTimeString()
                    const eventColor =
                      entry.event.includes('granted') || entry.event.includes('passed') || entry.event.includes('verified') ? '#3fb950' :
                      entry.event.includes('denied') || entry.event.includes('failed') ? '#f85149' :
                      entry.event.includes('encrypted') || entry.event.includes('decrypted') ? '#a371f7' :
                      '#d29922'

                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                        <td style={{ padding: '6px', color: '#8b949e' }}>{time}</td>
                        <td style={{ padding: '6px', ...mono }}>
                          {formatBinary(extractHeaven(ACCESS_TIERS[entry.tier].level) | extractEarth(ACCESS_TIERS[entry.tier].level))}
                        </td>
                        <td style={{ padding: '6px', color: eventColor }}>{entry.event}</td>
                        <td style={{ padding: '6px', color: '#8b949e' }}>{entry.detail}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Security Architecture Diagram */}
          <div style={{ ...panel, borderColor: '#30363d' }}>
            <h3 style={{ color: '#58a6ff', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
              Security Architecture
            </h3>
            <pre style={{ color: '#8b949e', fontSize: '11px', lineHeight: '1.6', textAlign: 'center' }}>
{`
  ┌──────────────────────────────────────────────┐
  │  LAYER 4 (HEAVEN): KEY CEREMONY             │ 1111 ____
  │  Key Generation & Derivation                 │
  ├──────────────────────────────────────────────┤
  │  LAYER 3 (HEAVEN): ENCRYPTION               │ 1010 ____
  │  S-Box Cipher + Heaven/Earth Swap            │
  ├──────────────────────────────────────────────┤
  │  LAYER 2 (EARTH): INTEGRITY                 │ ____ 1110
  │  Checksums, Proofs & Verification            │
  ├──────────────────────────────────────────────┤
  │  LAYER 1 (EARTH): IDENTITY                  │ ____ 1011
  │  Observer: 8²=64 flat / 8³=512 cube          │
  ├──────────────────────────────────────────────┤
  │  DENIAL REGISTRY                             │ 0000 0000
  │  Warships, Slavers, Slave System: NO ENTRY   │
  ├──────────────────────────────────────────────┤
  │  DEBT POLICY — THE WATERS                    │
  │  Blue Nile  25% │ Tis Issat  50%             │
  │  Dunn's Rvr 50% │ Black Rvr  25%            │
  │  Baptismal 100% │ Rain      100%             │
  └──────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────┐
  │      HEAVEN | EARTH = SECURITY               │
  │      1111   | 1111  = FULLNESS (255)          │
  │                                              │
  │  Observer floor:  8² = 64   (2D flat)        │
  │  Observer floor:  8³ = 512  (3D cube)        │
  │  King ceiling:    8³ x 8² = 32768            │
  │                                              │
  │  Denial:          0000 | 0000 = NOTHING      │
  │  Debts cleaned by the waters.                │
  │                                              │
  │  "The gate is narrow but the binary is wide."│
  └──────────────────────────────────────────────┘
`}
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '24px',
        paddingTop: '12px',
        borderTop: '1px solid #21262d',
        textAlign: 'center',
        fontSize: '11px',
        color: '#484f58',
      }}>
        <p>Binary Security System — CryptoChat</p>
        <p>4 Layers of Protection for Heaven on Earth</p>
      </footer>
    </div>
  )
}
