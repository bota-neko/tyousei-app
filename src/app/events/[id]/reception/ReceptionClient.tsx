'use client'

import { useState } from 'react'
import { togglePaymentStatus, toggleCheckInStatus } from '@/lib/actions'
import { formatDate, formatTime } from '@/lib/utils'

type Participant = {
    id: string
    nickname: string
    token: string
    checkInCode?: string | null
    isPaid: boolean
    checkedInAt: Date | null
    memo?: string | null
    votes: any[]
}

type Props = {
    eventId: string
    participants: Participant[]
    eventTitle: string
}

export default function ReceptionClient({ eventId, participants, eventTitle }: Props) {
    const [filter, setFilter] = useState('')

    const filtered = participants.filter(p =>
        p.nickname.toLowerCase().includes(filter.toLowerCase()) ||
        (p.checkInCode && p.checkInCode.includes(filter)) ||
        p.token.includes(filter)
    )

    // Calculate stats
    const total = participants.length
    const checkedInCount = participants.filter(p => p.checkedInAt).length
    const paidCount = participants.filter(p => p.isPaid).length

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>受付管理</h1>
                <p style={{ color: 'var(--text-muted)' }}>{eventTitle}</p>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>チェックイン済み</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {checkedInCount} <span style={{ fontSize: '1rem', color: '#666' }}>/ {total}</span>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>支払い済み</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        {paidCount} <span style={{ fontSize: '1rem', color: '#666' }}>/ {total}</span>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="search"
                        placeholder="名前 または コードで検索..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(p => (
                        <div key={p.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: p.checkedInAt ? 'rgba(0,0,0,0.02)' : 'white',
                            border: '1px solid #eee',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{p.nickname}</div>
                                {p.memo && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.memo}</div>}
                                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.2rem' }}>
                                    Code: <span style={{ fontFamily: 'monospace' }}>{p.checkInCode || p.token.substr(0, 6).toUpperCase()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {/* Check-in Toggle */}
                                <div style={{ textAlign: 'center' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>受付</label>
                                    <input
                                        type="checkbox"
                                        checked={!!p.checkedInAt}
                                        onChange={(e) => toggleCheckInStatus(p.id, e.target.checked, eventId)}
                                        style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                    />
                                </div>

                                {/* Payment Toggle */}
                                <div style={{ textAlign: 'center', borderLeft: '1px solid #eee', paddingLeft: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>支払い</label>
                                    <input
                                        type="checkbox"
                                        checked={p.isPaid}
                                        onChange={(e) => togglePaymentStatus(p.id, e.target.checked, eventId)}
                                        style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>該当する参加者がいません</p>
                    )}
                </div>
            </div>
        </div>
    )
}
