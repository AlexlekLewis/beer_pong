import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const registrationClient = url && key ? createClient(url, key) : null;
export const registrationLink = (id: string) => `${window.location.origin}${window.location.pathname}?register=${encodeURIComponent(id)}`;
export type RegistrationEntry = {
    id: string;
    tournament_id: string;
    kind: 'player' | 'team';
    team_name: string | null;
    player1: string;
    player2: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
};

export async function closeRegistration(id: string) {
    if (!registrationClient) throw new Error('Registration backend is not configured.');
    const { data, error } = await registrationClient.from('registration_events').update({ is_open: false }).eq('id', id).select('id').single();
    if (error || !data) throw new Error(error?.message ?? 'Could not close registration.');
}


export function generateGroupCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    const code = Array.from(bytes, value => alphabet[value & 31]).join('');
    return code.match(/.{4}/g)!.join('-');
}

export async function hashGroupCode(code: string): Promise<string> {
    const normalized = code.toUpperCase().replace(/[-\s]/g, '');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
    return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
}

export async function saveGroupCode(id: string, code: string): Promise<void> {
    if (!registrationClient) throw new Error('Registration backend is not configured.');
    const { error } = await registrationClient.from('registration_group_codes').upsert({ tournament_id: id, code_hash: await hashGroupCode(code) });
    if (error) throw error;
}

export async function submitGroupEntry(input: { eventId: string; code: string; kind: 'team' | 'player'; teamName: string; player1: string; player2: string }) {
    if (!url || !key) throw new Error('Registration backend is not configured.');
    const response = await fetch(`${url}/functions/v1/group-register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key }, body: JSON.stringify(input),
    });
    const data = await response.json();
    if (!response.ok || data.error || !data.id) throw new Error(data.error ?? 'Could not register. Please try again.');
    return data.id as string;
}
