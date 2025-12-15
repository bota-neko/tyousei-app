import { prisma } from '@/lib/db'
import { joinEvent } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { formatDate, formatTime, checkClassName } from '@/lib/utils'
import VoteForm from './VoteForm'
import ParticipantList from './ParticipantList'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) return { title: 'イベントが見つかりません' }

    return {
        title: `${event.title} | 調整くんPremium`,
        description: event.description || '以下のURLから日程調整にお答えください。',
        openGraph: {
            title: event.title,
            description: event.description || '日程調整等のご案内です。確認をお願いします。',
            type: 'article', // 'website' or 'article'
        }
    }
}

export default async function EventPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ t?: string }>
}) {
    const { id } = await params
    const { t } = await searchParams

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            slots: {
                orderBy: { start: 'asc' },
                include: { votes: true }
            },
            participants: {
                include: { votes: true }
            }
        }
    })

    if (!event) notFound()

    const token = t
    const participant = token ? event.participants.find(p => p.token === token) : null
    const isPolling = event.status === 'polling'

    if (!participant) {
        // Guest View
        return (
            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>{event.title}</h1>
                {event.description && <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{event.description}</p>}

                {isPolling ? (
                    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>イベントに参加</h2>
                        <form action={joinEvent.bind(null, event.id)}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>お名前</label>
                                <input type="text" name="nickname" required placeholder="表示名を入力" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>出欠入力へ進む</button>
                        </form>
                    </div>
                ) : (event.status === 'finalized' || event.status === 'live') ? (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--success)' }}>開催決定！</h2>

                        <div style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>開催情報</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>日時</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {(() => {
                                            const confirmedSlot = event.slots.find(s => s.status === 'confirmed')
                                            return confirmedSlot ? (
                                                <span>{formatDate(confirmedSlot.start)} {formatTime(confirmedSlot.start)} - {formatTime(confirmedSlot.end)}</span>
                                            ) : '日時未定'
                                        })()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem', color: 'var(--text-main)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>📍</span>
                                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{event.location || '場所未定'}</span>
                                        </div>
                                        {event.address && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>{event.address}</div>}
                                        {event.siteUrl && (
                                            <div style={{ paddingLeft: '1.5rem' }}>
                                                <a href={event.siteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                                                    店舗情報・アクセス ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                                        <span>💰</span>
                                        <span style={{ fontWeight: '600' }}>{event.fee || '会費未定'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem' }}>
                            すでに登録済みの方は、専用リンクからアクセスして詳細・ステータスをご確認ください。
                        </p>

                        <ParticipantList
                            slots={event.slots}
                            participants={event.participants}
                            confirmedSlotId={event.slots.find(s => s.status === 'confirmed')?.id}
                        />

                        <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem', textAlign: 'left' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>追加で参加を表明する</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                予定が変わって参加できるようになった方などは、こちらから登録してください。
                            </p>
                            <form action={joinEvent.bind(null, event.id)}>
                                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                                    <input type="text" name="nickname" required placeholder="お名前" style={{ padding: '0.6rem', flex: 1, border: '1px solid #ddd', borderRadius: 'var(--radius-sm)' }} />
                                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>参加登録</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <p>このイベントは現在 {event.status === 'draft' ? '準備中' : '終了'} です。</p>
                        <p>すでに登録済みの方は、専用リンクからアクセスしてください。</p>
                    </div>
                )}
            </div>
        )
    }

    // Participant View (Identified)
    const myVotes = participant.votes.reduce((acc, v) => ({ ...acc, [v.slotId]: v.response }), {} as Record<string, string>)

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{event.title}</h1>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ログイン中:</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{participant.nickname}</p>
                    </div>
                </div>
            </header>

            {isPolling ? (
                <>
                    <VoteForm
                        eventId={event.id}
                        participantToken={participant.token}
                        slots={event.slots}
                        initialVotes={myVotes}
                        initialMemo={participant.memo}
                    />
                    <ParticipantList
                        slots={event.slots}
                        participants={event.participants}
                        currentParticipantId={participant.id}
                    />
                </>
            ) : (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    {event.status === 'finalized' || event.status === 'live' ? (
                        <div>
                            <h2 style={{ marginBottom: '1rem', color: 'var(--success)' }}>開催決定！</h2>

                            <div style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>開催情報</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>日時</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {/* We need confirmed slot logic here. Ideally event has confirmedSlotId or we find the slot with status confirmed. */}
                                            {/* Wait, the event model doesn't store confirmedSlotId directly on Event? Ah, EventSlot has status='confirmed'. */}
                                            {(() => {
                                                const confirmedSlot = event.slots.find(s => s.status === 'confirmed')
                                                return confirmedSlot ? (
                                                    <span>{formatDate(confirmedSlot.start)} {formatTime(confirmedSlot.start)} - {formatTime(confirmedSlot.end)}</span>
                                                ) : '日時未定'
                                            })()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem', color: 'var(--text-main)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📍</span>
                                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{event.location || '場所未定'}</span>
                                            </div>
                                            {event.address && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>{event.address}</div>}
                                            {event.siteUrl && (
                                                <div style={{ paddingLeft: '1.5rem' }}>
                                                    <a href={event.siteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                                                        店舗情報・アクセス ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                                            <span>💰</span>
                                            <span style={{ fontWeight: '600' }}>{event.fee || '会費未定'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ParticipantList
                                slots={event.slots}
                                participants={event.participants}
                                currentParticipantId={participant.id}
                                confirmedSlotId={event.slots.find(s => s.status === 'confirmed')?.id}
                            />
                        </div>
                    ) : (
                        <p>日程調整中...</p>
                    )}
                </div>
            )}
        </div>
    )
}
