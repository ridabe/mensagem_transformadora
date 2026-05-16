import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import bibleData from '../data/bible-structure.json';
import { theme } from '../theme/theme';
import { AppText } from './AppText';

type BibleBook = {
  id: number;
  name: string;
  abbrev: string;
  testament: 'AT' | 'NT';
  chapters: number[];
};

type VerseMode = 'single' | 'range' | 'multiple';
type Step = 'book' | 'chapter' | 'verse';

export type BibleVerseSelectorProps = {
  value: string;
  onChange: (verse: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const books = bibleData.books as BibleBook[];

const SECTIONS_AT = { title: 'Antigo Testamento', data: books.filter((b) => b.testament === 'AT') };
const SECTIONS_NT = { title: 'Novo Testamento', data: books.filter((b) => b.testament === 'NT') };

function buildOutput(
  book: BibleBook,
  chapter: number,
  mode: VerseMode,
  single: number | null,
  rangeStart: number | null,
  rangeEnd: number | null,
  multi: number[]
): string {
  const base = `${book.name} ${chapter}:`;
  if (mode === 'single' && single) return `${base}${single}`;
  if (mode === 'range' && rangeStart && rangeEnd) return `${base}${rangeStart}-${rangeEnd}`;
  if (mode === 'multiple' && multi.length > 0) return `${base}${[...multi].sort((a, b) => a - b).join(',')}`;
  return '';
}

export function BibleVerseSelector({ value, onChange, placeholder = 'Selecionar versículo', disabled = false }: BibleVerseSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('book');
  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [mode, setMode] = useState<VerseMode>('single');
  const [single, setSingle] = useState<number | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const sections = useMemo(() => {
    if (!search.trim()) return [SECTIONS_AT, SECTIONS_NT];
    const q = search.toLowerCase();
    const at = SECTIONS_AT.data.filter((b) => b.name.toLowerCase().includes(q) || b.abbrev.toLowerCase().includes(q));
    const nt = SECTIONS_NT.data.filter((b) => b.name.toLowerCase().includes(q) || b.abbrev.toLowerCase().includes(q));
    return [
      ...(at.length > 0 ? [{ title: 'Antigo Testamento', data: at }] : []),
      ...(nt.length > 0 ? [{ title: 'Novo Testamento', data: nt }] : [])
    ];
  }, [search]);

  const verseCount = book && chapter ? book.chapters[chapter - 1] : 0;
  const verseNumbers = useMemo(() => Array.from({ length: verseCount }, (_, i) => i + 1), [verseCount]);

  const preview = book && chapter ? buildOutput(book, chapter, mode, single, rangeStart, rangeEnd, multi) : '';
  const canConfirm = preview.length > 0;

  function open() {
    if (disabled) return;
    setStep('book');
    setSearch('');
    setBook(null);
    setChapter(null);
    setMode('single');
    setSingle(null);
    setRangeStart(null);
    setRangeEnd(null);
    setMulti([]);
    setVisible(true);
  }

  function handleBook(b: BibleBook) {
    setBook(b);
    setChapter(null);
    setSingle(null);
    setRangeStart(null);
    setRangeEnd(null);
    setMulti([]);
    setStep('chapter');
  }

  function handleChapter(c: number) {
    setChapter(c);
    setSingle(null);
    setRangeStart(null);
    setRangeEnd(null);
    setMulti([]);
    setStep('verse');
  }

  function handleVersePress(v: number) {
    if (mode === 'single') {
      setSingle(v);
    } else if (mode === 'range') {
      if (rangeStart === null) {
        setRangeStart(v);
        setRangeEnd(null);
      } else if (rangeEnd === null && v !== rangeStart) {
        const [s, e] = v < rangeStart ? [v, rangeStart] : [rangeStart, v];
        setRangeStart(s);
        setRangeEnd(e);
      } else {
        setRangeStart(v);
        setRangeEnd(null);
      }
    } else {
      setMulti((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
    }
  }

  function isSelected(v: number): boolean {
    if (mode === 'single') return single === v;
    if (mode === 'range') {
      if (rangeStart && rangeEnd) return v >= rangeStart && v <= rangeEnd;
      return v === rangeStart;
    }
    return multi.includes(v);
  }

  function switchMode(m: VerseMode) {
    setMode(m);
    setSingle(null);
    setRangeStart(null);
    setRangeEnd(null);
    setMulti([]);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onChange(preview);
    setVisible(false);
  }

  function handleClear() {
    onChange('');
    setVisible(false);
  }

  function handleBack() {
    if (step === 'verse') setStep('chapter');
    else if (step === 'chapter') setStep('book');
  }

  const stepTitle: Record<Step, string> = {
    book: 'Selecionar livro',
    chapter: book ? `${book.name} — capítulo` : 'Selecionar capítulo',
    verse: book && chapter ? `${book.name} ${chapter} — versículo` : 'Selecionar versículo'
  };

  const rangeHint =
    rangeStart === null
      ? 'Toque no versículo inicial'
      : rangeEnd === null
        ? `De ${rangeStart} — toque no versículo final`
        : `Intervalo: ${rangeStart}–${rangeEnd}`;

  const multiHint =
    multi.length === 0
      ? 'Toque para selecionar versículos'
      : `Selecionados: ${[...multi].sort((a, b) => a - b).join(', ')}`;

  return (
    <>
      <Pressable
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={value || placeholder}
      >
        <AppText
          variant="body"
          style={value ? styles.fieldValue : styles.fieldPlaceholder}
          numberOfLines={1}
        >
          {value || placeholder}
        </AppText>
        <Ionicons name="book-outline" size={16} color={theme.colors.mutedText} />
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            {step !== 'book' ? (
              <TouchableOpacity onPress={handleBack} style={styles.headerBtn} hitSlop={8}>
                <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBtn} />
            )}
            <AppText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {stepTitle[step]}
            </AppText>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.colors.mutedText} />
            </TouchableOpacity>
          </View>

          {/* Step: Book */}
          {step === 'book' && (
            <View style={styles.stepContainer}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={16} color={theme.colors.mutedText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar livro..."
                  placeholderTextColor={theme.colors.mutedText}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>
              <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section }) => (
                  <View style={styles.sectionHeader}>
                    <AppText variant="overline" style={styles.sectionHeaderText}>
                      {section.title}
                    </AppText>
                  </View>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.bookRow} onPress={() => handleBook(item)}>
                    <View style={styles.bookAbbrevBadge}>
                      <AppText variant="caption" style={styles.bookAbbrev}>
                        {item.abbrev}
                      </AppText>
                    </View>
                    <AppText variant="body" style={styles.bookName}>
                      {item.name}
                    </AppText>
                    <AppText variant="caption" style={styles.bookChapters}>
                      {item.chapters.length} cap.
                    </AppText>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.mutedText} />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Step: Chapter */}
          {step === 'chapter' && book && (
            <FlatList
              data={book.chapters.map((_, i) => i + 1)}
              keyExtractor={(item) => String(item)}
              numColumns={5}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.numCell} onPress={() => handleChapter(item)}>
                  <AppText variant="body" style={styles.numText}>
                    {item}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Step: Verse */}
          {step === 'verse' && book && chapter && (
            <View style={styles.stepContainer}>
              {/* Mode tabs */}
              <View style={styles.modeTabs}>
                {(['single', 'range', 'multiple'] as VerseMode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeTab, mode === m && styles.modeTabActive]}
                    onPress={() => switchMode(m)}
                  >
                    <AppText variant="caption" style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
                      {m === 'single' ? 'Único' : m === 'range' ? 'Intervalo' : 'Múltiplos'}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {mode === 'range' && (
                <AppText variant="caption" style={styles.hint}>
                  {rangeHint}
                </AppText>
              )}
              {mode === 'multiple' && (
                <AppText variant="caption" style={styles.hint}>
                  {multiHint}
                </AppText>
              )}

              <FlatList
                data={verseNumbers}
                keyExtractor={(item) => String(item)}
                numColumns={5}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.numCell, isSelected(item) && styles.numCellSelected]}
                    onPress={() => handleVersePress(item)}
                  >
                    <AppText
                      variant="body"
                      style={[styles.numText, isSelected(item) && styles.numTextSelected]}
                    >
                      {item}
                    </AppText>
                  </TouchableOpacity>
                )}
              />

              {/* Footer */}
              <View style={styles.footer}>
                {value ? (
                  <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                    <AppText variant="caption" style={styles.clearBtnText}>
                      Remover
                    </AppText>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
                  onPress={handleConfirm}
                  disabled={!canConfirm}
                >
                  <AppText variant="caption" style={styles.confirmBtnText} numberOfLines={1}>
                    {canConfirm ? `Confirmar: ${preview}` : 'Selecione um versículo'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00000014',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    gap: theme.spacing.sm
  },
  fieldDisabled: { opacity: 0.7 },
  fieldValue: { flex: 1, color: theme.colors.text },
  fieldPlaceholder: { flex: 1, color: theme.colors.mutedText },

  modal: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? 36 : 0
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerBtn: { width: 36, alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: theme.colors.text },

  stepContainer: { flex: 1 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md
  },
  searchIcon: { marginRight: theme.spacing.xs },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 15
  },

  listContent: { paddingBottom: theme.spacing.xl },
  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  sectionHeaderText: { color: theme.colors.mutedText },

  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm
  },
  bookAbbrevBadge: {
    width: 36,
    alignItems: 'center',
    backgroundColor: theme.colors.primaryExtraSoft,
    borderRadius: theme.radius.sm,
    paddingVertical: 2
  },
  bookAbbrev: { color: theme.colors.primary },
  bookName: { flex: 1, color: theme.colors.text },
  bookChapters: { color: theme.colors.mutedText },

  gridContent: {
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.xl
  },
  numCell: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  numCellSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  numText: { color: theme.colors.text },
  numTextSelected: { color: '#FFFFFF', fontWeight: '600' },

  modeTabs: {
    flexDirection: 'row',
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden'
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surface
  },
  modeTabActive: { backgroundColor: theme.colors.primary },
  modeTabText: { color: theme.colors.mutedText },
  modeTabTextActive: { color: '#FFFFFF' },

  hint: {
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md
  },

  footer: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  clearBtnText: { color: theme.colors.danger },
  confirmBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center'
  },
  confirmBtnDisabled: { backgroundColor: theme.colors.border },
  confirmBtnText: { color: '#FFFFFF' }
});
