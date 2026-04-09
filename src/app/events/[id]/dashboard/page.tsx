import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import UpdateToast from './UpdateToast'
import SaveEventToStorage from './SaveEventToStorage'
import AttendanceTable from './AttendanceTable'
import ParticipantsDetail from './ParticipantsDetail'
import DashboardSidebar from './DashboardSidebar'

export default async function Dashboard({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

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

    const isDraft = event.status === 'draft'
    const isFinalized = event.status === 'finalized'
    const isClosed = event.status === 'closed'

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <UpdateToast />
            <SaveEventToStorage eventId={event.id} title={event.title} status={event.status} />

            <div role="alert" style={{
                marginBottom: '2rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: '#fff4e5',
                border: '1px solid #ffd591',
                color: '#663c00',
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                fontSize: '0.9rem',
                lineHeight: 1.5
            }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                    <strong>【重要】このページのURLを必ず保存してください</strong>
                    <p style={{ marginTop: '0.25rem' }}>
                        この管理画面のURL（現在のアドレスバーのURL）を忘れると、イベントの編集や確認ができなくなります。
                        <br />
                        <strong>URLの再発行はできません</strong>ので、今すぐブックマークをお願いします。
                    </p>
                </div>
            </div>

            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <p className="status-badge" style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    background: isDraft ? 'var(--warning)' : (isFinalized ? 'var(--primary)' : (isClosed ? 'var(--text-muted)' : 'var(--success)')),
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                }}>
                    {event.status === 'draft' ? '作成中' :
                        event.status === 'polling' ? '募集中' :
                            event.status === 'finalized' ? '決定済み' :
                                event.status === 'closed' ? '終了' : event.status}
                </p>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
                {event.description && <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>{event.description}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1rem' }}>
                    {/* Location Info */}
                    {(event.location || event.address || event.siteUrl) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            {event.location && <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>📍 {event.location}</div>}
                            {event.address && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{event.address}</div>}
                            {event.siteUrl && (
                                <a href={event.siteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                                    店舗・施設サイト ↗
                                </a>
                            )}
                        </div>
                    ) : (
                        <span style={{ color: 'var(--text-muted)' }}>📍 場所未定</span>
                    )}

                    {/* Fee */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>💰</span>
                        {event.fee ? <strong>{event.fee.match(/^\d+$/) ? (Number(event.fee).toLocaleString() + '円') : event.fee}</strong> : <span style={{ color: 'var(--text-muted)' }}>会費未定</span>}
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'start' }}>
                {/* Main Content (Left Column) */}
                <div style={{ flex: '999 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
                    {/* Attendance Status */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>出欠状況</h2>
                        <AttendanceTable eventId={event.id} slots={event.slots} eventStatus={event.status} />
                    </section>

                    {/* Participants Section */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>参加者 ({event.participants.length})</h2>
                        <ParticipantsDetail slots={event.slots} participants={event.participants} />
                    </section>
                </div>

                {/* Sidebar */}
                <DashboardSidebar event={event} />
            </div>
        </div>
    )
}
