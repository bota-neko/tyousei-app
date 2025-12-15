import { createEvent } from '@/lib/actions'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, #000, #666)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            スマートな<br className="mobile-hide" />イベント調整を。
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 4vw, 1.2rem)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            日程調整から当日の受付まで、これひとつで完了。<br className="mobile-hide" />
            参加者のログインやアプリインストールは不要です。
          </p>
          <style>{`
            @media (max-width: 600px) {
              .mobile-hide { display: none; }
            }
          `}</style>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>イベントを作成</h2>
          <form action={createEvent}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="title">イベント名</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="例: 第1回 定例ミーティング"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="description">詳細 (任意)</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="イベントの概要を入力してください..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
              調整を開始する →
            </button>
          </form>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          <span>30人まで無料</span>
          <span>•</span>
          <span>登録不要</span>
          <span>•</span>
          <span>QR受付機能</span>
        </div>
      </div>
    </main>
  )
}
