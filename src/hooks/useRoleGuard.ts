import { useAuthStore } from '@/store/use-auth';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function useRoleGuard(requiredRole: 'resident' | 'guard' | 'admin') {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const { user } = useAuthStore()
    useEffect(() => {
        (async () => {
            // const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/' as any);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile || profile.role !== requiredRole) {
                router.replace('/' as any); // root will re-route them correctly
                return;
            }

            setAllowed(true);
            setChecking(false);
        })();
    }, []);

    return { checking, allowed };
}