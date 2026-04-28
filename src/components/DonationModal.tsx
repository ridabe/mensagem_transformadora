import React from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { theme } from '../theme/theme';
import { checkDonationPixStatus, createDonationPix } from '../services/donationService';
import { clearPendingPix, getDonationState, savePendingPix } from '../storage/donationStorage';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconButton } from './IconButton';

type PixState = {
  id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  amountInCents: number;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
};

export type DonationModalProps = {
  visible: boolean;
  onClose: () => void;
  onDecline: () => void;
  onPaid: (amountInCents: number) => void;
};

type Step = 'select_amount' | 'pix';

const SUGGESTED_AMOUNTS = [500, 1000, 2000, 5000] as const;

function centsToReaisText(amountInCents: number): string {
  const reais = amountInCents / 100;
  const formatted = reais.toFixed(2).replace('.', ',');
  return `R$ ${formatted}`;
}

function parseReaisToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function normalizeQrUri(brCodeBase64: string): string {
  const trimmed = String(brCodeBase64 ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image')) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function isExpired(expiresAtIso: string): boolean {
  const ms = Date.parse(expiresAtIso);
  if (!Number.isFinite(ms)) return false;
  return ms <= Date.now();
}

export function DonationModal({ visible, onClose, onDecline, onPaid }: DonationModalProps) {
  const [step, setStep] = React.useState<Step>('select_amount');
  const [selectedAmountInCents, setSelectedAmountInCents] = React.useState<number | null>(null);
  const [otherValueText, setOtherValueText] = React.useState('');
  const [pix, setPix] = React.useState<PixState | null>(null);
  const [working, setWorking] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setErrorMessage(null);
    setWorking(false);
    getDonationState()
      .then((state) => {
        const hasPending =
          !!state.lastPixId &&
          !!state.lastPixStatus &&
          !!state.lastPixBrCode &&
          !!state.lastPixQrCodeBase64 &&
          !!state.lastPixExpiresAt &&
          typeof state.amountInCents === 'number';

        if (!hasPending) {
          setStep('select_amount');
          setPix(null);
          return;
        }

        const lastStatus = String(state.lastPixStatus);
        if (lastStatus !== 'PENDING' && lastStatus !== 'EXPIRED' && lastStatus !== 'CANCELLED' && lastStatus !== 'PAID') {
          setStep('select_amount');
          setPix(null);
          return;
        }

        const nextPix: PixState = {
          id: String(state.lastPixId),
          status: lastStatus as PixState['status'],
          amountInCents: Number(state.amountInCents),
          brCode: String(state.lastPixBrCode),
          brCodeBase64: String(state.lastPixQrCodeBase64),
          expiresAt: String(state.lastPixExpiresAt)
        };

        if (nextPix.status === 'PENDING' && isExpired(nextPix.expiresAt)) {
          const updated: PixState = { ...nextPix, status: 'EXPIRED' };
          savePendingPix(updated).catch(() => {});
          setPix(updated);
          setSelectedAmountInCents(updated.amountInCents);
          setStep('pix');
          return;
        }

        setPix(nextPix);
        setSelectedAmountInCents(nextPix.amountInCents);
        setStep('pix');
      })
      .catch(() => {
        setStep('select_amount');
        setPix(null);
      });
  }, [visible]);

  async function handleCopyPixCode() {
    if (!pix) return;
    try {
      await Clipboard.setStringAsync(pix.brCode);
      Alert.alert('Copiado', 'O código Pix foi copiado para a área de transferência.');
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o código Pix.');
    }
  }

  function resolveAmountInCents(): number | null {
    if (selectedAmountInCents != null) return selectedAmountInCents;
    return parseReaisToCents(otherValueText);
  }

  async function handleCreatePix() {
    const amountInCents = resolveAmountInCents();
    if (amountInCents == null) {
      setErrorMessage('Informe um valor válido.');
      return;
    }
    if (amountInCents < 500) {
      setErrorMessage('Valor mínimo: R$ 5,00.');
      return;
    }
    if (amountInCents > 50000) {
      setErrorMessage('Valor máximo: R$ 500,00.');
      return;
    }

    setErrorMessage(null);
    setWorking(true);
    try {
      const created = await createDonationPix(amountInCents);
      const nextPix: PixState = {
        id: created.id,
        status: created.status,
        amountInCents: created.amountInCents,
        brCode: created.brCode,
        brCodeBase64: created.brCodeBase64,
        expiresAt: created.expiresAt
      };
      await savePendingPix(nextPix);
      setPix(nextPix);
      setStep('pix');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Não foi possível processar a doação agora. Tente novamente em instantes.');
    } finally {
      setWorking(false);
    }
  }

  async function handleVerifyPix() {
    if (!pix) return;
    setErrorMessage(null);
    setWorking(true);
    try {
      const res = await checkDonationPixStatus(pix.id);
      if (res.status === 'PAID') {
        await savePendingPix({ ...pix, status: 'PAID' });
        Alert.alert('Obrigado!', 'Doação confirmada. Deus abençoe!');
        onPaid(pix.amountInCents);
        return;
      }

      if (res.status === 'PENDING') {
        Alert.alert(
          'Pagamento não identificado',
          'Ainda não identificamos o pagamento. Aguarde alguns instantes e tente verificar novamente.'
        );
        return;
      }

      if (res.status === 'EXPIRED') {
        const updated: PixState = { ...pix, status: 'EXPIRED' };
        await savePendingPix(updated);
        setPix(updated);
        Alert.alert('Pix expirou', 'Este Pix expirou. Gere um novo Pix para concluir a doação.');
        return;
      }

      if (res.status === 'CANCELLED') {
        const updated: PixState = { ...pix, status: 'CANCELLED' };
        await savePendingPix(updated);
        setPix(updated);
        Alert.alert('Cobrança cancelada', 'Esta cobrança foi cancelada. Gere um novo Pix para tentar novamente.');
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Não foi possível processar a doação agora. Tente novamente em instantes.');
    } finally {
      setWorking(false);
    }
  }

  async function handleGenerateNewPix() {
    if (pix) {
      await clearPendingPix();
      setPix(null);
    }
    setStep('select_amount');
  }

  function handleSelectSuggested(amountInCents: number) {
    setErrorMessage(null);
    setSelectedAmountInCents(amountInCents);
    setOtherValueText('');
  }

  function handleOtherValueChange(text: string) {
    setErrorMessage(null);
    setSelectedAmountInCents(null);
    setOtherValueText(text);
  }

  const canGenerateNew = pix?.status === 'EXPIRED' || pix?.status === 'CANCELLED';
  const showExpiresHint = pix?.status === 'PENDING' && isExpired(pix.expiresAt);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.backdrop}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <AppText variant="title" style={styles.title}>
              Ajude a manter o Mensagem Transformadora
            </AppText>
            <IconButton iconName="close" accessibilityLabel="Fechar" onPress={onDecline} />
          </View>

          {step === 'select_amount' ? (
            <>
              <AppText style={styles.paragraph} color={theme.colors.mutedText}>
                Este app nasceu para ajudar pessoas a registrarem, organizarem e revisitarem mensagens, pregações e
                estudos. Sua doação ajuda a manter o projeto ativo e evoluindo.
              </AppText>

              <AppText variant="subtitle" style={styles.sectionTitle}>
                Valores sugeridos
              </AppText>

              <View style={styles.amountGrid}>
                {SUGGESTED_AMOUNTS.map((amount) => {
                  const selected = selectedAmountInCents === amount;
                  return (
                    <Pressable
                      key={amount}
                      onPress={() => handleSelectSuggested(amount)}
                      style={({ pressed }) => [
                        styles.amountChip,
                        selected ? styles.amountChipSelected : null,
                        pressed ? styles.amountChipPressed : null
                      ]}
                      disabled={working}
                    >
                      <AppText style={selected ? styles.amountChipTextSelected : styles.amountChipText}>
                        {centsToReaisText(amount)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <AppText variant="subtitle" style={styles.sectionTitle}>
                Outro valor
              </AppText>

              <View style={styles.otherValueRow}>
                <AppText style={styles.currencyLabel}>R$</AppText>
                <TextInput
                  value={otherValueText}
                  onChangeText={handleOtherValueChange}
                  placeholder="0,00"
                  placeholderTextColor={theme.colors.mutedText}
                  keyboardType="numeric"
                  style={styles.otherValueInput}
                  editable={!working}
                />
              </View>

              {errorMessage ? (
                <AppText style={styles.errorText} color={theme.colors.danger}>
                  {errorMessage}
                </AppText>
              ) : null}

              <View style={styles.actions}>
                <AppButton
                  label={working ? 'Aguarde…' : 'Doar via Pix'}
                  iconName="qr-code-2"
                  onPress={() => handleCreatePix().catch(() => {})}
                  loading={working}
                  disabled={working}
                />
                <View style={styles.actionSpacer} />
                <AppButton label="Agora não" variant="ghost" onPress={onDecline} disabled={working} />
              </View>
            </>
          ) : pix ? (
            <>
              <AppText style={styles.paragraph} color={theme.colors.mutedText}>
                Valor: {centsToReaisText(pix.amountInCents)}
              </AppText>

              {showExpiresHint ? (
                <AppText style={styles.paragraph} color={theme.colors.danger}>
                  Este Pix parece ter expirado. Gere um novo Pix para concluir a doação.
                </AppText>
              ) : null}

              <View style={styles.qrWrap}>
                <Image
                  source={{ uri: normalizeQrUri(pix.brCodeBase64) }}
                  style={styles.qr}
                  resizeMode="contain"
                />
              </View>

              <AppText variant="subtitle" style={styles.sectionTitle}>
                Pix copia e cola
              </AppText>

              <View style={styles.codeBox}>
                <AppText style={styles.codeText} numberOfLines={4}>
                  {pix.brCode}
                </AppText>
              </View>

              {errorMessage ? (
                <AppText style={styles.errorText} color={theme.colors.danger}>
                  {errorMessage}
                </AppText>
              ) : null}

              <View style={styles.actions}>
                <AppButton
                  label="Copiar código Pix"
                  variant="secondary"
                  iconName="content-copy"
                  onPress={() => handleCopyPixCode().catch(() => {})}
                  disabled={working}
                />
                <View style={styles.actionSpacer} />
                <AppButton
                  label={working ? 'Verificando…' : 'Já paguei, verificar pagamento'}
                  iconName="check-circle"
                  onPress={() => handleVerifyPix().catch(() => {})}
                  loading={working}
                  disabled={working}
                />

                {canGenerateNew ? (
                  <>
                    <View style={styles.actionSpacer} />
                    <AppButton
                      label={working ? 'Aguarde…' : 'Gerar novo Pix'}
                      iconName="refresh"
                      onPress={() => handleGenerateNewPix().catch(() => {})}
                      disabled={working}
                    />
                  </>
                ) : null}

                <View style={styles.actionSpacer} />
                <AppButton label="Agora não" variant="ghost" onPress={onDecline} disabled={working} />
              </View>
            </>
          ) : (
            <View style={styles.actions}>
              <AppButton label="Voltar" variant="ghost" onPress={onClose} />
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    padding: theme.spacing.xl,
    justifyContent: 'center'
  },
  card: { padding: theme.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { flex: 1, paddingRight: theme.spacing.md },
  paragraph: { marginTop: theme.spacing.sm, lineHeight: 20 },
  sectionTitle: { marginTop: theme.spacing.lg },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  amountChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  amountChipPressed: { backgroundColor: '#00000008' },
  amountChipSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  amountChipText: { color: theme.colors.text },
  amountChipTextSelected: { color: theme.colors.primary },
  otherValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface
  },
  currencyLabel: { marginRight: theme.spacing.sm, color: theme.colors.mutedText },
  otherValueInput: {
    flex: 1,
    paddingVertical: 12,
    color: theme.colors.text
  },
  qrWrap: { marginTop: theme.spacing.lg, alignItems: 'center' },
  qr: { width: 220, height: 220 },
  codeBox: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface
  },
  codeText: { lineHeight: 18 },
  errorText: { marginTop: theme.spacing.md, lineHeight: 18 },
  actions: { marginTop: theme.spacing.lg },
  actionSpacer: { height: theme.spacing.sm }
});

