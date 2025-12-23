import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchTasks } from '../features/tasks/taskThunks';
import auth from '@react-native-firebase/auth';

const PRIORITIES = ['low', 'medium', 'high'];

export default function AddTaskScreen({ navigation, route }) {
  const task = route?.params?.task;
  const isEdit = Boolean(task?.id);
  const dispatch = useDispatch();

  // Safe initialization of dueDate
  const [dueDate, setDueDate] = useState(() => {
    if (!task?.dueDate) return null;

    // task.dueDate can now be an ISO string
    if (typeof task.dueDate === 'string') return new Date(task.dueDate);
    if (task.dueDate instanceof Date) return task.dueDate; // JS Date
    if (typeof task.dueDate.toDate === 'function') return task.dueDate.toDate(); // Firestore Timestamp
    return null;
  });

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [completed, setCompleted] = useState(task?.completed || false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDueDate(selectedDate);
  };

  const formatDueDate = date => {
    if (!date || !(date instanceof Date)) return 'Select Due Date';
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    const uid = auth().currentUser?.uid;
    console.log(uid);

    if (!uid) {
      Alert.alert('Error', 'User not logged in');
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed,
      category: 'Today', // or custom
      tags: [priority === 'high' ? 'Work' : 'Personal'],
      dueDate: dueDate ? firestore.Timestamp.fromDate(dueDate) : null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      // CREATE
      if (!isEdit) {
        await firestore()
          .collection('users')
          .doc(auth().currentUser.uid)
          .collection('tasks')
          .add({
            ...payload,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
      } else {
        // UPDATE
        await firestore()
          .collection('users')
          .doc(auth().currentUser.uid)
          .collection('tasks')
          .doc(task.id)
          .update(payload);
      }

      dispatch(fetchTasks(uid)); // pass uid
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const uid = auth().currentUser?.uid;

    if (!isEdit) return;

    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!task?.id) return;

            const docRef = firestore()
              .collection('users')
              .doc(uid)
              .collection('tasks')
              .doc(task.id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
              Alert.alert('Error', 'This task no longer exists.');
              return;
            }

            await docRef.delete();
            dispatch(fetchTasks());
            navigation.goBack();
          } catch (err) {
            Alert.alert('Delete Failed', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={26} color="#2E3A59" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Task Details' : 'New Task'}
          </Text>
          {isEdit ? (
            <TouchableOpacity onPress={handleDelete}>
              <Icon name="trash-can-outline" size={26} color="#FF6B6B" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 26 }} />
          )}
        </View>

        {/* Inputs */}
        <Text style={styles.label}>WHAT ARE YOU PLANNING?</Text>
        <TextInput
          placeholder="Task Title"
          style={styles.mainInput}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#BDBDBD"
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          placeholder="Add more details..."
          style={styles.descInput}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#BDBDBD"
        />

        <Text style={styles.label}>DUE DATE</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowPicker(true)}
        >
          <Icon
            name="calendar-range"
            size={20}
            color="#5F59E1"
            style={{ marginRight: 10 }}
          />
          <Text
            style={[styles.flexInput, { color: dueDate ? '#000' : '#BDBDBD' }]}
          >
            {formatDueDate(dueDate)}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Priority Selector */}
        <Text style={[styles.label, { marginTop: 25 }]}>PRIORITY</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.activeChip]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  priority === p && styles.activeChipText,
                ]}
              >
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isEdit && (
          <TouchableOpacity
            style={styles.completeToggle}
            onPress={() => setCompleted(!completed)}
          >
            <Icon
              name={completed ? 'check-circle' : 'circle-outline'}
              size={24}
              color="#5F59E1"
            />
            <Text style={styles.toggleText}>
              {completed ? 'Task Completed' : 'Mark as complete'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Update Task' : 'Create Task'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 25 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E3A59' },
  label: {
    fontSize: 11,
    color: '#A0A0A0',
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  mainInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 25,
  },
  descInput: {
    fontSize: 16,
    color: '#4A4A4A',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 55,
  },
  flexInput: { flex: 1, fontSize: 16 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
  },
  activeChip: { backgroundColor: '#5F59E1' },
  chipText: { color: '#7D848F', fontWeight: 'bold', fontSize: 12 },
  activeChipText: { color: '#FFF' },
  completeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#F0EFFF',
    padding: 15,
    borderRadius: 12,
  },
  toggleText: { marginLeft: 10, color: '#5F59E1', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#5F59E1',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
