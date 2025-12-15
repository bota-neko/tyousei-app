'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const fee = formData.get('fee') as string

    if (!title) {
        throw new Error('Title is required')
    }

    // Generate a random organizer ID for now (simulating session)
    // In a real app, this would come from auth
    const organizerId = 'org_' + Math.random().toString(36).substr(2, 9)

    const event = await prisma.event.create({
        data: {
            title,
            description,
            location,
            fee,
            organizerId,
            // Default settings
            participationMode: 'normal',
            receptionType: 'qr',
            status: 'draft',
        },
    })

    redirect(`/events/${event.id}/dashboard`)
}

export async function addEventSlot(eventId: string, formData: FormData) {
    const startStr = formData.get('start') as string
    const endStr = formData.get('end') as string

    // Simple validation
    if (!startStr || !endStr) return

    const start = new Date(startStr)
    const end = new Date(endStr)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        // Invalid date format
        return
    }

    await prisma.eventSlot.create({
        data: {
            eventId,
            start,
            end,
            status: 'candidate',
        }
    })

    revalidatePath(`/events/${eventId}/dashboard`)
}

export async function deleteEventSlot(slotId: string, eventId: string) {
    await prisma.eventSlot.delete({
        where: { id: slotId }
    })
    revalidatePath(`/events/${eventId}/dashboard`)
}

export async function updateEventStatus(eventId: string, status: string, formData?: FormData) {
    const data: any = { status }
    if (formData) {
        const location = formData.get('location') as string
        const address = formData.get('address') as string
        const siteUrl = formData.get('siteUrl') as string
        const fee = formData.get('fee') as string

        if (location !== null) data.location = location
        if (address !== null) data.address = address
        if (siteUrl !== null) data.siteUrl = siteUrl
        if (fee !== null) data.fee = fee
    }

    await prisma.event.update({
        where: { id: eventId },
        data
    })
    revalidatePath(`/events/${eventId}/dashboard`)
    redirect(`/events/${eventId}/dashboard?updated=true`)
}

export async function togglePaymentStatus(participantId: string, isPaid: boolean, eventId: string) {
    await prisma.participant.update({
        where: { id: participantId },
        data: { isPaid }
    })
    revalidatePath(`/events/${eventId}/dashboard`)
    revalidatePath(`/events/${eventId}/reception`)
}

export async function toggleCheckInStatus(participantId: string, isCheckedIn: boolean, eventId: string) {
    await prisma.participant.update({
        where: { id: participantId },
        data: { checkedInAt: isCheckedIn ? new Date() : null }
    })
    revalidatePath(`/events/${eventId}/reception`)
    revalidatePath(`/events/${eventId}/dashboard`)
}

// Participant Actions

export async function joinEvent(eventId: string, formData: FormData) {
    const nickname = formData.get('nickname') as string
    if (!nickname) return

    const token = Math.random().toString(36).substr(2, 10) + Math.random().toString(36).substr(2, 10)

    // Check event status
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { slots: true }
    })

    if (!event) throw new Error('Event not found')

    const participant = await prisma.participant.create({
        data: {
            eventId,
            nickname,
            token,
            status: 'polled'
        }
    })

    // If event is finalized, auto-vote Yes for confirmed slot
    if (event.status === 'finalized' || event.status === 'live') {
        const confirmedSlot = event.slots.find(s => s.status === 'confirmed')
        if (confirmedSlot) {
            await prisma.vote.create({
                data: {
                    participantId: participant.id,
                    slotId: confirmedSlot.id,
                    response: 'yes'
                }
            })
        }
    }

    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/dashboard`)

    // Redirect to unique URL
    redirect(`/events/${eventId}?t=${token}`)
}

export async function submitVote(participantToken: string, eventId: string, formData: FormData) {
    const participant = await prisma.participant.findUnique({
        where: { token: participantToken }
    })

    if (!participant) throw new Error('Invalid token')

    // Iterate over all keys in formData to find votes
    // Format: vote_{slotId} = yes/maybe/no
    // Format: comment = string

    const entries = Array.from(formData.entries())
    const comment = formData.get('comment') as string

    // Update participant comment
    if (comment !== null) {
        await prisma.participant.update({
            where: { id: participant.id },
            data: { memo: comment }
        })
    }

    const votePromises = entries
        .filter(([key]) => key.startsWith('vote_'))
        .map(async ([key, value]) => {
            const slotId = key.replace('vote_', '')
            const response = value as string

            return prisma.vote.upsert({
                where: {
                    participantId_slotId: {
                        participantId: participant.id,
                        slotId
                    }
                },
                create: {
                    participantId: participant.id,
                    slotId,
                    response
                },
                update: {
                    response
                }
            })
        })

    await Promise.all(votePromises)
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/dashboard`)
}

export async function confirmEvent(eventId: string, slotId: string) {
    // 1. Set Event to Finalized
    await prisma.event.update({
        where: { id: eventId },
        data: { status: 'finalized' }
    })

    // 2. Set Slot to Confirmed, others Rejected
    // We need to reject others. (Optional but good for cleanliness)
    const slots = await prisma.eventSlot.findMany({ where: { eventId } })

    for (const slot of slots) {
        await prisma.eventSlot.update({
            where: { id: slot.id },
            data: { status: slot.id === slotId ? 'confirmed' : 'rejected' }
        })
    }

    // 3. Update Participants logic? 
    // For MVP, we'll leave them as is, they can RSVP on the public page.

    revalidatePath(`/events/${eventId}/dashboard`)
    revalidatePath(`/events/${eventId}`)
    redirect(`/events/${eventId}/dashboard`)
}

export async function checkInParticipant(eventId: string, code: string) {
    // Code matches token sub or checkInCode
    // Try to find participant by token startsWith
    // SQLite doesn't support startsWith easily in Prisma? Prisma does.

    // Actually we used token substring 0-6 as code.
    // So we search for participant where token starts with code.
    // Or if we stored checkInCode.

    // Let's assume strict match on checkInCode OR token.
    // But for token substring we need broad search.

    const participants = await prisma.participant.findMany({
        where: { eventId }
    })

    const target = participants.find(p =>
        (p.checkInCode === code) ||
        (p.token.toUpperCase().startsWith(code.toUpperCase()))
    )

    if (!target) {
        return { success: false, message: 'Invalid code' }
    }

    if (target.checkedInAt) {
        return { success: false, message: 'Already checked in', participant: target }
    }

    await prisma.participant.update({
        where: { id: target.id },
        data: { checkedInAt: new Date() }
    })

    revalidatePath(`/events/${eventId}/reception`)
    return { success: true, message: 'Check-in successful!', participant: target }
}
