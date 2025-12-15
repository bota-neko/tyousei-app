'use client'

import { useState } from 'react'
import { submitVote } from '@/lib/actions'
import { formatDate, formatTime } from '@/lib/utils'

type Slot = {
    id: string
    start: Date
    end: Date
}

type Props = {
    eventId: string
    participantToken: string
    slots: Slot[]
    initialVotes: Record<string, string>
    initialMemo: string | null
}

export default function VoteForm({ eventId, participantToken, slots, initialVotes, initialMemo }: Props) {
    const [votes, setVotes] = useState<Record<string, string>>(initialVotes)
    const [memo, setMemo] = useState(initialMemo || '')
    const [submitted, setSubmitted] = useState(false)

    const handleVoteChange = (slotId: string, value: string) => {
        setVotes(prev => ({
            ...prev,
            [slotId]: value
        }))
    }

    const handleSubmit = async (formData: FormData) => {
        await submitVote(participantToken, eventId, formData)
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (submitted) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>回答を送信しました</h2>
                <p>ご協力ありがとうございます。</p>
                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="btn btn-secondary"
                    >
                        回答を修正する
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form action={handleSubmit}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>出欠回答</h2>
                {slots.map(slot => (
                    <div key={slot.id} style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ minWidth: '150px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatDate(slot.start)}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{formatTime(slot.start)} - {formatTime(slot.end)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['yes', 'maybe', 'no'].map(option => {
                                const isSelected = votes[slot.id] === option
                                const labels = { yes: '◯ 出席', maybe: '△ 未定', no: '× 欠席' }
                                const colors = { yes: 'var(--success)', maybe: 'var(--warning)', no: 'var(--danger)' }

                                return (
                                    <label key={option} style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: isSelected ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        border: `1px solid ${isSelected ? (colors as any)[option] : 'rgba(0,0,0,0.1)'}`,
                                        color: isSelected ? (colors as any)[option] : 'var(--text-muted)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <input
                                            type="radio"
                                            name={`vote_${slot.id}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={() => handleVoteChange(slot.id, option)}
                                            required
                                            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                                        />
                                        {labels[option as keyof typeof labels]}
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '2rem' }}>
                    <label>コメント / メモ</label>
                    <textarea
                        name="comment"
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
                        placeholder="アレルギーや連絡事項など..."
                        rows={3}
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                回答を送信
            </button>
        </form>
    )
}
