import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import useMyListings from './useMyListings';
import ListingCard from './ListingCard';
import ListingEmptyState from './ListingEmptyState';
import ListingSummary from './ListingSummary';
import ListingTabs from './ListingTabs';

// Shows seller listings by moderation/sales state, with refresh and owner actions.
export default function MyListingsScreen({ navigation }) {
  const { theme, primaryColor, fontSizeScale } = useTheme();
  const auth = useAuth();
  const manager = useMyListings(auth?.user);

  const renderListing = ({ item }) => (
    <ListingCard
      item={item}
      theme={theme}
      primaryColor={primaryColor}
      fontSizeScale={fontSizeScale}
      onEdit={() => navigation.navigate('PostItem', { listingId: item.id })}
      onHide={() => manager.setStatus(item, 'hidden')}
      onShow={() => manager.setStatus(item, 'active')}
      onSold={() => manager.setStatus(item, 'sold')}
      onDelete={() => manager.confirmDelete(item)}
    />
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.back} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: theme.text, fontSize: 18 * fontSizeScale }]}>Tin đăng của tôi</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Theo dõi và quản lý sản phẩm</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('PostItem')} style={styles.add} accessibilityLabel="Đăng tin mới">
          <Ionicons name="add" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={manager.selectedListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <>
            <ListingSummary counts={manager.counts} total={manager.total} theme={theme} primaryColor={primaryColor} />
            <ListingTabs
              activeTab={manager.activeTab}
              counts={manager.counts}
              theme={theme}
              primaryColor={primaryColor}
              onSelect={manager.setActiveTab}
            />
          </>
        )}
        ListEmptyComponent={manager.isLoading
          ? <View style={styles.loading}><ActivityIndicator size="large" color={primaryColor} /></View>
          : <ListingEmptyState
            tab={manager.activeTab}
            theme={theme}
            primaryColor={primaryColor}
            onCreate={() => navigation.navigate('PostItem')}
          />}
        refreshControl={(
          <RefreshControl
            refreshing={manager.refreshing}
            onRefresh={manager.refresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        )}
        ListFooterComponent={<View style={styles.footer}><Text style={{ color: theme.textSecondary, fontSize: 10 }}>Tin của bạn được lưu trên tài khoản hiện tại.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  back: { height: 44, width: 40, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, paddingLeft: 6 },
  title: { fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 2 },
  add: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 15, paddingBottom: 24 },
  loading: { paddingTop: 35, alignItems: 'center' },
  footer: { paddingVertical: 18, alignItems: 'center' },
});
