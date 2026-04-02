'use client'

import { deleteEvent } from '@/lib/actions'

type Props = {
    eventId: string
    label?: string
}

export default function DeleteEventButton({ eventId, label = 'イベントを削除' }: Props) {
    const handleDelete = async () => {
        if (!confirm('本当にこのイベントを削除しますか？\nこの操作は取り消せません。')) return

        // Remove from localStorage
        try {
            const key = 'tyousei_my_events'
            const stored = localStorage.getItem(key)
            if (stored) {
                const events = JSON.parse(stored)
                delete events[eventId]
                localStorage.setItem(key, JSON.stringify(events))
            }
        } catch { /* ignore */ }

        await deleteEvent(eventId)
    }

    return (
        <form action={handleDelete}>
            <button
                type="submit"
                style={{
                    width: '100%',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    background: 'none',
                    border: '1px solid var(--danger, #e53e3e)',
                    color: 'var(--danger, #e53e3e)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--danger, #e53e3e)'
                    e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = 'var(--danger, #e53e3e)'
                }}
            >
                {label}
            </button>
        </form>
    )
}
