import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import type { PickedFile } from '@/lib/api';

/** Lets the partner take a photo or choose one; resolves null if they cancel or deny access. */
export async function pickImage(): Promise<PickedFile | null> {
  const source = Platform.OS === 'web' ? 'library' : await new Promise<'camera' | 'library' | null>((resolve) => Alert.alert('Add photo', undefined, [
    { text: 'Take photo', onPress: () => resolve('camera') }, { text: 'Choose from gallery', onPress: () => resolve('library') }, { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
  ], { cancelable: true, onDismiss: () => resolve(null) }));
  if (!source) return null;
  const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) { Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo'} access in your phone settings to add photos.`); return null; }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'image/jpeg';
  return { uri: asset.uri, name: asset.fileName ?? `photo-${Date.now()}.${mimeType.split('/')[1] ?? 'jpg'}`, mimeType };
}
