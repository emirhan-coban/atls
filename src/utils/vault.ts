import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { Directory, File, Paths } from 'expo-file-system';

const DIR_NAME = 'document-vault';
const META_KEY = '@atls_vault';
export const MAX_DOCS_PER_PLAN = 12;
const MAX_BYTES = 15 * 1024 * 1024;

export type VaultKind = 'image' | 'pdf';

/** A travel document kept on this device only. The file is stored by name; the path is rebuilt when it is opened. */
export interface VaultDoc {
  id: string;
  planId: string;
  name: string;
  kind: VaultKind;
  file: string;
  addedAt: string;
}

const dir = () => new Directory(Paths.document, DIR_NAME);
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export async function loadVault(): Promise<VaultDoc[]> {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveVault(docs: VaultDoc[]) {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(docs));
}

export const vaultFileUri = (doc: VaultDoc): string => new File(Paths.document, DIR_NAME, doc.file).uri;

/** Documents are only worth locking when the device itself has a passcode or biometrics set up. */
export async function canProtectDocuments(): Promise<boolean> {
  try {
    return (await LocalAuthentication.getEnrolledLevelAsync()) !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** Face ID / Touch ID, falling back to the device passcode. */
export async function unlockVault(promptMessage: string, cancelLabel: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: false });
    return result.success;
  } catch {
    return false;
  }
}

function copyIntoVault(sourceUri: string, ext: string): string | null {
  try {
    const target = dir();
    if (!target.exists) target.create({ intermediates: true, idempotent: true });
    const file = `${newId()}.${ext}`;
    new File(sourceUri).copy(new File(target, file));
    return file;
  } catch (err) {
    console.warn('[vault] could not copy document:', err);
    return null;
  }
}

/** Lets the user choose a photo of a ticket or visa. Returns the new document, or null when cancelled. */
export async function addImageDocument(planId: string, fallbackName: string): Promise<VaultDoc | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, exif: false });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
  const file = copyIntoVault(asset.uri, ext);
  if (!file) return null;
  return register({ planId, name: asset.fileName || fallbackName, kind: 'image', file });
}

/** Lets the user choose a PDF (e-ticket, visa, insurance). Returns the new document, or null when cancelled or too large. */
export async function addPdfDocument(planId: string, fallbackName: string): Promise<VaultDoc | 'too-large' | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_BYTES) return 'too-large';
  const file = copyIntoVault(asset.uri, 'pdf');
  try {
    new File(asset.uri).delete(); // the picker's cache copy is no longer needed
  } catch {
    // cache cleanup is best effort
  }
  if (!file) return null;
  return register({ planId, name: asset.name || fallbackName, kind: 'pdf', file });
}

async function register(input: Omit<VaultDoc, 'id' | 'addedAt'>): Promise<VaultDoc> {
  const doc: VaultDoc = { ...input, id: newId(), addedAt: new Date().toISOString() };
  const all = await loadVault();
  await saveVault([doc, ...all]);
  return doc;
}

function deleteFile(doc: VaultDoc) {
  try {
    const file = new File(Paths.document, DIR_NAME, doc.file);
    if (file.exists) file.delete();
  } catch (err) {
    console.warn('[vault] could not delete document file:', err);
  }
}

export async function removeDocument(id: string): Promise<void> {
  const all = await loadVault();
  const doc = all.find((d) => d.id === id);
  if (doc) deleteFile(doc);
  await saveVault(all.filter((d) => d.id !== id));
}

/** Removes every document of a plan, e.g. when the plan is deleted. */
export async function removePlanDocuments(planId: string): Promise<void> {
  const all = await loadVault();
  all.filter((d) => d.planId === planId).forEach(deleteFile);
  await saveVault(all.filter((d) => d.planId !== planId));
}

/** Wipes the whole vault: used on sign-out and account deletion so documents do not outlive their owner's session. */
export async function clearVault(): Promise<void> {
  try {
    const target = dir();
    if (target.exists) target.delete();
  } catch (err) {
    console.warn('[vault] could not clear vault folder:', err);
  }
  await AsyncStorage.removeItem(META_KEY);
}
