import React from 'react';
import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';

export type FabProps = PressableProps & {
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
};

export function Fab({ iconName = 'add', style, ...props }: FabProps) {
  return (
    <Pressable
      {...props}
      style={(state) => {
        const baseStyle = [styles.fab, state.pressed ? styles.fabPressed : null];
        const resolvedUserStyle = typeof style === 'function' ? style(state) : style;
        return [...baseStyle, resolvedUserStyle];
      }}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name={iconName} size={26} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  fabPressed: {
    backgroundColor: theme.colors.primaryPressed
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
