import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppButton, AppText, Card, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { exportDatabaseBackup, importDatabaseBackup, listBackupHistory, type BackupHistoryItem } from '../services/backup';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Backup'>;

export function BackupScreen({ navigation }: Props) {
  const [status, setStatus] = React.useState<'loading' | 'ready'>('loading');
  const [items, setItems] = React.useState<BackupHistoryItem[]>([]);
  const [isWorking, setIsWorking] = React.useState(false);

  const load = React.useCallback(async () => {
    setStatus('loading');
    try {
      const data = await listBackupHistory(50);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setStatus('ready');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const handleExport = React.useCallback(async () => {
    if (isWorking) return;
    try {
      setIsWorking(true);
      await exportDatabaseBackup();
      await load();
      Alert.alert('Backup criado', 'O arquivo foi salvo na pasta escolhida.');
    } catch (e) {
      Alert.alert('Não foi possível criar o backup', getErrorMessage(e));
    } finally {
      setIsWorking(false);
    }
  }, [isWorking, load]);

  const handleImport = React.useCallback(() => {
    if (isWorking) return;
    Alert.alert(
      'Restaurar backup?',
      'Ao restaurar um backup, os dados atuais do app serão substituídos pelos dados do arquivo selecionado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsWorking(true);
              await importDatabaseBackup();
              await load();
              Alert.alert('Backup restaurado', 'Se necessário, feche e abra o app para atualizar todas as telas.');
              navigation.popToTop();
            } catch (e) {
              Alert.alert('Não foi possível restaurar', getErrorMessage(e));
            } finally {
              setIsWorking(false);
            }
          }
        }
      ]
    );
  }, [isWorking, load, navigation]);

  return (
    <ScreenLayout title="Backup" scroll contentStyle={styles.content}>
      <LinearGradient
        colors={['#071A3A', '#0B2E6F', '#0D47A1'] as const}
        start={{ x: 0.05, y: 0.05 }}
        end={{ x: 0.95, y: 0.95 }}
        style={styles.hero}
      >
        <View pointerEvents="none" style={styles.heroGold} />
        <View pointerEvents="none" style={styles.heroOrb} />
        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="cloud-upload" size={22} color="#FFFFFF" />
          </View>
          <AppText variant="title" style={styles.heroTitle}>
            Backup e Restauração
          </AppText>
        </View>
        <AppText style={styles.heroSubtitle} color="#FFFFFFB3">
          Exporte seus dados para um arquivo e restaure quando precisar reinstalar o app.
        </AppText>
      </LinearGradient>

      <Card style={styles.card}>
        <AppText variant="overline" color={theme.colors.mutedText}>
          Ações
        </AppText>
        <View style={styles.actions}>
          <AppButton
            label={isWorking ? 'Aguarde…' : 'Exportar backup'}
            onPress={handleExport}
            disabled={isWorking}
          />
          <View style={styles.actionSpacer} />
          <AppButton
            label={isWorking ? 'Aguarde…' : 'Importar backup'}
            variant="ghost"
            onPress={handleImport}
            disabled={isWorking}
          />
        </View>
        <AppText variant="caption" color={theme.colors.mutedText} style={styles.hint}>
          Dica: salve o arquivo em um local seguro (Google Drive, Downloads, cartão SD).
        </AppText>
      </Card>

      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Histórico</AppText>
        <Pressable onPress={load} disabled={status === 'loading' || isWorking} style={styles.refresh}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.primary} />
          <AppText variant="caption" style={styles.refreshText}>
            Atualizar
          </AppText>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Card>
          <AppText color={theme.colors.mutedText}>
            Nenhum backup registrado ainda. Crie seu primeiro backup para manter seus dados seguros.
          </AppText>
        </Card>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Card key={item.id} style={styles.listItem}>
              <View style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <MaterialIcons
                    name={item.kind === 'import' ? 'cloud-download' : 'cloud-upload'}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.itemMain}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {item.fileName}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.mutedText}>
                    {item.kind === 'import' ? 'Importado' : 'Exportado'} • {formatDateTime(item.createdAt)}
                  </AppText>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <AppButton label="Voltar" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenLayout>
  );
}

/**
 * Converte uma string ISO para uma data/hora legível (pt-BR).
 */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

/**
 * Normaliza erros desconhecidos em uma mensagem amigável.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro inesperado.';
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl
  },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md
  },
  heroGold: {
    position: 'absolute',
    left: -160,
    bottom: -180,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#D7B15A22'
  },
  heroOrb: {
    position: 'absolute',
    right: -90,
    top: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF10'
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF14',
    borderWidth: 1,
    borderColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  heroTitle: { color: '#FFFFFF' },
  heroSubtitle: { marginTop: theme.spacing.sm, lineHeight: 21 },
  card: { marginBottom: theme.spacing.xl },
  actions: { marginTop: theme.spacing.md },
  actionSpacer: { height: theme.spacing.sm },
  hint: { marginTop: theme.spacing.md, lineHeight: 18 },
  sectionHeader: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  refresh: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  refreshText: { marginLeft: theme.spacing.xs, color: theme.colors.primary },
  list: { gap: theme.spacing.sm },
  listItem: { paddingVertical: theme.spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  itemMain: { flex: 1 },
  footer: { marginTop: theme.spacing.xl }
});

