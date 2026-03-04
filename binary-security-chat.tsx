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
  type TierName,
  type Permission,
  type Identity,
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

type SecurityTab = 'identity' | 'encrypt' | 'integrity' | 'audit'

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

  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeResult, setChallengeResult] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<SecurityTab>('identity')
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])

  const refreshAudit = useCallback(() => {
    setAuditEntries(security.auditLog.getEntries())
  }, [])

  // ── Identity Actions ──────────────────────────────────────────────────

  const handleCreateIdentity = () => {
    if (!identityName.trim() || !passphrase.trim()) return
    const identity = security.createIdentity(identityName, passphrase, selectedTier)
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
          { key: 'integrity' as SecurityTab, label: 'L2: Integrity', color: '#d29922' },
          { key: 'encrypt' as SecurityTab, label: 'L3: Encrypt', color: '#a371f7' },
          { key: 'audit' as SecurityTab, label: 'Audit Log', color: '#8b949e' },
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
                    <span style={label}>Access Level</span>
                    <div style={mono}>{formatBinary(ACCESS_TIERS[currentIdentity.tier].level)}</div>
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
  ┌─────────────────────────────────────┐
  │  LAYER 4 (HEAVEN): KEY CEREMONY    │  1111 ____
  │  Key Generation & Derivation        │
  ├─────────────────────────────────────┤
  │  LAYER 3 (HEAVEN): ENCRYPTION      │  1010 ____
  │  S-Box Cipher + Heaven/Earth Swap   │
  ├─────────────────────────────────────┤
  │  LAYER 2 (EARTH): INTEGRITY        │  ____ 1110
  │  Checksums, Proofs & Verification   │
  ├─────────────────────────────────────┤
  │  LAYER 1 (EARTH): IDENTITY         │  ____ 1011
  │  Access Tiers & Challenge-Response  │
  └─────────────────────────────────────┘

  ┌───────────────────────────────────┐
  │     HEAVEN | EARTH = SECURITY     │
  │     1111   | 1111  = FULLNESS     │
  │                                   │
  │  "The gate is narrow but the      │
  │   binary is wide."                │
  └───────────────────────────────────┘
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
