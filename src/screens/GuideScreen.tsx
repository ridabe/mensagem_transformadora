import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppText, Card, ScreenLayout } from '../components';
import { theme } from '../theme/theme';

export function GuideScreen() {
  return (
    <ScreenLayout title="Guia" scroll contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <MaterialIcons name="menu-book" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.heroText}>
          <AppText variant="title" style={styles.heroTitle}>
            Como usar o app
          </AppText>
          <AppText color="#EAF2FF" style={styles.heroSubtitle}>
            Instruções rápidas por tela, com pontos importantes destacados.
          </AppText>
        </View>
      </View>

      <View style={styles.noticeRow}>
        <InfoPill iconName="wifi-off" text="100% offline" tone="primary" />
        <View style={styles.noticeSpacer} />
        <InfoPill iconName="lock" text="Dados locais" tone="accent" />
        <View style={styles.noticeSpacer} />
        <InfoPill iconName="bolt" text="Rápido" tone="primary" />
      </View>

      <GuideSection
        title="Início"
        iconName="home"
        tone="primary"
        items={[
          'Use “Nova mensagem” para cadastrar uma anotação.',
          'Use “Ver histórico” para a lista completa.',
          'Toque nas últimas mensagens para abrir Detalhes.',
          'Use o ícone (i) para abrir “Sobre o aplicativo”.'
        ]}
      />

      <GuideSection
        title="Histórico"
        iconName="history"
        tone="accent"
        highlight="Dica: a busca filtra por título, pregador, igreja e versículos."
        items={[
          'Digite na busca para filtrar as mensagens.',
          'Toque em um card para abrir Detalhes.',
          'Use o botão + para criar uma nova mensagem.'
        ]}
      />

      <GuideSection
        title="Nova Mensagem"
        iconName="note-add"
        tone="primary"
        highlight="Campos obrigatórios: usuário, pregador, igreja, título e versículo base."
        items={[
          'Adicione/remova versículos secundários e pontos principais.',
          'Em “Frases marcantes”, escreva uma frase por linha.',
          'Toque em “Salvar” para gravar no SQLite.'
        ]}
      />

      <GuideSection
        title="Detalhes"
        iconName="article"
        tone="accent"
        items={[
          'Use os ícones do topo: favoritar, duplicar, excluir e editar.',
          'Role para ver versículos, pontos, frases e anotações.'
        ]}
      />

      <GuideSection
        title="Editar"
        iconName="edit"
        tone="primary"
        items={[
          'Edite os campos necessários e toque em “Salvar alterações”.',
          'Após salvar, você retorna para Detalhes.'
        ]}
      />

      <GuideSection
        title="Dashboard"
        iconName="insights"
        tone="accent"
        highlight="As métricas são calculadas localmente pelo SQLite."
        items={[
          'Veja total de mensagens e favoritos.',
          'Confira o gráfico dos últimos 7 dias e os rankings.'
        ]}
      />

      <GuideSection
        title="Sobre"
        iconName="info-outline"
        tone="primary"
        items={[
          'Exibe desenvolvedor, empresa, licença e versão do software.'
        ]}
      />
    </ScreenLayout>
  );
}

function GuideSection({
  title,
  iconName,
  items,
  highlight,
  tone
}: {
  title: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  items: string[];
  highlight?: string;
  tone: 'primary' | 'accent';
}) {
  const color = tone === 'primary' ? theme.colors.primary : theme.colors.accent;
  const soft = tone === 'primary' ? theme.colors.primarySoft : theme.colors.accentSoft;

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: color }]}>
          <MaterialIcons name={iconName} size={18} color="#FFFFFF" />
        </View>
        <AppText variant="subtitle" style={styles.cardTitle}>
          {title}
        </AppText>
      </View>

      {highlight ? (
        <View style={[styles.highlight, { backgroundColor: soft, borderColor: soft }]}>
          <MaterialIcons name="tips-and-updates" size={18} color={color} />
          <AppText style={styles.highlightText} color={theme.colors.text}>
            {highlight}
          </AppText>
        </View>
      ) : null}

      <View style={styles.list}>
        {items.map((text, idx) => (
          <View key={`${title}-${idx}`} style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: color }]} />
            <AppText style={styles.listText} color={theme.colors.mutedText}>
              {text}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function InfoPill({
  iconName,
  text,
  tone
}: {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  text: string;
  tone: 'primary' | 'accent';
}) {
  const bg = tone === 'primary' ? theme.colors.primarySoft : theme.colors.accentSoft;
  const color = tone === 'primary' ? theme.colors.primary : theme.colors.accent;

  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: bg }]}>
      <MaterialIcons name={iconName} size={16} color={color} />
      <AppText variant="caption" style={styles.pillText} color={color}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: theme.spacing.md, paddingBottom: 120 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: '#FFFFFF26',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroText: { flex: 1, paddingLeft: theme.spacing.md },
  heroTitle: { color: '#FFFFFF' },
  heroSubtitle: { marginTop: theme.spacing.sm },
  noticeRow: { flexDirection: 'row', marginTop: theme.spacing.md },
  noticeSpacer: { width: theme.spacing.sm },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1
  },
  pillText: { marginLeft: theme.spacing.sm },
  card: { marginTop: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: { marginLeft: theme.spacing.sm },
  highlight: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  highlightText: { marginLeft: theme.spacing.sm, flex: 1 },
  list: { marginTop: theme.spacing.md },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: theme.spacing.sm },
  bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: theme.spacing.sm },
  listText: { flex: 1 }
});

