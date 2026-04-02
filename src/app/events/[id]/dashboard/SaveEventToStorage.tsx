'use client'

import { useEffect } from 'react'

type Props = {
    eventId: string
    title: string
    status: string
}

export default function SaveEventToStorage({ eventId, title, status }: Props) {
    useEffect(() => {
        try {
            const key = 'tyousei_my_events'
            const stored = localStorage.getItem(key)
            const events: Record<string, { title: string; status: string; updatedAt: string }> = stored ? JSON.parse(stored) : {}

            events[eventId] = {
                title,
                status,
                updatedAt: new Date().toISOString()
            }

            localStorage.setItem(key, JSON.stringify(events))
        } catch {
            // localStorage unavailable
        }
    }, [eventId, title, status])

    return null
}
