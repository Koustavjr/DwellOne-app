import { supabase } from '@/utils/supabase';
import type { Router } from 'expo-router';

export async function routeAfterAuth(router: Router) {

    const { data: { user } } = await supabase.auth.getUser()
    // const user = useAuthStore.getState().user
    if (!user) return;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select("full_name ,role ")
        .eq('id', user.id)
        .single();

    if (error || !profile?.full_name) {
        router.replace('/profile' as any);
        return;
    }

    if (profile?.role === 'admin') {
        router.push('/admin/dashboard' as any)
    } else if (profile?.role === 'resident') {
        router.push('/resident/dashboard' as any)
    } else {
        router.push('/guard/dashboard' as any)
    }
}