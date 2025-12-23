import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/** Helper to normalize Firestore task for Redux */
const normalizeTask = doc => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title ?? '',
    description: data.description ?? '',
    completed: Boolean(data.completed),
    category: data.category ?? 'Other',
    priority: data.priority ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    dueDate: data.dueDate ? data.dueDate.toDate().toISOString() : null,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
  };
};

/** FETCH TASKS */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('UID not provided');

      return new Promise((resolve, reject) => {
        firestore()
          .collection('users')
          .doc(uid)
          .collection('tasks')
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            snapshot => {
              const tasks = snapshot.docs.map(normalizeTask);
              resolve(tasks);
            },
            error => reject(error),
          );
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/** ADD TASK */
export const addTask = createAsyncThunk(
  'tasks/add',
  async (task, { rejectWithValue }) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('UID not provided');

      const payload = {
        title: task.title,
        description: task.description ?? '',
        priority: task.priority ?? 'medium',
        completed: task.completed ?? false,
        dueDate: task.dueDate
          ? firestore.Timestamp.fromDate(new Date(task.dueDate))
          : null,
        category: task.category ?? 'Today',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .add(payload);

      const docSnap = await docRef.get();
      return normalizeTask(docSnap);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/** UPDATE TASK */
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('UID not provided');

      const docRef = firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .doc(taskId);

      await docRef.update({
        ...updates,
        dueDate: updates.dueDate
          ? firestore.Timestamp.fromDate(new Date(updates.dueDate))
          : null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      const updatedSnap = await docRef.get();
      return normalizeTask(updatedSnap);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/** DELETE TASK */
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) throw new Error('UID not provided');

      await firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .doc(taskId)
        .delete();

      return taskId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);
