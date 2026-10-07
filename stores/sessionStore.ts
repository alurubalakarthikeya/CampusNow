import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * The verified student session.
 *
 * CampusNow only opens for students whose college email and seat number were
 * confirmed, so this store is the gate the rest of the app trusts: while
 * `status` is `signed-out` the root layout keeps the app on the sign-in
 * screen, and the moment it flips the student lands on Home.
 */

export interface SessionInput {
  email: string;
  usn: string;
  name: string;
  degree?: string;
  /** Local URI of the photographed college ID, kept as proof of the check */
  idPhotoUri?: string | null;
}

interface SessionState {
  status: 'signed-out' | 'verified';
  email: string | null;
  usn: string | null;
  name: string | null;
  degree: string | null;
  idPhotoUri: string | null;
  verifiedAt: string | null;
  signIn: (input: SessionInput) => void;
  /** Corrections to the name/degree keep the verified email and USN intact. */
  updateVerifiedProfile: (patch: Partial<Pick<SessionInput, 'name' | 'degree'>>) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      status: 'signed-out',
      email: null,
      usn: null,
      name: null,
      degree: null,
      idPhotoUri: null,
      verifiedAt: null,

      signIn: (input) =>
        set({
          status: 'verified',
          email: input.email.trim().toLowerCase(),
          usn: input.usn.trim().toUpperCase(),
          name: input.name.trim(),
          degree: input.degree?.trim() ?? null,
          idPhotoUri: input.idPhotoUri ?? null,
          verifiedAt: new Date().toISOString(),
        }),

      updateVerifiedProfile: (patch) =>
        set((state) => ({
          name: patch.name?.trim() ?? state.name,
          degree: patch.degree?.trim() ?? state.degree,
        })),

      signOut: () =>
        set({
          status: 'signed-out',
          email: null,
          usn: null,
          name: null,
          degree: null,
          idPhotoUri: null,
          verifiedAt: null,
        }),
    }),
    {
      name: 'campusnow/session-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** True once a student has been verified on this device. */
export function isVerified(): boolean {
  return useSessionStore.getState().status === 'verified';
}
