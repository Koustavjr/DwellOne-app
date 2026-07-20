import { supabase } from '@/utils/supabase';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { routeAfterAuth } from './routeAfterAuth';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = Linking.createURL('/auth-callback');

export function useGoogleSignIn() {
    const router = useRouter();

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            console.error('OAuth error:', error);
            return;
        }

        if (data?.url) {
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

            if (result.type === 'success') {
                const { url } = result;
                const params = new URLSearchParams(url.split('#')[1]);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        return;
                    }

                    // no manual store update needed — onAuthStateChange in your store handles it

                    await routeAfterAuth(router);
                }
            }
        }
    };

    return { signInWithGoogle };
}