import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function AuthCallback() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.text}>Redirecting...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07090E',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
