'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function UpdateToast() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (searchParams.get('updated') === 'true') {
            setShow(true)

            // Hide after 3 seconds
            const timer = setTimeout(() => {
                setShow(false)
                // Clean up URL
                const params = new URLSearchParams(searchParams.toString())
                params.delete('updated')
                router.replace(`?${params.toString()}`, { scroll: false })
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [searchParams, router])

    if (!show) return null

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'var(--success, #22c55e)', // Use CSS var or fallback green
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500',
            animation: 'slideDown 0.3s ease-out'
        }}>
            <span>✅</span> 更新を保存しました
        </div>
    )
}
