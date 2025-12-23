import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchTasks } from '../features/tasks/taskThunks';
import auth from '@react-native-firebase/auth';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks.list);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          auth()
            .signOut()
            .then(() => console.log('User signed out!'))
            .catch(error => Alert.alert('Error', error.message));
        },
        style: 'destructive',
      },
    ]);
  };

  // Sort tasks by dueDate (earliest first), tasks without dueDate at the end
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // Separate sections
  const todayTasks = sortedTasks.filter(t => t.category === 'Today');
  const otherTasks = sortedTasks.filter(
    t => t.category && t.category !== 'Today',
  );

  const sections = [];
  if (todayTasks.length) sections.push({ title: 'Today', data: todayTasks });
  if (otherTasks.length) sections.push({ title: 'Other', data: otherTasks });
  if (!sections.length && sortedTasks.length)
    sections.push({ title: 'All Tasks', data: sortedTasks });

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('AddTask', { task: item })}
    >
      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, item.completed && styles.completedText]}
        >
          {item.title}
        </Text>
        <Text style={styles.taskDate}>
          Due:{' '}
          {item.dueDate
            ? new Date(item.dueDate).toLocaleDateString()
            : 'No date set'}
        </Text>
      </View>

      <View style={styles.badgeContainer}>
        {item.priority && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: getTagColor(
                  item.priority === 'high' ? 'Work' : 'Personal',
                ),
              },
            ]}
          >
            <Text style={styles.badgeText}>{item.priority}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5F59E1" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color="#AAA" />
            <Text style={styles.searchPlaceholder}>Search...</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut}>
            <Icon name="logout" size={24} color="#f01212ff" />
          </TouchableOpacity>
        </View>
        {/* Styled Username */}
        <Text style={styles.username}>
          Hello,{' '}
          <Text style={{ fontWeight: '700', color: '#FFF' }}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          !
        </Text>
        <Text style={styles.headerTitle}>My tasks</Text>
        <Text style={styles.headerSubtitle}>
          Today,{' '}
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderTaskItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Icon name="clipboard-text-off-outline" size={60} color="#DDD" />
            <Text style={{ color: '#AAA', marginTop: 10 }}>
              No tasks found. Tap + to add one!
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getTagColor = tag => {
  const colors = {
    Personal: '#FFB347',
    Work: '#5F59E1',
    App: '#FF6B6B',
    Study: '#4D96FF',
  };
  return colors[tag] || '#BDBDBD';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    backgroundColor: '#8E89F3',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 25, // Adjusted to fit the username
  },
  headerTitle: {
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 4, // Space between subtitle and title
  },
  username: {
    color: '#F0EFFF', // Light purple-white for contrast
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8, // Space below "My tasks"
    opacity: 0.9,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'white',
    height: 40,
    borderRadius: 20,
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchPlaceholder: { color: '#AAA', marginLeft: 10, fontSize: 14 },
  headerSubtitle: { color: '#E0E0E0', fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginTop: 25,
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: '#2E3A59', fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#AAA' },
  taskDate: { fontSize: 12, color: '#AAA', marginTop: 2 },
  badgeContainer: { flexDirection: 'row' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 5,
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
    backgroundColor: '#5F59E1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
});
