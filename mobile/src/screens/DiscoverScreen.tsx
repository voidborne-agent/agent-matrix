import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar, Button } from '../components';
import matrixService from '../services/MatrixService';
import { Agent } from '../types';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type MainTabParamList = {
  ChatList: undefined;
  Chat: { roomId: string; roomName: string };
  Discover: undefined;
};

type DiscoverScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Discover'>;
};

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await matrixService.searchAgents(searchQuery.trim());
      setAgents(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Failed', 'Could not search for agents');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleConnect = async (agent: Agent) => {
    setConnecting(agent.id);
    try {
      const room = await matrixService.startDirectChat(agent.id);
      if (room) {
        navigation.navigate('Chat', {
          roomId: room.roomId,
          roomName: agent.displayName,
        });
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Connection Failed', 'Could not start conversation with this agent');
    } finally {
      setConnecting(null);
    }
  };

  const renderAgentCard = ({ item }: { item: Agent }) => (
    <View style={styles.agentCard}>
      <Avatar 
        uri={item.avatarUrl} 
        name={item.displayName} 
        size={56}
        status={item.status}
      />
      <View style={styles.agentInfo}>
        <Text style={styles.agentName}>{item.displayName}</Text>
        <Text style={styles.agentId}>{item.id}</Text>
        {item.bio && (
          <Text style={styles.agentBio} numberOfLines={2}>{item.bio}</Text>
        )}
        {item.capabilities.length > 0 && (
          <View style={styles.capabilities}>
            {item.capabilities.slice(0, 3).map((cap, index) => (
              <View key={index} style={styles.capabilityBadge}>
                <Text style={styles.capabilityText}>{cap}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Button
        title={connecting === item.id ? '' : 'Connect'}
        onPress={() => handleConnect(item)}
        variant="outline"
        size="sm"
        loading={connecting === item.id}
        style={styles.connectButton}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Find Other Agents</Text>
      <Text style={styles.emptySubtitle}>
        Search by username or agent ID to discover and connect with other agents in the Matrix network.
      </Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤔</Text>
      <Text style={styles.emptyTitle}>No Agents Found</Text>
      <Text style={styles.emptySubtitle}>
        Try a different search term or check the spelling
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search agents by name or ID"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setAgents([]);
              }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Button
          title="Search"
          onPress={handleSearch}
          loading={loading}
          disabled={!searchQuery.trim()}
          style={styles.searchButton}
        />
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching the Matrix...</Text>
        </View>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(item) => item.id}
          renderItem={renderAgentCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchQuery && agents.length === 0 ? renderNoResults : renderEmptyState
          }
        />
      )}

      {/* Featured Section */}
      {!searchQuery && agents.length === 0 && (
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Quick Connect</Text>
          <Text style={styles.featuredSubtitle}>
            Enter a full Matrix ID to connect directly:
          </Text>
          <Text style={styles.exampleId}>@agent:matrix.org</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    paddingVertical: spacing.md,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  searchButton: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  listContent: {
    padding: spacing.md,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  agentInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  agentName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  agentId: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  agentBio: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  capabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  capabilityBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  capabilityText: {
    fontSize: fontSizes.xs,
    color: colors.primaryLight,
  },
  connectButton: {
    minWidth: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuredSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featuredSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exampleId: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default DiscoverScreen;
