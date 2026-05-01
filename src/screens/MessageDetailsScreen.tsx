import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Linking, Share, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import { AppButton, Card, IconButton, ReviewPromptModal, ScreenLayout } from '../components';
import { useInAppReview } from '../hooks/useInAppReview';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import { shareSermonNoteAsPdf } from '../services/pdf';
import { getPublishErrorMessage, PublishError, publishSermonToWeb } from '../services/webPublicationService';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import type { SermonNote } from '../types/sermon';

type Props = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const WEB_PUBLISH_ENABLED = false;

export function MessageDetailsScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [note, setNote] = React.useState<SermonNote | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not_found'>('loading');
  const [isWorking, setIsWorking] = React.useState(false);
  const { requestPrompt, visible, isWorking: isReviewWorking, handleReviewNow, handleReviewLater, handleAlreadyReviewed } =
    useInAppReview();

  React.useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    sermonNoteRepository
      .getById(id)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNote(null);
          setStatus('not_found');
          return;
        }
        setNote(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setNote(null);
        setStatus('not_found');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reloadNote() {
    const result = await sermonNoteRepository.getById(id);
    if (!result) {
      setNote(null);
      setStatus('not_found');
      return;
    }
    setNote(result);
    setStatus('ready');
  }

  async function handleToggleFavorite() {
    if (!note || isWorking) return;
    const updatedAt = new Date().toISOString();
    const next = !note.favorite;

    try {
      setIsWorking(true);
      await sermonNoteRepository.setFavorite(note.id, next, updatedAt);
      setNote({ ...note, favorite: next, updatedAt });
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDuplicate() {
    if (!note || isWorking) return;
    try {
      setIsWorking(true);
      const newId = await sermonNoteRepository.duplicate(note.id);
      navigation.replace('Details', { id: newId });
    } catch {
      Alert.alert('Erro', 'Não foi possível duplicar a mensagem.');
      setIsWorking(false);
    }
  }

  async function handleExportPdf() {
    if (!note || isWorking) return;
    try {
      setIsWorking(true);
      await shareSermonNoteAsPdf(note);
      requestPrompt('positive_action').catch(() => {});
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleRequestPublish() {
    if (!note || isWorking) return;
    Alert.alert(
      'Publicar mensagem no site?',
      'Sua mensagem será enviada para a plataforma web e poderá ser acessada por link. Nada é publicado automaticamente sem sua confirmação.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Publicar', onPress: () => handlePublishNow().catch(() => {}) }
      ]
    );
  }

  async function handlePublishNow() {
    if (!note || isWorking) return;
    const nowIso = new Date().toISOString();

    try {
      setIsWorking(true);
      const res = await publishSermonToWeb(note);
      await sermonNoteRepository.setWebPublicationSuccess(note.id, res, nowIso);
      await reloadNote();

      Alert.alert('Publicado no site', 'Sua mensagem foi publicada com sucesso.', [
        {
          text: 'Copiar link',
          onPress: () => {
            if (res.url) {
              Clipboard.setStringAsync(res.url).catch(() => {});
              Alert.alert('Link copiado', 'O link foi copiado para a área de transferência.');
            }
          }
        },
        {
          text: 'Compartilhar',
          onPress: () => {
            if (res.url) {
              Share.share({ message: res.url }).catch(() => {});
            }
          }
        },
        { text: 'OK' }
      ]);
    } catch (e) {
      if (e instanceof PublishError && e.kind === 'missing_required_fields') {
        Alert.alert('Campos obrigatórios', e.message);
        return;
      }

      const message = getPublishErrorMessage(e);
      await sermonNoteRepository.setWebPublicationError(note.id, message, nowIso);
      await reloadNote();
      Alert.alert('Não foi possível publicar', message);
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCopyWebLink() {
    if (!note?.webUrl) return;
    await Clipboard.setStringAsync(note.webUrl);
    Alert.alert('Link copiado', 'O link foi copiado para a área de transferência.');
  }

  async function handleShareWebLink() {
    if (!note?.webUrl) return;
    await Share.share({ message: note.webUrl });
  }

  async function handleOpenWebLink() {
    if (!note?.webUrl) return;
    await Linking.openURL(note.webUrl);
  }
  function handleDelete() {
    if (!note || isWorking) return;

    Alert.alert('Excluir mensagem', 'Tem certeza que deseja excluir esta mensagem? Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsWorking(true);
            await sermonNoteRepository.remove(note.id);
            navigation.popToTop();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a mensagem.');
          } finally {
            setIsWorking(false);
          }
        }
      }
    ]);
  }

  const headerActions = (
    <View style={styles.headerActions}>
      <IconButton
        iconName={note?.favorite ? 'star' : 'star-border'}
        accessibilityLabel={note?.favorite ? 'Desfavoritar' : 'Favoritar'}
        onPress={handleToggleFavorite}
        disabled={status !== 'ready' || !note || isWorking}
        color={note?.favorite ? theme.colors.primary : theme.colors.text}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="content-copy"
        accessibilityLabel="Duplicar"
        onPress={handleDuplicate}
        disabled={status !== 'ready' || !note || isWorking}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="picture-as-pdf"
        accessibilityLabel="Exportar PDF"
        onPress={handleExportPdf}
        disabled={status !== 'ready' || !note || isWorking}
        color={theme.colors.primary}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="delete"
        accessibilityLabel="Excluir"
        onPress={handleDelete}
        disabled={status !== 'ready' || !note || isWorking}
        color={theme.colors.danger}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="edit"
        accessibilityLabel="Editar"
        onPress={() => navigation.navigate('Edit', { id })}
        disabled={status !== 'ready' || isWorking}
      />
    </View>
  );

  return (
    <ScreenLayout
      title="Detalhes"
      scroll
      rightHeader={headerActions}
    >
      {status === 'loading' ? (
        <Card>
          <AppText variant="subtitle">Carregando...</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            ID: {id}
          </AppText>
        </Card>
      ) : status === 'not_found' ? (
        <Card>
          <AppText variant="subtitle">Mensagem não encontrada</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            ID: {id}
          </AppText>
        </Card>
      ) : note ? (
        <View>
          <LinearGradient
            colors={[theme.colors.brand, theme.colors.brandSoft, theme.colors.primary] as const}
            start={{ x: 0.05, y: 0.05 }}
            end={{ x: 0.95, y: 0.95 }}
            style={styles.hero}
          >
            <View pointerEvents="none" style={styles.heroOrb} />
            <AppText variant="overline" style={styles.heroKicker}>
              DETALHES DA MENSAGEM
            </AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {note.sermonTitle}
            </AppText>
            <AppText style={styles.heroMeta} color={theme.colors.onBrandSoft}>
              {note.preacherName} • {note.churchName}
            </AppText>
            <AppText style={styles.heroMeta} color={theme.colors.onBrandSoft}>
              {note.sermonDate}
              {note.sermonTime ? ` • ${note.sermonTime}` : ''}
            </AppText>
            <AppText style={styles.heroVerse} color={theme.colors.onBrand}>
              <AppText variant="caption" color={theme.colors.onBrandSoft}>
                Versículo base:{' '}
              </AppText>
              {note.mainVerse}
            </AppText>
            <AppText variant="caption" style={styles.heroId} color={theme.colors.onBrandSoft}>
              ID: {note.id}
            </AppText>
          </LinearGradient>

          <View style={styles.section}>
            <Card>
              <AppText variant="subtitle">Publicação no site</AppText>

              {(note.webPublishStatus ?? 'local_only') === 'published' ? (
                <View style={styles.publishBlock}>
                  <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                    Publicado no site.
                  </AppText>
                  {note.webUrl ? (
                    <AppText color={theme.colors.primary} style={styles.paragraph} numberOfLines={2}>
                      {note.webUrl}
                    </AppText>
                  ) : null}
                  <View style={styles.publishActions}>
                    <AppButton
                      label="Copiar link"
                      variant="secondary"
                      iconName="content-copy"
                      onPress={() => handleCopyWebLink().catch(() => {})}
                      disabled={isWorking || !note.webUrl}
                    />
                    <View style={styles.actionSpacer} />
                    <AppButton
                      label="Compartilhar"
                      variant="ghost"
                      iconName="share"
                      onPress={() => handleShareWebLink().catch(() => {})}
                      disabled={isWorking || !note.webUrl}
                    />
                    <View style={styles.actionSpacer} />
                    <AppButton
                      label="Abrir no navegador"
                      variant="ghost"
                      iconName="open-in-browser"
                      onPress={() => handleOpenWebLink().catch(() => {})}
                      disabled={isWorking || !note.webUrl}
                    />
                  </View>
                </View>
              ) : (note.webPublishStatus ?? 'local_only') === 'publish_error' ? (
                <View style={styles.publishBlock}>
                  <AppText color={theme.colors.danger} style={styles.paragraph}>
                    Falha na publicação.
                  </AppText>
                  {note.webLastError ? (
                    <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                      {note.webLastError}
                    </AppText>
                  ) : null}
                  {WEB_PUBLISH_ENABLED ? (
                    <View style={styles.publishActions}>
                      <AppButton
                        label={isWorking ? 'Aguarde…' : 'Tentar novamente'}
                        iconName="cloud-upload"
                        onPress={handleRequestPublish}
                        disabled={isWorking}
                      />
                    </View>
                  ) : (
                    <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                      A publicação no site está desativada nesta versão do app.
                    </AppText>
                  )}
                </View>
              ) : (note.webPublishStatus ?? 'local_only') === 'updated_locally' ? (
                <View style={styles.publishBlock}>
                  <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                    Esta mensagem foi alterada após a publicação. Publique novamente para atualizar no site.
                  </AppText>
                  {WEB_PUBLISH_ENABLED ? (
                    <View style={styles.publishActions}>
                      <AppButton
                        label={isWorking ? 'Aguarde…' : 'Publicar novamente'}
                        iconName="cloud-upload"
                        onPress={handleRequestPublish}
                        disabled={isWorking}
                      />
                    </View>
                  ) : (
                    <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                      A publicação no site está desativada nesta versão do app.
                    </AppText>
                  )}
                </View>
              ) : (
                <View style={styles.publishBlock}>
                  <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                    Envie esta mensagem para a plataforma web para gerar um link compartilhável.
                  </AppText>
                  {WEB_PUBLISH_ENABLED ? (
                    <View style={styles.publishActions}>
                      <AppButton
                        label={isWorking ? 'Aguarde…' : 'Publicar no site'}
                        iconName="cloud-upload"
                        onPress={handleRequestPublish}
                        disabled={isWorking}
                      />
                    </View>
                  ) : (
                    <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                      A publicação no site está desativada nesta versão do app.
                    </AppText>
                  )}
                </View>
              )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Versículos secundários</AppText>
            {note.secondaryVerses.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Nenhum.
              </AppText>
            ) : (
              <View style={styles.list}>
                {note.secondaryVerses.map((v, idx) => (
                  <AppText key={`${note.id}-sv-${idx}`} style={idx === 0 ? styles.listItemFirst : styles.listItem}>
                    • {v}
                  </AppText>
                ))}
              </View>
            )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Pontos principais</AppText>
            {note.keyPoints.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Nenhum.
              </AppText>
            ) : (
              <View style={styles.list}>
                {note.keyPoints.map((p) => (
                  <View key={p.id} style={styles.point}>
                    <AppText variant="subtitle">{p.order}. {p.title || 'Sem título'}</AppText>
                    {p.content ? <AppText style={styles.paragraph}>{p.content}</AppText> : null}
                  </View>
                ))}
              </View>
            )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
              <AppText variant="subtitle">Frases marcantes</AppText>
              {note.highlightedPhrases.length === 0 ? (
                <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                  Nenhuma.
                </AppText>
              ) : (
                <View style={styles.list}>
                  {note.highlightedPhrases.map((p, idx) => (
                    <AppText key={`${note.id}-hp-${idx}`} style={idx === 0 ? styles.listItemFirst : styles.listItem}>
                      • {p}
                    </AppText>
                  ))}
                </View>
              )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Anotações</AppText>
            {note.introduction ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Introdução
                </AppText>
                <AppText style={styles.paragraph}>{note.introduction}</AppText>
              </View>
            ) : null}
            {note.personalObservations ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Observações pessoais
                </AppText>
                <AppText style={styles.paragraph}>{note.personalObservations}</AppText>
              </View>
            ) : null}
            {note.practicalApplications ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Aplicações práticas
                </AppText>
                <AppText style={styles.paragraph}>{note.practicalApplications}</AppText>
              </View>
            ) : null}
            {note.conclusion ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Conclusão
                </AppText>
                <AppText style={styles.paragraph}>{note.conclusion}</AppText>
              </View>
            ) : null}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Resumo final</AppText>
            {note.finalSummary ? (
              <AppText style={styles.paragraph}>{note.finalSummary}</AppText>
            ) : (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Em branco.
              </AppText>
            )}
            </Card>
          </View>
        </View>
      ) : null}

      <ReviewPromptModal
        visible={visible}
        isWorking={isReviewWorking}
        onReviewNow={() => handleReviewNow().catch(() => {})}
        onReviewLater={() => handleReviewLater().catch(() => {})}
        onAlreadyReviewed={() => handleAlreadyReviewed().catch(() => {})}
      />

      <View style={styles.actions}>
        <AppButton label="Voltar" variant="ghost" onPress={() => navigation.goBack()} disabled={isWorking} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  paragraph: { marginTop: theme.spacing.sm },
  section: { marginTop: theme.spacing.md },
  list: { marginTop: theme.spacing.sm },
  listItemFirst: { marginTop: 0 },
  listItem: { marginTop: theme.spacing.xs },
  point: { paddingVertical: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  block: { marginTop: theme.spacing.md },
  actions: { marginTop: theme.spacing.md },
  actionSpacer: { height: theme.spacing.sm },
  publishActions: { marginTop: theme.spacing.md },
  publishBlock: { marginTop: theme.spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerSpacer: { width: 4 },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    ...theme.shadow.md
  },
  heroOrb: {
    position: 'absolute',
    right: -90,
    top: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.onBrandOverlay
  },
  heroKicker: { color: theme.colors.onBrandSoft },
  heroTitle: { color: theme.colors.onBrand, marginTop: theme.spacing.sm },
  heroMeta: { marginTop: theme.spacing.sm },
  heroVerse: { marginTop: theme.spacing.md },
  heroId: { marginTop: theme.spacing.md }
});
