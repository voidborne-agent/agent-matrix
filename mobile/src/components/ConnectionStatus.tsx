import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import matrixService from '../services/MatrixService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type SyncState = 'PREPARED' | 'SYNCING' | 'STOPPED' | 'ERROR' | 'CATCHUP';

const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  PREPARED: { color: colors.accent, text: 'Connected' },
  SYNCING: { color: colors.primary, text: 'Syncing...' },
  STOPPED: { color: colors.error, text: 'Disconnected' },
  ERROR: { color: colors.error, text: 'Connection Error' },
  CATCHUP: { color: colors.warning, text: 'Catching up...' },
};

export const ConnectionStatus: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>('SYNCING');
  const [visible, setVisible] = useState(false);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    const handleSync = (state: string) => {
      setSyncState(state as SyncState);
      
      // Show banner for non-connected states
      if (state !== 'PREPARED') {
        setVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide after a short delay when connected
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setVisible(false));
        }, 1500);
      }
    };

    matrixService.on('sync', handleSync);
    return () => {
      matrixService.off('sync', handleSync);
    };
  }, []);

  if (!visible) return null;

  const config = STATUS_CONFIG[syncState] || STATUS_CONFIG.SYNCING;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={styles.text}>{config.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  text: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
});

export default ConnectionStatus;
