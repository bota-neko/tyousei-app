import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ReceptionClient from './ReceptionClient'

export default async function ReceptionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            participants: {
                orderBy: { nickname: 'asc' },
                include: { votes: true }
            }
        }
    })

    if (!event) notFound()

    return <ReceptionClient eventId={event.id} participants={event.participants} eventTitle={event.title} />
}
