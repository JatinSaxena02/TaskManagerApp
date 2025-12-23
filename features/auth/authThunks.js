import { createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Helper: ensure user document exists
 */
const ensureUserDocument = async user => {
  const userRef = firestore().collection('users').doc(user.uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    await userRef.set({
      uid: user.uid,
      email: user.email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.update({
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
};

/**
 * LOGIN USER
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user } = await auth().signInWithEmailAndPassword(
        email.trim(),
        password,
      );

      await ensureUserDocument(user);

      return {
        uid: user.uid,
        email: user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * REGISTER USER
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user } = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password,
      );

      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        uid: user.uid,
        email: user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * LOGOUT USER (REAL LOGOUT)
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await auth().signOut();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
