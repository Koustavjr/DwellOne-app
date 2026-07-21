import { supabase } from '@/utils/supabase';
import type { Router } from 'expo-router';

export async function routeAfterAuth(router: Router, societyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle(); // <-- changed from .single(): returns null instead of throwing when no row exists

    if (error) {
        // a real DB/network error, not just "no profile yet"
        console.error('Profile fetch failed', error);
        router.replace('/error' as any);
        return;
    }

    if (!profile) {
        if (societyId === 'resident') {
            router.replace({
                pathname: '/profile',
                params: { resolvedRole: "resident" }
            } as any)
        }
        else if (societyId === 'guard') {
            router.replace({
                pathname: '/profile',
                params: { "resolvedRole": "guard" }
            } as any)
        }
        else {
            router.replace({
                pathname: '/profile',
                params: { "resolvedRole": societyId }
            } as any)
        }
        return;
    }


    // Case 1: profile exists but incomplete (e.g. they started registration and dropped off)
    // if (profile && !profile.full_name) {
    //     router.replace('/profile' as any);
    //     return;
    // }

    // Case 2: profile exists and is complete — route by role
    if (profile?.full_name) {
        if (profile.role === 'admin') {
            router.push('/admin/dashboard' as any);
        } else if (profile.role === 'resident') {
            router.push('/resident/dashboard' as any);
        } else {
            router.push('/guard/dashboard' as any);
        }
        return;
    }

    // Case 3: no profile row at all — brand new user, check if they were pre-invited
    // const { data: invite, error: inviteError } = await supabase
    //     .from('invites')
    //     .select('id, role, society_id')
    //     .eq('email', user.email)
    //     .is('used_at', null)
    //     .maybeSingle();

    // if (inviteError) {
    //     console.error('Invite lookup failed', inviteError);
    //     router.replace('/error' as any);
    //     return;
    // }

    // if (invite) {
    //     // mark it claimed so it can't be reused
    //     await supabase.from('invites').update({ used_at: new Date().toISOString() }).eq('id', invite.id);

    //     router.replace({
    //         pathname: '/profile',
    //         params: { resolvedRole: invite.role, societyId: invite.society_id },
    //     } as any);
    // } else {
    //     // nobody invited this email -> falls through to resident self-registration
    //     router.replace({
    //         pathname: '/profile',
    //         params: { resolvedRole: 'resident' },
    //     } as any);
    // }
}