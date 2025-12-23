import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
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

  // --- FILTER STATES ---
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Incomplete', 'Completed'
  const [filterPriority, setFilterPriority] = useState('All'); // 'All', 'high', 'medium', 'low'

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

  // --- FILTERING LOGIC ---
  const filteredTasks = tasks.filter(task => {
    const statusMatch =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Completed'
        ? task.completed
        : !task.completed;

    const priorityMatch =
      filterPriority === 'All' ? true : task.priority === filterPriority;

    return statusMatch && priorityMatch;
  });

  // Sort tasks by dueDate
  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
    sections.push({ title: 'Filtered Tasks', data: sortedTasks });

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

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Planner</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Icon name="logout" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.username}>
          Hello,{' '}
          <Text style={{ fontWeight: '700', color: '#FFF' }}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          !
        </Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* --- HORIZONTAL FILTER BAR --- */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* Status Filters */}
          {['All', 'Incomplete', 'Completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.activeFilterChip,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.activeFilterText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* Priority Filters */}
          {['high', 'medium', 'low'].map(prio => (
            <TouchableOpacity
              key={prio}
              style={[
                styles.filterChip,
                filterPriority === prio && styles.activeFilterChip,
              ]}
              onPress={() =>
                setFilterPriority(filterPriority === prio ? 'All' : prio)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterPriority === prio && styles.activeFilterText,
                ]}
              >
                {prio.charAt(0).toUpperCase() + prio.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Clear Filter Button (Visible only when filters are active) */}
          {(filterStatus !== 'All' || filterPriority !== 'All') && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={[styles.filterChip, styles.clearChip]}
                onPress={() => {
                  setFilterStatus('All');
                  setFilterPriority('All');
                }}
              >
                <Icon
                  name="filter-remove-outline"
                  size={16}
                  color="#FF6B6B"
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.filterChipText, { color: '#FF6B6B' }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* --- TASK LIST --- */}
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
            <Icon name="filter-variant-remove" size={60} color="#DDD" />
            <Text style={{ color: '#AAA', marginTop: 10 }}>
              No tasks match these filters.
            </Text>
          </View>
        )}
      />

      {/* --- FAB --- */}
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
    paddingBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.9,
  },
  username: {
    color: '#F0EFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  headerSubtitle: { color: '#E0E0E0', fontSize: 14, marginTop: 5 },

  // Filter Styles
  filterWrapper: {
    marginTop: -15,
    zIndex: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#5F59E1',
    borderColor: '#5F59E1',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D848F',
  },
  activeFilterText: {
    color: 'white',
  },
  clearChip: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF0F0',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#DDD',
    marginRight: 10,
    alignSelf: 'center',
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginTop: 15,
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
