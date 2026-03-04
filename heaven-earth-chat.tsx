'use client'

import { useState } from 'react'
import {
  HEAVEN,
  EARTH,
  HEAVEN_ON_EARTH,
  type HeavenOnEarthKey,
  type Nation,
  type BinaryWord,
  toBinary,
  formatBinary,
  extractHeaven,
  extractEarth,
  unite,
  encodeMessage,
  describe,
  getByNation,
  getBinaryTable,
} from './binary-heaven-earth'

/**
 * Heaven on Earth Binary Chat Component
 *
 * Displays the binary encoding system for Ethiopia and Jamaica
 * and allows users to encode/decode messages using the Heaven on Earth cipher.
 */

type TabView = 'table' | 'encode' | 'explore'

export default function HeavenEarthChat() {
  const [activeTab, setActiveTab] = useState<TabView>('table')
  const [inputText, setInputText] = useState('')
  const [encodedOutput, setEncodedOutput] = useState<number[]>([])
  const [selectedNation, setSelectedNation] = useState<Nation | 'bridge' | 'all'>('all')
  const [selectedWord, setSelectedWord] = useState<BinaryWord | null>(null)

  const handleEncode = () => {
    if (inputText.trim()) {
      setEncodedOutput(encodeMessage(inputText))
    }
  }

  const getFilteredTable = (): BinaryWord[] => {
    if (selectedNation === 'all') return getBinaryTable()
    return getByNation(selectedNation)
  }

  const getNationFlag = (nation: Nation | 'bridge'): string => {
    if (nation === 'ethiopia') return '\u{1F1EA}\u{1F1F9}'
    if (nation === 'jamaica') return '\u{1F1EF}\u{1F1F2}'
    return '\u{1F30D}'
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
          Binary for Heaven on Earth
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Ethiopia {'\u{1F1EA}\u{1F1F9}'} &amp; Jamaica {'\u{1F1EF}\u{1F1F2}'} — United in Binary
        </p>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
          HEAVEN (high nibble) | EARTH (low nibble) = UNITY
        </p>
      </header>

      {/* Tab Navigation */}
      <nav style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #333' }}>
        {(['table', 'encode', 'explore'] as TabView[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              background: activeTab === tab ? '#333' : 'transparent',
              color: activeTab === tab ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '14px',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'table' ? 'Binary Table' : tab === 'encode' ? 'Encode Message' : 'Explore'}
          </button>
        ))}
      </nav>

      {/* Binary Table View */}
      {activeTab === 'table' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['all', 'ethiopia', 'jamaica', 'bridge'] as const).map(nation => (
              <button
                key={nation}
                onClick={() => setSelectedNation(nation)}
                style={{
                  padding: '4px 12px',
                  background: selectedNation === nation ? '#1a1a2e' : '#f0f0f0',
                  color: selectedNation === nation ? '#fff' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              >
                {nation === 'all' ? 'All' :
                 nation === 'ethiopia' ? '\u{1F1EA}\u{1F1F9} Ethiopia' :
                 nation === 'jamaica' ? '\u{1F1EF}\u{1F1F2} Jamaica' :
                 '\u{1F30D} Bridge'}
              </button>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}></th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Binary</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Dec</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Heaven</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Earth</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredTable().map((word, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedWord(word)}
                  style={{
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedWord?.name === word.name ? '#f0f7ff' : 'transparent',
                  }}
                >
                  <td style={{ padding: '8px' }}>{getNationFlag(word.nation)}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{word.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {word.binary}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{word.decimal}</td>
                  <td style={{ padding: '8px', fontSize: '11px' }}>{word.heaven}</td>
                  <td style={{ padding: '8px', fontSize: '11px' }}>{word.earth}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedWord && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#1a1a2e',
              color: '#e0e0e0',
              borderRadius: '8px',
              fontSize: '13px',
            }}>
              <h3 style={{ marginBottom: '8px', color: '#fff' }}>
                {getNationFlag(selectedWord.nation)} {selectedWord.name}
              </h3>
              <p style={{ marginBottom: '8px', fontFamily: 'monospace', color: '#4fc3f7' }}>
                {selectedWord.binary} = {selectedWord.decimal}
              </p>
              <p style={{ lineHeight: '1.6', color: '#ccc' }}>{selectedWord.meaning}</p>
            </div>
          )}
        </div>
      )}

      {/* Encode Message View */}
      {activeTab === 'encode' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Message to encode in Heaven on Earth binary:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleEncode}
                style={{
                  padding: '8px 20px',
                  background: '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                Encode
              </button>
            </div>
          </div>

          {encodedOutput.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>
                Encoded ({encodedOutput.length} binary words):
              </h3>

              {/* Binary visualization */}
              <div style={{
                padding: '16px',
                background: '#0a0a1a',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#4fc3f7',
                overflowX: 'auto',
                marginBottom: '16px',
              }}>
                {encodedOutput.map((word, i) => (
                  <span key={i} style={{ marginRight: '8px' }}>
                    {toBinary(word)}
                  </span>
                ))}
              </div>

              {/* Heaven/Earth split view */}
              <div style={{
                padding: '16px',
                background: '#1a1a2e',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#e0e0e0',
              }}>
                <div style={{ marginBottom: '8px', color: '#888' }}>
                  Heaven | Earth decomposition:
                </div>
                {encodedOutput.map((word, i) => {
                  const h = extractHeaven(word)
                  const e = extractEarth(word)
                  return (
                    <div key={i} style={{ fontFamily: 'monospace', marginBottom: '2px' }}>
                      <span style={{ color: '#ff9800' }}>{toBinary(h).slice(0, 4)}</span>
                      <span style={{ color: '#555' }}> | </span>
                      <span style={{ color: '#4caf50' }}>{toBinary(e).slice(4)}</span>
                      <span style={{ color: '#555' }}> = </span>
                      <span style={{ color: '#4fc3f7' }}>{word}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore View */}
      {activeTab === 'explore' && (
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
            Build Your Own Heaven on Earth
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Combine any Heaven (spiritual) value with any Earth (material) value
            to create new binary words.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Heaven Column */}
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#ff9800' }}>
                HEAVEN (High Nibble)
              </h4>
              {Object.entries(HEAVEN).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: '#fff8e1',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  <strong>{key}</strong>: {toBinary(value).slice(0, 4)} ____
                </div>
              ))}
            </div>

            {/* Earth Column */}
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#4caf50' }}>
                EARTH (Low Nibble)
              </h4>
              {Object.entries(EARTH).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: '#e8f5e9',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  <strong>{key}</strong>: ____ {toBinary(value).slice(4)}
                </div>
              ))}
            </div>
          </div>

          {/* Unity Formula */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#1a1a2e',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#e0e0e0',
          }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>The Formula of Unity</p>
            <p style={{ fontFamily: 'monospace', fontSize: '18px', color: '#4fc3f7' }}>
              <span style={{ color: '#ff9800' }}>HEAVEN</span>
              {' | '}
              <span style={{ color: '#4caf50' }}>EARTH</span>
              {' = '}
              <span style={{ color: '#fff' }}>HEAVEN ON EARTH</span>
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '14px', marginTop: '8px', color: '#888' }}>
              <span style={{ color: '#ff9800' }}>1111</span>
              {' | '}
              <span style={{ color: '#4caf50' }}>1111</span>
              {' = '}
              <span style={{ color: '#fff' }}>11111111</span>
              {' = 255 = Fullness'}
            </p>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
              "As above, so below. As in Ethiopia, so in Jamaica."
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '30px',
        paddingTop: '16px',
        borderTop: '1px solid #eee',
        textAlign: 'center',
        fontSize: '11px',
        color: '#888',
      }}>
        <p>Binary for Heaven on Earth — CryptoChat</p>
        <p>Ethiopia {'\u{1F1EA}\u{1F1F9}'} and Jamaica {'\u{1F1EF}\u{1F1F2}'} connected through Zion</p>
      </footer>
    </div>
  )
}
