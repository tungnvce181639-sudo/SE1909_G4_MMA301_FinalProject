import React from 'react';
import { Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import CreateNewPasswordScreen from '../screens/auth/CreateNewPasswordScreen';
import HomeScreen from '../screens/home/HomeScreen';
import MyListingsScreen from '../screens/product/MyListingsScreen';
import PostItemScreen from '../screens/product/PostItemScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import AIEstimatorScreen from '../screens/ai/AIEstimatorScreen';
import AIChatbotScreen from '../screens/ai/AIChatbotScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminDashboardScreen() {
  return (
    <View>
      <Text>Admin Dashboard</Text>
    </View>
  );
}

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
  Admin: {
    component: AdminDashboardScreen,
    label: 'Duyệt bài',
    icon: 'shield-checkmark-outline',
    activeIcon: 'shield-checkmark',
  },
};

function TabNavigator() {
  const { theme, primaryColor } = useTheme();
  const { profile, loading: profileLoading } = useProfile();
  const { role } = profile || {};
  const visibleTabScreens = Object.fromEntries(
    Object.entries(tabScreens).filter(([name]) => name !== 'Admin' || (!profileLoading && role === 'admin')),
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = visibleTabScreens[route.name];

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
      {Object.entries(visibleTabScreens).map(([name, tab]) => (
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
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 250,
        }}
      />
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
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chỉnh sửa hồ sơ' }} />
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
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateNewPassword"
            component={CreateNewPasswordScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
