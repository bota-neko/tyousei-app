'use client'

import { useState, useEffect } from 'react'

export default function CopyLinkButton({ path }: { path: string }) {
    const [copied, setCopied] = useState(false)
    const [fullUrl, setFullUrl] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFullUrl(`${window.location.origin}${path}`)
        }
    }, [path])

    const handleCopy = () => {
        if (!fullUrl) return
        navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>参加者への案内URL</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <input
                    readOnly
                    value={fullUrl}
                    placeholder="URLを生成中..."
                    style={{ flex: 1, padding: '0.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', color: '#666', fontFamily: 'monospace' }}
                    onFocus={(e) => e.target.select()}
                />
                <button
                    type="button"
                    onClick={handleCopy}
                    className="btn"
                    disabled={!fullUrl}
                    style={{
                        background: copied ? 'var(--success)' : '#333',
                        color: 'white',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        fontSize: '0.9rem',
                        padding: '0.5rem 1rem',
                        opacity: fullUrl ? 1 : 0.5,
                        cursor: fullUrl ? 'pointer' : 'not-allowed'
                    }}
                >
                    {copied ? 'コピー完了' : 'コピー'}
                </button>
            </div>
            {fullUrl && (
                <div style={{ textAlign: 'right', marginTop: '0.3rem' }}>
                    <a href={fullUrl} target="_blank" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                        ページを確認する ↗
                    </a>
                </div>
            )}
        </div>
    )
}
