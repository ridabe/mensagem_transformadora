import React from 'react';
import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';

export type IconButtonProps = PressableProps & {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  accessibilityLabel: string;
  color?: string;
  variant?: 'default' | 'brand';
};

export function IconButton({ iconName, accessibilityLabel, color, variant = 'default', style, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      style={(state) => {
        const baseStyle = [
          styles.button,
          variant === 'brand' ? styles.buttonBrand : null,
          state.pressed ? (variant === 'brand' ? styles.pressedBrand : styles.pressed) : null
        ];
        const resolvedUserStyle = typeof style === 'function' ? style(state) : style;
        return [...baseStyle, resolvedUserStyle];
      }}
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
  buttonBrand: {
    backgroundColor: '#FFFFFF14',
    borderWidth: 1,
    borderColor: '#FFFFFF26'
  },
  pressed: { backgroundColor: '#00000008' },
  pressedBrand: { backgroundColor: '#FFFFFF22', borderColor: '#FFFFFF40' }
});
