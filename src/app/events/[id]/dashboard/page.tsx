import { prisma } from '@/lib/db'
import { addEventSlot, deleteEventSlot, updateEventStatus, confirmEvent, togglePaymentStatus } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { formatDate, formatTime, checkClassName } from '@/lib/utils'
import CopyLinkButton from './CopyLinkButton'
import UpdateToast from './UpdateToast'

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
    const isPolling = event.status === 'polling'
    const isFinalized = event.status === 'finalized'

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <UpdateToast />
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <p className="status-badge" style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    background: isDraft ? 'var(--warning)' : (isFinalized ? 'var(--primary)' : 'var(--success)'),
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                }}>
                    {event.status === 'draft' ? '作成中' :
                        event.status === 'polling' ? '募集中' :
                            event.status === 'finalized' ? '決定済み' : event.status}
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
                        {event.fee ? <strong>{event.fee}</strong> : <span style={{ color: 'var(--text-muted)' }}>会費未定</span>}
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'start' }}>

                {/* Main Content (Left Column) */}
                <div style={{ flex: '999 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>

                    {/* Date Slots & Voting Status */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>出欠状況</h2>

                        {event.slots.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ marginBottom: '1rem' }}>日程候補が設定されていません。</p>
                                {isDraft && <p style={{ fontSize: '0.9rem' }}>「日程追加」フォームから候補を追加してください</p>}
                            </div>
                        ) : (
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
                                        {event.slots.map(slot => {
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
                                                                <form action={confirmEvent.bind(null, event.id, slot.id)}>
                                                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                                        決定
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        )}
                                                        {isDraft && (
                                                            <form action={deleteEventSlot.bind(null, slot.id, event.id)}>
                                                                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' }}>削除</button>
                                                            </form>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Participants Section */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>参加者 ({event.participants.length})</h2>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {event.participants.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>まだ回答がありません。</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>名前</th>
                                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>コメント</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.participants.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{p.nickname}</td>
                                                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.memo || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar (Right Column) - Admin Controls */}
                <aside style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Event Settings Card */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚙️</span> 設定
                        </h3>
                        <form action={updateEventStatus.bind(null, event.id, event.status)}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>店舗名 (場所)</label>
                                <input type="text" name="location" defaultValue={event.location || ''} placeholder="例: 居酒屋わっしょい" style={{ padding: '0.6rem' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>住所</label>
                                <input type="text" name="address" defaultValue={event.address || ''} placeholder="例: 東京都渋谷区..." style={{ padding: '0.6rem' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>URL</label>
                                <input type="url" name="siteUrl" defaultValue={event.siteUrl || ''} placeholder="https://..." style={{ padding: '0.6rem' }} />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.8rem' }}>会費</label>
                                <input type="text" name="fee" defaultValue={event.fee || ''} placeholder="例: 3000円" style={{ padding: '0.6rem' }} />
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }}>更新を保存</button>
                        </form>

                    </div>

                    {/* Published / Slots Actions */}
                    {isDraft && (
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📅</span> 日程追加
                            </h3>
                            <form action={addEventSlot.bind(null, event.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>開始</label>
                                    <input type="datetime-local" name="start" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>終了</label>
                                    <input type="datetime-local" name="end" required style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} />
                                </div>
                                <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>追加</button>
                            </form>
                        </div>
                    )}

                    {/* Main Actions */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🚀</span> アクション
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isDraft && (
                                <form action={updateEventStatus.bind(null, event.id, 'polling')}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                        募集を開始する
                                    </button>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                        募集を開始すると、参加者が投票できるようになります。
                                    </p>
                                </form>
                            )}

                            {isPolling && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={`/events/${event.id}`} target="_blank" className="btn btn-primary" style={{ width: '100%' }}>
                                        公開ページを開く ↗
                                    </a>
                                    <a href={`/events/${event.id}/export`} className="btn btn-secondary" style={{ width: '100%' }}>
                                        CSVダウンロード
                                    </a>
                                </div>
                            )}

                            {isFinalized && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={`/events/${event.id}`} target="_blank" className="btn btn-primary" style={{ width: '100%' }}>
                                        案内ページを確認 ↗
                                    </a>
                                    <a href={`/events/${event.id}/reception`} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}>
                                        受付管理ページ
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🔗</span> 共有
                        </h3>
                        <CopyLinkButton url={`${process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/events/${event.id}`} />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>トップへ戻る</a>
                    </div>
                </aside>

            </div>
        </div >
    )
}
