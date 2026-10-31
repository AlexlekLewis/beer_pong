import { useEffect, useState } from 'react';
import { registrationClient } from './registration-api';

export function useRegistrationUser() {
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        if (!registrationClient) return;
        let active = true;
        void registrationClient.auth.getSession().then(({ data }) => { if (active) setUserId(data.session?.user.id ?? null); });
        const { data } = registrationClient.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
        return () => { active = false; data.subscription.unsubscribe(); };
    }, []);
    return userId;
}

