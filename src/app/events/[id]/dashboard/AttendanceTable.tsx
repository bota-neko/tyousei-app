'use client'

import { formatDate, formatTime } from '@/lib/utils'
import { confirmEvent, deleteEventSlot } from '@/lib/actions'
import { useTransition } from 'react'

type Slot = {
    id: string
    start: Date | string
    end: Date | string
    status: string
    votes: { response: string }[]
}

type Props = {
    eventId: string
    slots: Slot[]
    eventStatus: string
}

export default function AttendanceTable({ eventId, slots, eventStatus }: Props) {
    const [isPending, startTransition] = useTransition()

    const isDraft = eventStatus === 'draft'
    const isPolling = eventStatus === 'polling'
    const isFinalized = eventStatus === 'finalized'

    if (slots.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ marginBottom: '1rem' }}>日程候補が設定されていません。</p>
                {isDraft && <p style={{ fontSize: '0.9rem' }}>「日程追加」フォームから候補を追加してください</p>}
            </div>
        )
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>日時</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}>◯</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}>△</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}>×</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', width: '100px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {slots.map(slot => {
                        const counts = slot.votes.reduce((acc, v) => {
                            acc[v.response] = (acc[v.response] || 0) + 1
                            return acc
                        }, { yes: 0, maybe: 0, no: 0 } as Record<string, number>)

                        const isConfirmed = slot.status === 'confirmed'

                        return (
                            <tr key={slot.id} style={{
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                background: isConfirmed ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
                            }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '600' }}>{formatDate(slot.start)}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        {formatTime(slot.start)} - {formatTime(slot.end)}
                                    </div>
                                    {isConfirmed && <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-block', border: '1px solid var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>★ 開催決定</div>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{counts.yes > 0 ? counts.yes : <span style={{ color: '#eee' }}>-</span>}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{counts.maybe > 0 ? counts.maybe : <span style={{ color: '#eee' }}>-</span>}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)' }}>{counts.no > 0 ? counts.no : <span style={{ color: '#eee' }}>-</span>}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {isPolling && !isFinalized && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <form action={() => startTransition(async () => await confirmEvent(eventId, slot.id))}>
                                                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                    決定
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                    {isDraft && (
                                        <form action={() => startTransition(async () => await deleteEventSlot(slot.id, eventId))}>
                                            <button type="submit" disabled={isPending} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' }}>削除</button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
