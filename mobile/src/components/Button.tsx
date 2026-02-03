import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { colors, spacing, borderRadius, fontSizes } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.lg,
    };

    // Size styles
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.sm;
        base.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        base.paddingVertical = spacing.md + 4;
        base.paddingHorizontal = spacing.xl;
        break;
      default:
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.lg;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.surfaceLight;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      default:
        base.backgroundColor = colors.primary;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'sm':
        base.fontSize = fontSizes.sm;
        break;
      case 'lg':
        base.fontSize = fontSizes.lg;
        break;
      default:
        base.fontSize = fontSizes.md;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        base.color = colors.textPrimary;
        break;
      case 'outline':
      case 'ghost':
        base.color = colors.primary;
        break;
      default:
        base.color = '#FFFFFF';
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
