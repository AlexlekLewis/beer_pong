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
