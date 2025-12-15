import { prisma } from '@/lib/db'
import { stringify } from 'csv-stringify/sync'
import { formatDate, formatTime } from '@/lib/utils'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            slots: { orderBy: { start: 'asc' } },
            participants: {
                include: { votes: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!event) {
        return new Response('Not Found', { status: 404 })
    }

    // Header
    const headers = [
        'ID', 'お名前', 'ステータス', 'チェックイン時刻', 'メモ',
        ...event.slots.map(s => `${formatDate(s.start)} ${formatTime(s.start)}`)
    ]

    // Rows
    const rows = event.participants.map(p => {
        const voteMap = p.votes.reduce((acc, v) => ({ ...acc, [v.slotId]: v.response }), {} as Record<string, string>)

        const slotVotes = event.slots.map(s => {
            const v = voteMap[s.id]
            if (v === 'yes') return '◯'
            if (v === 'maybe') return '△'
            if (v === 'no') return '×'
            return '-'
        })

        return [
            p.id,
            p.nickname,
            p.status,
            p.checkedInAt ? p.checkedInAt.toISOString() : '',
            p.memo || '',
            ...slotVotes
        ]
    })

    const csv = stringify([headers, ...rows])

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="participants-${event.id}.csv"`
        }
    })
}
