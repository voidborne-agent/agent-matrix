import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../utils/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  status?: 'online' | 'offline' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  uri, 
  name, 
  size = 48,
  status 
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const statusColors = {
    online: colors.accent,
    offline: colors.textMuted,
    busy: colors.warning,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image 
          source={{ uri }} 
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} 
        />
      ) : (
        <View 
          style={[
            styles.placeholder, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: getColorFromName(name),
            }
          ]}
        >
          <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
            {initials}
          </Text>
        </View>
      )}
      {status && (
        <View 
          style={[
            styles.statusIndicator, 
            { 
              backgroundColor: statusColors[status],
              width: size / 4,
              height: size / 4,
              borderRadius: size / 8,
            }
          ]} 
        />
      )}
    </View>
  );
};

const getColorFromName = (name: string): string => {
  const colors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', 
    '#F59E0B', '#22C55E', '#14B8A6', '#3B82F6'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

export default Avatar;
