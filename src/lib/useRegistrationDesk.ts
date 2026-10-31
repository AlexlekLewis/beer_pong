import { useCallback, useEffect, useRef, useState } from 'react';
import { registrationClient, type RegistrationEntry } from './registration-api';

type Snapshot = {
    key: string;
    entries: RegistrationEntry[];
    isOpen: boolean;
    isOwner: boolean;
    updatedAt: Date | null;
    error: string;
};

export function useRegistrationDesk(eventId: string | undefined, userId: string | null) {
    const key = `${eventId ?? ''}:${userId ?? ''}`;
    const sequence = useRef({ value: 0 }).current;
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const refresh = useCallback(async () => {
        if (!registrationClient || !eventId || !userId) return;
        const request = ++sequence.value;
        try {
            const [eventResult, entryResult] = await Promise.all([
                registrationClient.from('registration_events').select('is_open,owner_id').eq('id', eventId).maybeSingle(),
                registrationClient.from('registration_entries').select('*').eq('tournament_id', eventId).order('created_at'),
            ]);
            if (request !== sequence.value) return;
            if (eventResult.error || entryResult.error) throw new Error('Could not load registrations. Check your connection or sign in again.');
            const isOwner = eventResult.data?.owner_id === userId;
            setSnapshot({ key, entries: isOwner ? entryResult.data ?? [] : [], isOpen: !!isOwner && !!eventResult.data?.is_open,
                isOwner, updatedAt: new Date(), error: eventResult.data && !isOwner ? 'This tournament belongs to a different organiser account. Sign in with the account that opened registration.' : '' });
        } catch (error) {
            if (request !== sequence.value) return;
            setSnapshot(previous => ({ key, entries: previous?.key === key ? previous.entries : [],
                isOpen: previous?.key === key ? previous.isOpen : false, isOwner: previous?.key === key ? previous.isOwner : false,
                updatedAt: previous?.key === key ? previous.updatedAt : null,
                error: error instanceof Error ? error.message : 'Could not load registrations.' }));
        }
    }, [eventId, userId, key, sequence]);

    useEffect(() => {
        if (!eventId || !userId) return;
        void refresh();
        const refreshVisible = () => { if (document.visibilityState !== 'hidden') void refresh(); };
        const timer = window.setInterval(refreshVisible, 5000);
        window.addEventListener('focus', refreshVisible);
        document.addEventListener('visibilitychange', refreshVisible);
        return () => {
            sequence.value++;
            window.clearInterval(timer);
            window.removeEventListener('focus', refreshVisible);
            document.removeEventListener('visibilitychange', refreshVisible);
        };
    }, [eventId, userId, refresh, sequence]);

    const current = snapshot?.key === key ? snapshot : null;
    return { entries: current?.entries ?? [], isOpen: current?.isOpen ?? false, isOwner: current?.isOwner ?? false,
        updatedAt: current?.updatedAt ?? null, error: current?.error ?? '', loading: !!eventId && !!userId && !current, refresh };
}
