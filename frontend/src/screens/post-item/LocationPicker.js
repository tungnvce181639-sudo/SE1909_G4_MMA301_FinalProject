import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LOCATIONS } from './listingConstants';

const CAMPUS_REGION = {
  latitude: 21.0136,
  longitude: 105.5254,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function getAddressLabel(address) {
  if (!address) return '';

  const street = [
    address.house_number || address.streetNumber,
    address.road || address.street,
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
  const locality = [
    address.neighbourhood,
    address.suburb,
    address.city_district || address.district,
    address.city || address.subregion,
    address.state || address.region,
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
  const place = address.name || address.amenity || address.building || address.tourism || '';
  const parts = [place, ...street, ...locality];

  if (parts.length === 0 && address.display_name) {
    parts.push(address.display_name);
  }
  return parts.filter((value, index, values) => values.indexOf(value) === index).join(', ');
}

async function requestNominatim(endpoint, query) {
  const response = await fetch(`https://nominatim.openstreetmap.org/${endpoint}?${query}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'vi,en',
      'User-Agent': 'SmartCampusMarket/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Dịch vụ bản đồ trả về HTTP ${response.status}.`);
  }

  return response.json();
}

function createMapHtml(center, marker) {
  const initialCenter = JSON.stringify([center.latitude, center.longitude]);
  const initialMarker = marker
    ? JSON.stringify([marker.latitude, marker.longitude])
    : 'null';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e8e5de; }
    .leaflet-control-attribution { font-size: 10px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: true }).setView(${initialCenter}, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    let marker = ${initialMarker} ? L.marker(${initialMarker}).addTo(map) : null;
    map.on('click', (event) => {
      const coordinate = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      };
      if (marker) marker.setLatLng(event.latlng);
      else marker = L.marker(event.latlng).addTo(map);
      window.ReactNativeWebView.postMessage(JSON.stringify(coordinate));
    });
    window.setSelectedLocation = (latitude, longitude, label) => {
      const point = [latitude, longitude];
      map.setView(point, 17);
      if (marker) marker.setLatLng(point);
      else marker = L.marker(point).addTo(map);
      if (label) marker.bindPopup(label).openPopup();
    };
  </script>
</body>
</html>`;
}

export default function LocationPicker({
  theme, primaryColor, selectedLocation, locationCoords, error, onSelect,
}) {
  const mapRef = useRef(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [marker, setMarker] = useState(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [addressLookupUnavailable, setAddressLookupUnavailable] = useState(false);
  const mapHtml = useMemo(
    () => createMapHtml(CAMPUS_REGION, isMapVisible ? locationCoords : null),
    [isMapVisible, locationCoords],
  );

  useEffect(() => {
    if (!isMapVisible) return;
    const initialCoordinate = locationCoords || null;
    setMarker(initialCoordinate);
    setAddressLabel('');
    setAddressLookupUnavailable(false);
    setSearchText('');
    setSearchResults([]);
  }, [isMapVisible, locationCoords]);

  const resolveAddress = async (coordinate, fallback = '') => {
    try {
      const query = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        lat: String(coordinate.latitude),
        lon: String(coordinate.longitude),
      }).toString();
      const address = await requestNominatim('reverse', query);
      const label = getAddressLabel({
        ...address.address,
        name: address.name || address.address?.name,
      }) || address.display_name || fallback;
      setAddressLookupUnavailable(!label);
      return label || fallback;
    } catch {
      setAddressLookupUnavailable(true);
      return fallback;
    }
  };

  useEffect(() => {
    if (!isMapVisible || !locationCoords || !/^GPS\s*\(/i.test(selectedLocation || '')) return undefined;
    let active = true;
    setIsResolvingAddress(true);
    resolveAddress(locationCoords)
      .then((label) => {
        if (active) setAddressLabel(label);
      })
      .finally(() => {
        if (active) setIsResolvingAddress(false);
      });
    return () => {
      active = false;
    };
  }, [isMapVisible, locationCoords, selectedLocation]);

  const selectCoordinate = async (coordinate, fallback = '') => {
    setMarker(coordinate);
    setAddressLabel('');
    setIsResolvingAddress(true);
    try {
      const label = await resolveAddress(coordinate, fallback);
      setAddressLabel(label);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const searchAddress = async () => {
    const query = searchText.trim();
    if (!query) {
      Alert.alert('Nhập địa điểm', 'Nhập tên đường, tòa nhà hoặc cổng trường để tìm trên bản đồ.');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'vn',
        q: query,
      }).toString();
      const geocoded = await requestNominatim('search', params);
      if (geocoded.length === 0) {
        Alert.alert('Không tìm thấy địa điểm', 'Thử nhập tên đường hoặc địa điểm gần đó cụ thể hơn.');
        return;
      }

      const results = geocoded.map((result) => ({
        coordinate: {
          latitude: Number(result.lat),
          longitude: Number(result.lon),
        },
        label: getAddressLabel({
          ...result.address,
          name: result.name || result.address?.name,
        }) || result.display_name || query,
      })).filter((result) => (
        Number.isFinite(result.coordinate.latitude) && Number.isFinite(result.coordinate.longitude)
      ));
      setSearchResults(results);
    } catch (searchError) {
      console.warn('[LocationPicker] Address search unavailable:', searchError.message);
      Alert.alert('Không tìm được địa chỉ', searchError.message || 'Kiểm tra kết nối rồi thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Cho phép truy cập vị trí để ghim vị trí hiện tại.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });
      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      mapRef.current?.injectJavaScript(
        `window.setSelectedLocation(${coordinate.latitude}, ${coordinate.longitude}, 'Vị trí hiện tại'); true;`,
      );
      setSearchResults([]);
      await selectCoordinate(coordinate);
    } catch (locationError) {
      console.error('[LocationPicker] Current location failed:', locationError);
      Alert.alert('Không lấy được vị trí', 'Bật dịch vụ vị trí hoặc tìm địa chỉ bằng ô tìm kiếm.');
    }
  };

  const confirmLocation = () => {
    const label = addressLabel.trim();
    if (!marker || !label) {
      Alert.alert('Chưa chọn điểm hẹn', 'Ghim một điểm trên bản đồ và xác nhận tên đường hoặc địa điểm.');
      return;
    }
    onSelect(label, marker);
    setIsMapVisible(false);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.text }]}>Điểm hẹn giao dịch *</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color={primaryColor} />
          <View style={styles.locationCopy}>
            <Text style={[styles.selectedLocation, { color: theme.text }]} numberOfLines={2}>
              {/^GPS\s*\(/i.test(selectedLocation || '')
                ? 'Vị trí đã ghim — cần xác nhận tên đường trên bản đồ'
                : selectedLocation}
            </Text>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              {locationCoords && !/^GPS\s*\(/i.test(selectedLocation || '')
                ? 'Đã ghim điểm trên bản đồ'
                : 'Chọn điểm hẹn cụ thể trong khuôn viên trường'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsMapVisible(true)}
            style={[styles.mapButton, { backgroundColor: primaryColor }]}
            accessibilityRole="button"
          >
            <Ionicons name="map-outline" size={17} color="#fff" />
            <Text style={styles.mapButtonText}>Bản đồ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tags}>
          {LOCATIONS.map((location) => {
            const active = selectedLocation === location && !locationCoords;
            return (
              <TouchableOpacity
                key={location}
                onPress={() => onSelect(location, null)}
                style={[styles.tag, { backgroundColor: active ? primaryColor : theme.background }]}
              >
                <Text style={{ color: active ? '#fff' : theme.text, fontSize: 11 }}>
                  {active ? '✓ ' : ''}{location}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modal, { backgroundColor: theme.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setIsMapVisible(false)} accessibilityLabel="Đóng bản đồ">
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Chọn điểm hẹn trên bản đồ</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={[styles.searchPanel, { backgroundColor: theme.card }]}>
            <View style={styles.searchRow}>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={searchAddress}
                placeholder="Tìm đường, tòa nhà, cổng trường..."
                placeholderTextColor={theme.textSecondary}
                returnKeyType="search"
                style={[styles.searchInput, { color: theme.text, borderColor: theme.border }]}
              />
              <TouchableOpacity
                onPress={searchAddress}
                disabled={isSearching}
                style={[styles.searchButton, { backgroundColor: primaryColor }]}
                accessibilityLabel="Tìm địa chỉ"
              >
                {isSearching
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="search" size={19} color="#fff" />}
              </TouchableOpacity>
            </View>
            {searchResults.length > 0 ? (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={searchResults}
                keyExtractor={(item, index) => `${item.coordinate.latitude}-${item.coordinate.longitude}-${index}`}
                style={styles.results}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchResults([]);
                      setMarker(item.coordinate);
                      setAddressLabel(item.label);
                      setAddressLookupUnavailable(false);
                      mapRef.current?.injectJavaScript(
                        `window.setSelectedLocation(${item.coordinate.latitude}, ${item.coordinate.longitude}, ${JSON.stringify(item.label)}); true;`,
                      );
                    }}
                    style={[styles.resultItem, { borderBottomColor: theme.border }]}
                  >
                    <Ionicons name="location-outline" size={18} color={primaryColor} />
                    <Text style={[styles.resultText, { color: theme.text }]}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : null}
            <Text style={[styles.addressLabel, { color: theme.text }]}>Tên đường / địa điểm cụ thể</Text>
            <TextInput
              value={addressLabel}
              onChangeText={(value) => {
                setAddressLabel(value);
                setAddressLookupUnavailable(false);
              }}
              placeholder="Ví dụ: Cổng A, đường vào KTX Dom B..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.addressInput, { color: theme.text, borderColor: theme.border }]}
            />
            {isResolvingAddress ? (
              <Text style={[styles.resolvingText, { color: theme.textSecondary }]}>Đang tìm địa chỉ...</Text>
            ) : addressLookupUnavailable ? (
              <Text style={[styles.resolvingText, { color: theme.textSecondary }]}>
                Không tự nhận diện được địa chỉ trên thiết bị này. Hãy nhập tên đường hoặc địa điểm cụ thể.
              </Text>
            ) : null}
          </View>

          <View style={styles.mapContainer}>
            {isMapVisible ? (
              <WebView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                source={{ html: mapHtml }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                onMessage={(event) => {
                  let coordinate;
                  try {
                    coordinate = JSON.parse(event.nativeEvent.data);
                  } catch (messageError) {
                    console.error('[LocationPicker] Invalid map selection:', messageError);
                    return;
                  }
                  if (!Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) {
                    return;
                  }
                  setSearchResults([]);
                  selectCoordinate(coordinate);
                }}
                renderLoading={() => (
                  <View style={[StyleSheet.absoluteFill, styles.mapLoading]}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Đang tải bản đồ...</Text>
                  </View>
                )}
                startInLoadingState
              />
            ) : null}
            <TouchableOpacity
              onPress={useCurrentLocation}
              style={[styles.currentLocationButton, { backgroundColor: theme.card }]}
              accessibilityLabel="Dùng vị trí hiện tại"
            >
              <Ionicons name="locate-outline" size={21} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.modalFooter, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setIsMapVisible(false)}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmLocation}
              style={[styles.confirmButton, { backgroundColor: primaryColor }]}
            >
              <Ionicons name="checkmark" size={19} color="#fff" />
              <Text style={styles.confirmText}>Dùng điểm này</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  card: { borderRadius: 12, padding: 13, gap: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  locationCopy: { flex: 1, gap: 3 },
  selectedLocation: { fontWeight: '600', fontSize: 14 },
  helperText: { fontSize: 11 },
  mapButton: { minHeight: 36, borderRadius: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  mapButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  error: { color: '#ba1a1a', fontSize: 12, marginTop: 4 },
  modal: { flex: 1 },
  modalHeader: { minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  headerSpacer: { width: 24 },
  searchPanel: { padding: 12, gap: 8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: 9, paddingHorizontal: 11 },
  searchButton: { width: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  results: { maxHeight: 125 },
  resultItem: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  resultText: { flex: 1, fontSize: 12 },
  addressLabel: { fontWeight: '600', fontSize: 12 },
  addressInput: { minHeight: 40, borderWidth: 1, borderRadius: 9, paddingHorizontal: 11 },
  resolvingText: { fontSize: 11 },
  mapContainer: { flex: 1, minHeight: 180, backgroundColor: '#e8e5de' },
  mapLoading: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8e5de' },
  currentLocationButton: { position: 'absolute', right: 14, top: 14, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  modalFooter: { padding: 12, flexDirection: 'row', gap: 9, borderTopWidth: StyleSheet.hairlineWidth },
  cancelButton: { minHeight: 44, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 10 },
  confirmButton: { minHeight: 44, flex: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  confirmText: { color: '#fff', fontWeight: '700' },
});
