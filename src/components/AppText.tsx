import React from 'react';
import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import { theme } from '../theme/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

export type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        { color: color ?? theme.colors.text },
        theme.typography[variant],
        style
      ]}
    />
  );
}
