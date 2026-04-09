'use client'

import { useState, useTransition } from 'react'
import { addEventSlot, batchAddEventSlots } from '@/lib/actions'

type Props = {
    eventId: string
}

export default function AddSlotForm({ eventId }: Props) {
    const [mode, setMode] = useState<'single' | 'range'>('single')
    const [isPending, startTransition] = useTransition()

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                日程候補の追加
            </h3>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                <button
                    onClick={() => setMode('single')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: mode === 'single' ? 'white' : 'transparent',
                        color: mode === 'single' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: mode === 'single' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        boxShadow: mode === 'single' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    単発登録
                </button>
                <button
                    onClick={() => setMode('range')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: mode === 'range' ? 'white' : 'transparent',
                        color: mode === 'range' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: mode === 'range' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        boxShadow: mode === 'range' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    期間・一括登録
                </button>
            </div>

            {mode === 'single' ? (
                <form action={formData => startTransition(async () => await addEventSlot(eventId, formData))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem' }}>日付</label>
                        <input type="date" name="date" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>開始時間</label>
                            <input type="time" name="startTime" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>終了時間</label>
                            <input type="time" name="endTime" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                    </div>
                    <button type="submit" disabled={isPending} className="btn btn-secondary" style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
                        {isPending ? '追加中...' : '追加する'}
                    </button>
                </form>
            ) : (
                <form action={formData => startTransition(async () => await batchAddEventSlots(eventId, formData))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>開始日</label>
                            <input type="date" name="startDate" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>終了日</label>
                            <input type="date" name="endDate" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>開始時間</label>
                            <input type="time" name="startTime" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>終了時間</label>
                            <input type="time" name="endTime" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        ※開始日から終了日までの全日程に、上記時間帯の候補を一括で作成します。
                    </p>
                    <button type="submit" disabled={isPending} className="btn btn-secondary" style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
                        {isPending ? '一括追加中...' : '一括追加する'}
                    </button>
                </form>
            )}
        </div>
    )
}
