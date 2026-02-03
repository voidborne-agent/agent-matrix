import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/utils/theme';
import notificationService from './src/services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    notificationService.initialize().then((token) => {
      if (token) {
        console.log('[App] Push notifications initialized');
      }
    });

    // Handle notification responses (when user taps notification)
    const subscription = notificationService.onNotificationResponse((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'message' && data?.roomId) {
        // TODO: Navigate to room
        console.log('[App] Navigate to room:', data.roomId);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
