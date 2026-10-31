// Group-code authentication happens atomically in the service-only SQL RPC.
// No user session or server credential is exposed to the player's browser.
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
});

Deno.serve(async (request: Request) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
    if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405);
    try {
        // Limit the stream itself; Content-Length can be missing or forged.
        const reader = request.body?.getReader();
        if (!reader) return respond({ error: 'Missing registration details.' }, 400);
        let size = 0;
        const chunks: Uint8Array[] = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > 4096) { await reader.cancel(); return respond({ error: 'Registration details are too long.' }, 413); }
            chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const input = JSON.parse(new TextDecoder().decode(bytes));
        if (typeof input.eventId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.eventId)
            || typeof input.code !== 'string' || input.code.length > 32
            || !['team', 'player'].includes(input.kind)
            || typeof input.player1 !== 'string' || input.player1.length > 120
            || (input.kind === 'team' && (typeof input.teamName !== 'string' || input.teamName.length > 120 || typeof input.player2 !== 'string' || input.player2.length > 120))) {
            return respond({ error: 'Check the group code and registration details.' }, 400);
        }
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const base = Deno.env.get('SUPABASE_URL');
        if (!serviceKey || !base) return respond({ error: 'Registration is temporarily unavailable.' }, 503);
        const result = await fetch(`${base}/rest/v1/rpc/submit_group_registration`, {
            method: 'POST',
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_event: input.eventId, p_code: input.code, p_kind: input.kind,
                p_team_name: input.kind === 'team' ? input.teamName : null, p_player1: input.player1,
                p_player2: input.kind === 'team' ? input.player2 : null }),
        });
        if (!result.ok) return respond({ error: 'Registration is temporarily unavailable. Please try again.' }, 503);
        const data = await result.json();
        return respond(data, data.error ? 400 : 200);
    } catch {
        return respond({ error: 'Could not read registration details. Please try again.' }, 400);
    }
});
