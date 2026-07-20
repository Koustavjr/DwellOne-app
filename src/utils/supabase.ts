// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { createClient } from '@supabase/supabase-js'

// export const supabase = createClient(
//     process.env.EXPO_PUBLIC_SUPABASE_URL!,
//     process.env.EXPO_PUBLIC_SUPABASE_KEY!,
//     {
//         auth: {
//             storage: AsyncStorage,
//             autoRefreshToken: true,
//             persistSession: true,
//             detectSessionInUrl: false,
//         },
//     })

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Keep session refresh in sync with app foreground/background state
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});