import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, Animated, Easing, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getTheme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import ReferenceScreen from './src/screens/ReferenceScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ToolScreen from './src/screens/ToolScreen';

// ─── Global app context ───────────────────────────────────────────────
export const AppContext = createContext({});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ANIM_CFG = {
  Home:      { scaleFrom: 0.65, extraFrom:  5,   extraMid: -2 },
  Tools:     { scaleFrom: 0.55, extraFrom: -15,  extraMid:  4 },
  Reference: { scaleFrom: 0.6,  extraFrom: -40,  extraMid:  4 },
  Settings:  { scaleFrom: 0.6,  extraFrom: -60,  extraMid:  6 },
};

function TabIcon({ name, focused, color }) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Tools: focused ? 'calculator' : 'calculator-variant',
    Reference: focused ? 'book-open-variant' : 'book-open-outline',
    Settings: focused ? 'cog' : 'cog-outline',
  };

  const scale = useRef(new Animated.Value(1)).current;
  const extra = useRef(new Animated.Value(0)).current;
  const prevFocused = useRef(false);

  useEffect(() => {
    if (focused && !prevFocused.current) {
      const cfg = TAB_ANIM_CFG[name];
      scale.setValue(cfg.scaleFrom);
      extra.setValue(cfg.extraFrom);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 200, friction: 14, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(extra, { toValue: cfg.extraMid, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(extra, { toValue: 0,            duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]).start();
    }
    prevFocused.current = focused;
  }, [focused]);

  const extraTransform = name === 'Home'
    ? { translateY: extra }
    : name === 'Reference'
      ? { rotateX: extra.interpolate({ inputRange: [-40, 4], outputRange: ['-40deg', '4deg'], extrapolate: 'clamp' }) }
      : { rotate: extra.interpolate({
            inputRange: name === 'Settings' ? [-60, 6] : [-15, 4],
            outputRange: name === 'Settings' ? ['-60deg', '6deg'] : ['-15deg', '4deg'],
            extrapolate: 'clamp',
          }) };

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale }, extraTransform] }}>
        <MaterialCommunityIcons name={icons[name]} size={24} color={color} />
      </Animated.View>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 3 }} />}
    </View>
  );
}

function TabNavigator() {
  const { theme } = useContext(AppContext);
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'ios' ? 26 : 10 + insets.bottom;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.navBg,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 54 + insets.bottom,
          paddingBottom: bottomPad,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => <TabIcon name={route.name} focused={focused} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Reference" component={ReferenceScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [accent, setAccent] = useState('Slate');
  const [recentTools, setRecentTools] = useState([]);
  const [pinnedTools, setPinnedTools] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = 'input:focus,textarea:focus{outline:none!important;box-shadow:none!important;}input,textarea{caret-color:var(--tc,#4c8dff);caret-shape:bar;}';
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.multiGet(['bs_theme', 'bs_accent', 'bs_recents', 'bs_pins']).then(pairs => {
      const obj = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (obj.bs_theme) setIsDark(obj.bs_theme === 'dark');
      if (obj.bs_accent) setAccent(obj.bs_accent);
      try { if (obj.bs_recents) setRecentTools(JSON.parse(obj.bs_recents)); } catch(e) {}
      try { if (obj.bs_pins) setPinnedTools(JSON.parse(obj.bs_pins)); } catch(e) {}
    }).catch(() => {});
  }, []);

  const theme = getTheme(isDark, accent);

  const ctx = {
    theme, isDark, accent,
    setTheme: (dark) => { setIsDark(dark); AsyncStorage.setItem('bs_theme', dark ? 'dark' : 'light'); },
    setAccent: (a) => { setAccent(a); AsyncStorage.setItem('bs_accent', a); },
    recentTools, pinnedTools,
    addRecent: (id) => {
      const next = [id, ...recentTools.filter(r => r !== id)].slice(0, 6);
      setRecentTools(next);
      AsyncStorage.setItem('bs_recents', JSON.stringify(next));
    },
    setPins: (pins) => { setPinnedTools(pins); AsyncStorage.setItem('bs_pins', JSON.stringify(pins)); }
  };

  return (
    <AppContext.Provider value={ctx}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <NavigationContainer
            theme={{ dark: isDark, colors: { background: theme.bg, card: theme.s1, text: theme.text, border: theme.border, notification: theme.accent, primary: theme.accent } }}
          >
            <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'card', gestureEnabled: true, gestureDirection: 'horizontal', cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: { transform: [{ translateX: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.width, 0] }) }] }
            }) }}>
              <Stack.Screen name="Tabs" component={TabNavigator} />
              <Stack.Screen name="Tool" component={ToolScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}
