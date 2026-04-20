import React from 'react';
import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';

export type IconButtonProps = PressableProps & {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  accessibilityLabel: string;
  color?: string;
};

export function IconButton({ iconName, accessibilityLabel, color, style, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null, style]}
      hitSlop={10}
    >
      <MaterialIcons name={iconName} size={22} color={color ?? theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: { backgroundColor: '#00000008' }
});
