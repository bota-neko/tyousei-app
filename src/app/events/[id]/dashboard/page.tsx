import { prisma } from '@/lib/db'
import { addEventSlot, deleteEventSlot, updateEventStatus, confirmEvent, togglePaymentStatus, toggleShowParticipants, closeEvent } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { formatDate, formatTime, checkClassName } from '@/lib/utils'
import CopyLinkButton from './CopyLinkButton'
import UpdateToast from './UpdateToast'
import SaveEventToStorage from './SaveEventToStorage'
import DeleteEventButton from './DeleteEventButton'

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
                        <div style={{ overflowX: 'auto' }}>
                            {event.participants.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>まだ回答がありません。</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%', whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', zIndex: 1 }}>名前</th>
                                            {event.slots.map(slot => (
                                                <th key={slot.id} style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', minWidth: '60px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                            {new Date(slot.start).getMonth() + 1}/{new Date(slot.start).getDate()}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            ({new Date(slot.start).toLocaleDateString('ja-JP', { weekday: 'short' })})
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                                            {formatTime(slot.start)}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>コメント</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.participants.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', zIndex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                                                    {p.nickname}
                                                </td>
                                                {event.slots.map(slot => {
                                                    const vote = p.votes.find(v => v.slotId === slot.id)
                                                    let label = '-'
                                                    let color = 'var(--text-dim)'
                                                    if (vote) {
                                                        if (vote.response === 'yes') { label = '◯'; color = 'var(--primary)'; }
                                                        else if (vote.response === 'maybe') { label = '△'; color = 'var(--warning)'; }
                                                        else if (vote.response === 'no') { label = '×'; color = 'var(--text-dim)'; }
                                                    }
                                                    return (
                                                        <td key={slot.id} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: color, fontWeight: 'bold' }}>
                                                            {label}
                                                        </td>
                                                    )
                                                })}
                                                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {p.memo || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                <aside style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* STEP 1: Add Dates */}
                    {isDraft && (
                        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                                日程候補の追加
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
                                <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none' }}>追加する</button>
                            </form>
                        </div>
                    )}

                    {/* Participant Visibility Toggle */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <form action={toggleShowParticipants.bind(null, event.id)}>
                            <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        name="showParticipants"
                                        defaultChecked={event.showParticipants}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    参加者に他の回答者を表示する
                                </label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '2.25rem', lineHeight: '1.4' }}>
                                    OFFにすると、参加者のページで他の人の名前や回答が非表示になります。
                                </p>
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', marginTop: '0.75rem' }}>保存</button>
                        </form>
                    </div>

                    {/* STEP 2: Event Settings */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                            基本設定
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                            基本設定は、後からでも追加して、同じURLで案内可能です。
                        </p>
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

                    {/* STEP 3: Actions */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{isDraft ? '3' : '★'}</span>
                            {isDraft ? '募集開始' : 'イベント操作'}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isDraft && (
                                <form action={updateEventStatus.bind(null, event.id, 'polling')}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontWeight: 'bold', padding: '0.8rem' }}>
                                        募集を開始する
                                    </button>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                        参加者が投票できるようになります。<br />
                                        ※後からでも設定は変更可能です。
                                    </p>
                                </form>
                            )}

                            {isPolling && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/events/${event.id}`} target="_blank" className="btn btn-primary" style={{ width: '100%' }}>
                                        公開ページを開く ↗
                                    </a>
                                    <a href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/events/${event.id}/export`} className="btn btn-secondary" style={{ width: '100%' }}>
                                        CSVダウンロード
                                    </a>
                                </div>
                            )}

                            {isFinalized && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/events/${event.id}`} target="_blank" className="btn btn-primary" style={{ width: '100%' }}>
                                        案内ページを確認 ↗
                                    </a>
                                    <a href={`/events/${event.id}/reception`} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}>
                                        受付管理ページ
                                    </a>
                                    <form action={closeEvent.bind(null, event.id)}>
                                        <button type="submit" className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                                            イベントを終了する
                                        </button>
                                    </form>
                                </div>
                            )}

                            {isClosed && (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>このイベントは終了しました</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🔗</span> 共有
                        </h3>
                        <CopyLinkButton path={`/events/${event.id}`} />
                    </div>

                    {/* Danger Zone */}
                    <div style={{ padding: '1.5rem', border: '1px solid rgba(229, 62, 62, 0.2)', borderRadius: 'var(--radius-md)', background: 'rgba(229, 62, 62, 0.02)' }}>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--danger, #e53e3e)' }}>⚠️ 危険な操作</h3>
                        <DeleteEventButton eventId={event.id} />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>トップへ戻る</a>
                    </div>
                </aside>

            </div>
        </div >
    )
}
