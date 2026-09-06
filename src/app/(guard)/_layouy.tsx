import { useRoleGuard } from '@/hooks/useRoleGuard';
import { Tabs } from 'expo-router';
import { DoorOpen, History, Search, Users } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

export default function GuardTabsLayout() {
    const { checking, allowed } = useRoleGuard('guard');

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (!allowed) return null;

    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen name="search-flat" options={{ title: 'Search', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
            <Tabs.Screen name="log-entry" options={{ title: 'Log Entry', tabBarIcon: ({ color, size }) => <DoorOpen color={color} size={size} /> }} />
            <Tabs.Screen name="active" options={{ title: 'Active', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
            <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <History color={color} size={size} /> }} />
        </Tabs>
    );
}