import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import {
  FileText,
  ArrowLeft,
  Share as ShareIcon,
  FileDown,
  Mail,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/contexts/ThemeContext';

export default function LetterPreviewScreen() {
  const { content } = useLocalSearchParams<{ content?: string }>();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: {
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 20,
        },
        letterText: {
          fontSize: 16,
          fontFamily: 'Roboto-Regular',
          color: colors.textPrimary,
          lineHeight: 24,
        },
        toolbar: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          gap: 8,
        },
        toolbarButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors]
  );

  const handleShare = async () => {
    if (!content) return;
    try {
      await Share.share({ message: content });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async () => {
    if (!content) return;
    try {
      const html = `<html><meta charset="utf-8" /><body><pre>${content}</pre></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      const fileUri = `${FileSystem.documentDirectory}letter-preview.pdf`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de télécharger le courrier');
    }
  };

  const handleEmail = () => {
    if (!content) return;
    const mailto = 'mailto:?subject=Courrier&body=' + encodeURIComponent(content);
    Linking.openURL(mailto);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Prévisualisation"
        subtitle="Aperçu du courrier généré"
        showBack
      />

      {!content ? (
        <EmptyState
          icon={FileText}
          title="Aucun contenu"
          description="Le contenu du courrier est manquant."
        />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.letterText}>{content}</Text>
        </ScrollView>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleShare}>
          <ShareIcon size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleDownload}>
          <FileDown size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleEmail}>
          <Mail size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

