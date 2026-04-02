'use client'

import { useEffect, useState } from 'react'

type EventEntry = {
    id: string
    title: string
    status: string
    updatedAt: string
}

const statusLabels: Record<string, string> = {
    draft: '作成中',
    polling: '募集中',
    finalized: '決定済み',
    live: '開催中',
    closed: '終了',
}

const statusColors: Record<string, string> = {
    draft: 'var(--warning)',
    polling: 'var(--success)',
    finalized: 'var(--primary)',
    live: 'var(--primary)',
    closed: 'var(--text-muted)',
}

export default function MyEventList() {
    const [events, setEvents] = useState<EventEntry[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem('tyousei_my_events')
            if (!stored) return

            const parsed: Record<string, { title: string; status: string; updatedAt: string }> = JSON.parse(stored)
            const list = Object.entries(parsed)
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

            setEvents(list)
        } catch {
            // ignore
        }
    }, [])

    if (events.length === 0) return null

    return (
        <div style={{ marginTop: '3rem', maxWidth: '500px', width: '100%', margin: '3rem auto 0', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> 作成したイベント
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {events.map(ev => (
                    <a
                        key={ev.id}
                        href={`/events/${ev.id}/dashboard`}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.85rem 1rem',
                            background: 'white',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--primary)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                    >
                        <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{ev.title}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            background: statusColors[ev.status] || 'var(--text-muted)',
                            color: 'white',
                            whiteSpace: 'nowrap',
                        }}>
                            {statusLabels[ev.status] || ev.status}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    )
}
