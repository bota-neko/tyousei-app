'use client'

import { formatTime } from '@/lib/utils'

type Slot = {
    id: string
    start: Date | string
}

type Participant = {
    id: string
    nickname: string
    memo: string | null
    votes: { slotId: string; response: string }[]
}

type Props = {
    slots: Slot[]
    participants: Participant[]
}

export default function ParticipantsDetail({ slots, participants }: Props) {
    return (
        <div style={{ overflowX: 'auto' }}>
            {participants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>まだ回答がありません。</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%', whiteSpace: 'nowrap' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', zIndex: 1 }}>名前</th>
                            {slots.map(slot => (
                                <th key={slot.id} style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', minWidth: '60px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                            {new Date(slot.start).getMonth() + 1}/{new Date(slot.start).getDate()}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            ({new Date(slot.start).toLocaleDateString('ja-JP', { weekday: 'short' })})
                                        </span>
                                        <span style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                            {formatTime(slot.start)}
                                        </span>
                                    </div>
                                </th>
                            ))}
                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>コメント</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', zIndex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                                    {p.nickname}
                                </td>
                                {slots.map(slot => {
                                    const vote = p.votes.find(v => v.slotId === slot.id)
                                    let label = '-'
                                    let color = 'var(--text-dim)'
                                    if (vote) {
                                        if (vote.response === 'yes') { label = '◯'; color = 'var(--primary)'; }
                                        else if (vote.response === 'maybe') { label = '△'; color = 'var(--warning)'; }
                                        else if (vote.response === 'no') { label = '×'; color = 'var(--text-dim)'; }
                                    }
                                    return (
                                        <td key={slot.id} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: color, fontWeight: 'bold' }}>
                                            {label}
                                        </td>
                                    )
                                })}
                                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.memo || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
