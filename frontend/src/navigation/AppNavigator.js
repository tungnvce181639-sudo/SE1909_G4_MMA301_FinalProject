import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import MyListingsScreen from '../screens/product/MyListingsScreen';
import PostItemScreen from '../screens/product/PostItemScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import AIEstimatorScreen from '../screens/ai/AIEstimatorScreen';
import AIChatbotScreen from '../screens/ai/AIChatbotScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabScreens = {
  Home: {
    component: HomeScreen,
    label: 'Trang chủ',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  MyListings: {
    component: MyListingsScreen,
    label: 'Tin đăng',
    icon: 'clipboard-outline',
    activeIcon: 'clipboard',
  },
  PostItem: {
    component: PostItemScreen,
    label: 'Đăng tin',
    icon: 'add-circle-outline',
    activeIcon: 'add-circle',
  },
  Orders: {
    component: OrderHistoryScreen,
    label: 'Đơn hàng',
    icon: 'bag-handle-outline',
    activeIcon: 'bag-handle',
  },
  Profile: {
    component: UserProfileScreen,
    label: 'Cá nhân',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

function TabNavigator() {
  const { theme, primaryColor } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = tabScreens[route.name];

        return {
          headerShown: false,
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
          tabBarLabelStyle: {
            fontSize: 11,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? tab.activeIcon : tab.icon}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      {Object.entries(tabScreens).map(([name, tab]) => (
        <Tab.Screen key={name} name={name} component={tab.component} options={{ title: tab.label }} />
      ))}
    </Tab.Navigator>
  );
}

function MainStackNavigator() {
  const { theme, primaryColor } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
        headerBackTitle: 'Quay lại',
        navigationBarColor: theme.background,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
      <Stack.Screen
        name="AIEstimator"
        component={AIEstimatorScreen}
        options={{ title: 'Định giá AI', presentation: 'modal', headerTintColor: primaryColor }}
      />
      <Stack.Screen
        name="AIChatbot"
        component={AIChatbotScreen}
        options={{ title: 'Trợ lý AI', presentation: 'modal', headerTintColor: primaryColor }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  const auth = useAuth();
  const isAuthenticated = Boolean(auth && (auth.userToken || auth.user));

  return (
    <NavigationContainer
      theme={{
        dark: Boolean(theme.background === '#17181c'),
        fonts: DefaultTheme.fonts,
        colors: {
          primary: theme.text,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          notification: theme.text,
        },
      }}
    >
      {isAuthenticated ? (
        <MainStackNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}