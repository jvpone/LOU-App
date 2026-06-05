import { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import DataManager from '../lib/DataManager';
import EventCard from '../components/EventCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterBar, { getDateRange } from '../components/FilterBar';
import EmptyState from '../components/EmptyState';

const ITEMS_PER_PAGE = 10;

const initialFilters = {
  comuna: 'Todas',
  temporal: 'Todos',
  acceso: 'Todos',
  genero: 'Todos',
};

function applyFilters(events, filters) {
  return events.filter((event) => {
    if (filters.comuna !== 'Todas' && event.comuna !== filters.comuna) {
      return false;
    }

    if (filters.temporal !== 'Todos') {
      const dateRange = getDateRange(filters.temporal);
      if (dateRange) {
        const eventDate = new Date(event.fecha_inicio);
        if (eventDate < dateRange.start || eventDate > dateRange.end) {
          return false;
        }
      }
    }

    if (filters.acceso === 'Gratis' && event.acceso !== 'gratis') {
      return false;
    }
    if (filters.acceso === 'Pago' && event.acceso !== 'pago') {
      return false;
    }

    const generoMap = {
      'Rock': 'rock',
      'Pop': 'pop',
      'Electrónica': 'electronica',
      'Jazz': 'jazz',
      'Otro': 'otro',
    };
    if (filters.genero !== 'Todos' && event.genero !== generoMap[filters.genero]) {
      return false;
    }

    return true;
  });
}

export default function HomeFeed() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadSavedFilters = async () => {
      const savedFilters = await DataManager.loadFilters();
      if (savedFilters) {
        setFilters(savedFilters);
      }
    };
    loadSavedFilters();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const allEvents = await DataManager.getEvents();
        const filtered = applyFilters(allEvents, filters);
        const initialEvents = filtered.slice(0, ITEMS_PER_PAGE);

        setFilteredEvents(filtered);
        setEvents(initialEvents);
        setPage(0);
        setHasMore(filtered.length > ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [filters]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filters]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = nextPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newEvents = filteredEvents.slice(startIndex, endIndex);

      if (newEvents.length === 0) {
        setHasMore(false);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
        setPage(nextPage);
        setHasMore(endIndex < filteredEvents.length);
      }
      setLoading(false);
    }, 500);
  }, [page, loading, hasMore, filteredEvents]);

  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  const handleFilterChange = useCallback(async (newFilters) => {
    setFilters(newFilters);
    await DataManager.saveFilters(newFilters);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <EventCard event={item} />
  ), []);

  const renderFooter = () => {
    if (!hasMore && filteredEvents.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No hay más eventos para mostrar.</Text>
        </View>
      );
    }
    if (loading && events.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color="#E5b0cb" />
        </View>
      );
    }
    return null;
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <SkeletonCard />
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        <FilterBar filters={filters} onChange={handleFilterChange} />
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterBar filters={filters} onChange={handleFilterChange} />
      {filteredEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          ref={flatListRef}
          data={events}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  listContent: {
    paddingVertical: 8,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#888888',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
