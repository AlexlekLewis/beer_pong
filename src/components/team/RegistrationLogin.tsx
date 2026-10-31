import { useState } from 'react';
import { registrationClient } from '../../lib/registration-api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function RegistrationLogin() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    return <form className="space-y-3" onSubmit={async event => {
        event.preventDefault();
        if (!registrationClient || busy) return;
        setBusy(true);
        try {
            const { error } = sent
                ? await registrationClient.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' })
                : await registrationClient.auth.signInWithOtp({ email: email.trim() });
            if (error) throw error;
            setSent(true);
            setMessage(sent ? 'Signed in.' : 'Check your email for your sign-in code. You can also use its sign-in link, then reopen this tournament link.');
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in failed. Try again.'); }
        finally { setBusy(false); }
    }}>
        <Input label="Email" type="email" required autoComplete="email" value={email} disabled={sent} onChange={event => setEmail(event.target.value)} />
        {sent && <Input label="Email sign-in code" required autoComplete="one-time-code" value={token} onChange={event => setToken(event.target.value)} />}
        <Button type="submit" disabled={busy}>{busy ? 'Please wait…' : sent ? 'Verify code' : 'Email me a sign-in code'}</Button>
        {sent && <button type="button" className="block text-sm underline" onClick={() => { setSent(false); setToken(''); }}>Use another email or resend</button>}
        <p role="status" className="text-sm">{message}</p>
    </form>;
}
