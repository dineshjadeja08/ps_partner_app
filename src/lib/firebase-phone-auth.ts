import type { ConfirmationResult } from '@react-native-firebase/auth';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Expo Go has no Firebase native code, so load it lazily. The rest of the app can then
// still be previewed in Expo Go; only phone login needs a real build.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
function firebaseAuth() {
  if (isExpoGo) throw new Error('Phone login is not available in Expo Go. Use the PurplePartner app build to sign in.');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/auth') as typeof import('@react-native-firebase/auth');
}

let pendingConfirmation: ConfirmationResult | null = null;
let verifiedIdToken: string | null = null;

function readableFirebaseError(error: unknown): Error {
  const value = error as { code?: string; message?: string };
  const messages: Record<string, string> = {
    'auth/invalid-phone-number': 'Enter a valid mobile number.',
    'auth/invalid-verification-code': 'That OTP is incorrect. Please try again.',
    'auth/code-expired': 'That OTP has expired. Please request a new one.',
    'auth/session-expired': 'That OTP has expired. Please request a new one.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/quota-exceeded': 'SMS quota has been reached. Please try again later.',
    'auth/network-request-failed': 'Check your internet connection and try again.',
    'auth/app-not-authorized': 'This app is not authorized for Firebase Phone Authentication.',
  };

  return new Error((value.code && messages[value.code]) || value.message || 'Unable to complete phone verification.');
}

export async function requestFirebaseOtp(phoneNumber: string) {
  try {
    verifiedIdToken = null;
    const { getAuth, signInWithPhoneNumber } = firebaseAuth();
    pendingConfirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
  } catch (error) {
    throw readableFirebaseError(error);
  }
}

export async function confirmFirebaseOtp(code: string) {
  if (verifiedIdToken) return verifiedIdToken;

  if (!pendingConfirmation) {
    throw new Error('Your verification session ended. Go back and request a new OTP.');
  }

  try {
    const credential = await pendingConfirmation.confirm(code);
    verifiedIdToken = await credential.user.getIdToken(true);
    pendingConfirmation = null;
    return verifiedIdToken;
  } catch (error) {
    throw readableFirebaseError(error);
  }
}

export function clearFirebaseOtpState() {
  pendingConfirmation = null;
  verifiedIdToken = null;
}

export async function signOutFirebase() {
  clearFirebaseOtpState();
  if (isExpoGo) return;
  const { getAuth, signOut } = firebaseAuth();
  if (getAuth().currentUser) await signOut(getAuth());
}
