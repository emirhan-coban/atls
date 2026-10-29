import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { FileText, Image as ImageIcon, Lock, X } from 'lucide-react-native';
import Chip from './ui/Chip';
import Sheet from './ui/Sheet';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { lt } from '../localization/planner';
import {
  addImageDocument,
  addPdfDocument,
  canProtectDocuments,
  loadVault,
  MAX_DOCS_PER_PLAN,
  removeDocument,
  unlockVault,
  vaultFileUri,
  VaultDoc,
} from '../utils/vault';

interface DocumentVaultProps {
  planId: string;
  currentLang: 'tr' | 'en';
}

/** Tickets, visas and insurance for one plan. Stored on the device only and opened behind Face ID / passcode. */
export default function DocumentVault({ planId, currentLang }: DocumentVaultProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [preview, setPreview] = useState<VaultDoc | null>(null);

  const refresh = useCallback(async () => {
    setDocs((await loadVault()).filter((d) => d.planId === planId));
  }, [planId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const guardAdd = async () => {
    if (docs.length >= MAX_DOCS_PER_PLAN) {
      Alert.alert(lt('documents', currentLang), lt('docLimit', currentLang, { n: MAX_DOCS_PER_PLAN }));
      return false;
    }
    if (!(await canProtectDocuments())) {
      Alert.alert(lt('documents', currentLang), lt('needPasscode', currentLang));
      return false;
    }
    return true;
  };

  const add = async (kind: 'image' | 'pdf') => {
    if (!(await guardAdd())) return;
    const fallback = lt(kind === 'image' ? 'docImage' : 'docPdf', currentLang);
    const result = kind === 'image' ? await addImageDocument(planId, fallback) : await addPdfDocument(planId, fallback);
    if (result === 'too-large') {
      Alert.alert(lt('documents', currentLang), lt('tooLarge', currentLang));
      return;
    }
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refresh();
    }
  };

  const open = async (doc: VaultDoc) => {
    if (!(await unlockVault(lt('unlockPrompt', currentLang), lt('cancel', currentLang)))) return;
    if (doc.kind === 'image') setPreview(doc);
    else if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(vaultFileUri(doc), { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  };

  const confirmDelete = (doc: VaultDoc) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(lt('deleteDocTitle', currentLang), lt('deleteDocMsg', currentLang), [
      { text: lt('cancel', currentLang), style: 'cancel' },
      {
        text: currentLang === 'tr' ? 'Sil' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeDocument(doc.id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Lock size={14} color={colors.text.secondary} />
        <Text style={styles.label}>{lt('documents', currentLang)}</Text>
      </View>

      {docs.length === 0 && <Text style={styles.empty}>{lt('noDocuments', currentLang)}</Text>}
      {docs.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          style={styles.row}
          onPress={() => open(doc)}
          onLongPress={() => confirmDelete(doc)}
          accessibilityRole="button"
          accessibilityLabel={doc.name}
        >
          {doc.kind === 'image' ? <ImageIcon size={18} color={colors.gold.base} /> : <FileText size={18} color={colors.gold.base} />}
          <Text style={styles.name} numberOfLines={1}>{doc.name}</Text>
          <Lock size={13} color={colors.text.muted} />
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <Chip label={lt('addPhoto', currentLang)} onPress={() => add('image')} />
        <Chip label={lt('addPdf', currentLang)} onPress={() => add('pdf')} />
      </View>
      <Text style={styles.note}>{lt('documentsNote', currentLang)}</Text>

      <Sheet visible={preview !== null} onClose={() => setPreview(null)} maxHeight="88%">
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle} numberOfLines={1}>{preview?.name}</Text>
          <TouchableOpacity onPress={() => setPreview(null)} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
        {preview && <Image source={{ uri: vaultFileUri(preview) }} style={styles.previewImage} resizeMode="contain" />}
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: { padding: 16, borderRadius: 20, gap: 10, backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline, marginBottom: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary },
    empty: { fontSize: 13, color: colors.text.muted },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    name: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text.primary },
    actions: { flexDirection: 'row', gap: 8 },
    note: { fontSize: 11, lineHeight: 16, color: colors.text.muted },
    previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
    previewTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text.primary },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    previewImage: { width: '100%', height: 460, borderRadius: 12 },
  })
);
