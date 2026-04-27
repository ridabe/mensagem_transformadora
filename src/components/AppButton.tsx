import React from 'react';
import type { PressableProps, PressableStateCallbackType } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';
import { AppText } from './AppText';

export type AppButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'light' | 'outlineLight';
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
};

export function AppButton({ label, variant = 'primary', iconName, disabled, style: outerStyle, ...props }: AppButtonProps) {
  const styles = getStyles(variant);
  const iconColor = getIconColor(variant);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => {
        const resolvedStyle = typeof outerStyle === 'function' ? outerStyle(state) : outerStyle;

        return [
          styles.button,
          state.pressed && !disabled ? styles.buttonPressed : null,
          disabled ? styles.buttonDisabled : null,
          resolvedStyle
        ];
      }}
    >
      <View style={styles.content}>
        {iconName ? <MaterialIcons name={iconName} size={18} color={iconColor} style={styles.icon} /> : null}
        <AppText variant="subtitle" style={styles.label}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

function getStyles(variant: NonNullable<AppButtonProps['variant']>) {
  const base = StyleSheet.create({
    button: {
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1
    },
    buttonPressed: {},
    buttonDisabled: { opacity: 0.5 },
    content: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: theme.spacing.sm },
    label: {}
  });

  if (variant === 'ghost') {
    return StyleSheet.create({
      ...base,
      button: { ...base.button, backgroundColor: 'transparent', borderColor: theme.colors.border },
      buttonPressed: { backgroundColor: '#00000008' },
      label: { color: theme.colors.text }
    });
  }

  if (variant === 'outlineLight') {
    return StyleSheet.create({
      ...base,
      button: { ...base.button, backgroundColor: 'transparent', borderColor: '#FFFFFFB3' },
      buttonPressed: { backgroundColor: '#FFFFFF1A', borderColor: '#FFFFFFCC' },
      label: { color: '#FFFFFF' }
    });
  }

  if (variant === 'light') {
    return StyleSheet.create({
      ...base,
      button: { ...base.button, backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
      buttonPressed: { backgroundColor: '#FFFFFFE6', borderColor: '#FFFFFFE6' },
      label: { color: theme.colors.primary }
    });
  }

  if (variant === 'danger') {
    return StyleSheet.create({
      ...base,
      button: { ...base.button, backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
      buttonPressed: { backgroundColor: theme.colors.dangerPressed, borderColor: theme.colors.dangerPressed },
      label: { color: '#FFFFFF' }
    });
  }

  if (variant === 'secondary') {
    return StyleSheet.create({
      ...base,
      button: { ...base.button, backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primarySoft },
      buttonPressed: { backgroundColor: '#D7E7FF', borderColor: '#D7E7FF' },
      label: { color: theme.colors.primary }
    });
  }

  return StyleSheet.create({
    ...base,
    button: { ...base.button, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    buttonPressed: { backgroundColor: theme.colors.primaryPressed, borderColor: theme.colors.primaryPressed },
    label: { color: '#FFFFFF' }
  });
}

function getIconColor(variant: NonNullable<AppButtonProps['variant']>) {
  if (variant === 'primary' || variant === 'danger' || variant === 'outlineLight') return '#FFFFFF';
  if (variant === 'light' || variant === 'secondary') return theme.colors.primary;
  return theme.colors.text;
}
