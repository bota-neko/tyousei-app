'use client'

import { updateEventStatus, toggleShowParticipants, closeEvent } from '@/lib/actions'
import CopyLinkButton from './CopyLinkButton'
import DeleteEventButton from './DeleteEventButton'
import AddSlotForm from './AddSlotForm'
import { useTransition } from 'react'

type Event = {
    id: string
    title: string
    status: string
    location: string | null
    address: string | null
    siteUrl: string | null
    fee: string | null
    showParticipants: boolean
}

type Props = {
    event: Event
}

export default function DashboardSidebar({ event }: Props) {
    const [isPending, startTransition] = useTransition()

    const isDraft = event.status === 'draft'
    const isPolling = event.status === 'polling'
    const isFinalized = event.status === 'finalized'
    const isClosed = event.status === 'closed'

    return (
        <aside style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* STEP 1: Add Dates (Only in Draft) */}
            {isDraft && <AddSlotForm eventId={event.id} />}

            {/* Participant Visibility Toggle */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <form action={(formData) => startTransition(async () => await toggleShowParticipants(event.id, formData))}>
                    <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                name="showParticipants"
                                defaultChecked={event.showParticipants}
                                disabled={isPending}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            参加者に他の回答者を表示する
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '2.25rem', lineHeight: '1.4' }}>
                            OFFにすると、参加者のページで他の人の名前や回答が非表示になります。
                        </p>
                    </div>
                    <button type="submit" disabled={isPending} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                        {isPending ? '保存中...' : '設定を保存'}
                    </button>
                </form>
            </div>

            {/* STEP 2: Event Settings */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                    基本設定
                </h3>
                <form action={(formData) => startTransition(async () => await updateEventStatus(event.id, event.status, formData))}>
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

                    <button type="submit" disabled={isPending} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }}>
                        {isPending ? '保存中...' : '更新を保存'}
                    </button>
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
                        <form action={() => startTransition(async () => await updateEventStatus(event.id, 'polling'))}>
                            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%', fontWeight: 'bold', padding: '0.8rem' }}>
                                募集を開始する
                            </button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                参加者が投票できるようになります。
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
                            <form action={() => startTransition(async () => await closeEvent(event.id))}>
                                <button type="submit" disabled={isPending} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
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
    )
}
