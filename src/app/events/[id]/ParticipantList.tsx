'use client'

import { formatDate, formatTime } from '@/lib/utils'

type Slot = {
    id: string
    start: Date
    end: Date
}

type Participant = {
    id: string
    nickname: string
    votes: { slotId: string, response: string }[]
    memo?: string | null
}

type Props = {
    slots: Slot[]
    participants: Participant[]
    currentParticipantId?: string | null
    confirmedSlotId?: string
}

export default function ParticipantList({ slots, participants, currentParticipantId, confirmedSlotId }: Props) {
    if (confirmedSlotId) {
        const yesParticipants = participants.filter(p => p.votes.find(v => v.slotId === confirmedSlotId)?.response === 'yes')
        const maybeParticipants = participants.filter(p => p.votes.find(v => v.slotId === confirmedSlotId)?.response === 'maybe')

        return (
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>参加予定のメンバー</h2>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🙆‍♂️</span> 参加 ({yesParticipants.length})
                    </h3>
                    {yesParticipants.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {yesParticipants.map(p => (
                                <li key={p.id} style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #eee', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '500' }}>{p.nickname}</span>
                                    {p.id === currentParticipantId && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                                    {p.memo && <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderLeft: '1px solid #eee', paddingLeft: '0.5rem' }}>{p.memo}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>参加表明はまだありません</p>}
                </div>

                {maybeParticipants.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🤔</span> 未定・調整中 ({maybeParticipants.length})
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {maybeParticipants.map(p => (
                                <li key={p.id} style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #eee', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                    <span>{p.nickname}</span>
                                    {p.id === currentParticipantId && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                                    {p.memo && <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderLeft: '1px solid #eee', paddingLeft: '0.5rem' }}>{p.memo}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>みんなの出欠状況</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>参加者</th>
                        {slots.map(slot => (
                            <th key={slot.id} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #ddd', minWidth: '80px' }}>
                                <div style={{ fontSize: '0.8rem' }}>{formatDate(slot.start)}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(slot.start)}</div>
                            </th>
                        ))}
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>コメント</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map(p => {
                        const isMe = p.id === currentParticipantId
                        return (
                            <tr key={p.id} style={{ background: isMe ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', fontWeight: isMe ? 'bold' : 'normal' }}>
                                    {p.nickname} {isMe && '(あなた)'}
                                </td>
                                {slots.map(slot => {
                                    const vote = p.votes.find(v => v.slotId === slot.id)?.response
                                    const symbols = { yes: '◯', maybe: '△', no: '×' }
                                    const colors = { yes: 'var(--success)', maybe: 'var(--warning)', no: 'var(--danger)' }

                                    return (
                                        <td key={slot.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                            {vote && (
                                                <span style={{
                                                    color: (colors as any)[vote],
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {(symbols as any)[vote]}
                                                </span>
                                            )}
                                        </td>
                                    )
                                })}
                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {p.memo}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
