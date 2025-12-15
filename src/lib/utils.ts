import { v4 as uuidv4 } from 'uuid';

export function checkClassName(conditions: Record<string, boolean>): string {
    // Simple class joiner instead of clsx/tailwind-merge since we are vanilla
    return Object.entries(conditions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
        .join(' ');
}

export function generateToken(): string {
    return uuidv4();
}

export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    });
}

export function formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
