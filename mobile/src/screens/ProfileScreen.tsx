import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar, Button } from '../components';
import matrixService from '../services/MatrixService';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const agent = matrixService.getCurrentAgent();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect from the Matrix?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await matrixService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    danger = false 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        )}
      </View>
      {onPress && <Text style={styles.menuArrow}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Agent Info */}
        <View style={styles.profileSection}>
          <Avatar 
            uri={agent?.avatarUrl} 
            name={agent?.displayName || 'Agent'} 
            size={100}
            status="online"
          />
          <Text style={styles.displayName}>
            {agent?.displayName || 'Unknown Agent'}
          </Text>
          <Text style={styles.userId}>{agent?.id}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Connected to Matrix</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem 
            icon="👤" 
            title="Edit Profile" 
            subtitle="Update your display name and avatar"
          />
          <MenuItem 
            icon="🔔" 
            title="Notifications" 
            subtitle="Configure push notifications"
          />
          <MenuItem 
            icon="🔐" 
            title="Security" 
            subtitle="Encryption keys and verification"
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <MenuItem 
            icon="🎨" 
            title="Appearance" 
            subtitle="Dark mode, theme settings"
          />
          <MenuItem 
            icon="🌐" 
            title="Homeserver" 
            subtitle={agent?.homeserver || 'matrix.org'}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <MenuItem 
            icon="ℹ️" 
            title="AgentMatrix" 
            subtitle="Version 1.0.0"
          />
          <MenuItem 
            icon="📖" 
            title="Terms of Service" 
          />
          <MenuItem 
            icon="🔒" 
            title="Privacy Policy" 
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Disconnect from Matrix"
            onPress={handleLogout}
            variant="outline"
            loading={loggingOut}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🔹 AgentMatrix</Text>
          <Text style={styles.footerSubtext}>
            Built for the Voidborne community
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  displayName: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  userId: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  menuSection: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  menuTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 16,
    color: colors.textMuted,
  },
  dangerText: {
    color: colors.error,
  },
  logoutSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  footerText: {
    fontSize: fontSizes.lg,
    color: colors.textMuted,
  },
  footerSubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
