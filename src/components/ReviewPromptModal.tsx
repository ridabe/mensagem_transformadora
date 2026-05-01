import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { theme } from '../theme/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Card } from './Card';

export type ReviewPromptModalProps = {
  visible: boolean;
  isWorking?: boolean;
  onReviewNow: () => void;
  onReviewLater: () => void;
  onAlreadyReviewed?: () => void;
};

export function ReviewPromptModal({
  visible,
  isWorking,
  onReviewNow,
  onReviewLater,
  onAlreadyReviewed
}: ReviewPromptModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReviewLater}
    >
      <View style={styles.backdrop}>
        <Card style={styles.card}>
          <AppText variant="title" style={styles.title}>
            Está gostando do app?
          </AppText>
          <AppText style={styles.subtitle} color={theme.colors.mutedText}>
            Sua avaliação na Play Store ajuda muito a manter o projeto evoluindo.
          </AppText>

          <View style={styles.actions}>
            <AppButton label="Avaliar agora" onPress={onReviewNow} loading={isWorking} disabled={!!isWorking} />
            <View style={styles.actionSpacer} />
            <AppButton
              label="Lembrar depois"
              variant="ghost"
              onPress={onReviewLater}
              disabled={!!isWorking}
            />
            {onAlreadyReviewed ? (
              <>
                <View style={styles.actionSpacerSm} />
                <AppButton
                  label="Já avaliei"
                  variant="ghost"
                  onPress={onAlreadyReviewed}
                  disabled={!!isWorking}
                />
              </>
            ) : null}
          </View>

          <AppText variant="caption" color={theme.colors.mutedText} style={styles.hint}>
            Observação: a Play Store pode não exibir o diálogo de avaliação em todas as tentativas.
          </AppText>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
    padding: theme.spacing.xl,
    justifyContent: 'center'
  },
  card: { padding: theme.spacing.xl },
  title: { marginBottom: theme.spacing.sm },
  subtitle: { lineHeight: 20 },
  actions: { marginTop: theme.spacing.lg },
  actionSpacer: { height: theme.spacing.sm },
  actionSpacerSm: { height: theme.spacing.xs },
  hint: { marginTop: theme.spacing.lg, lineHeight: 16 }
});

