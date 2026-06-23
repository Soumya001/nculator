import React, { useContext, useState, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, ScrollView, Pressable, TextInput, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';
import TopBar from '../components/TopBar';

export default function ToolsScreen({ navigation }) {
  const { theme, isDark, addRecent } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const s = styles(theme);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []));

  const filtered = TOOLS.filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const openTool = (tool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecent(tool.id);
    navigation.push('Tool', { tool });
  };

  return (
    <SafeAreaView style={s.safe}>
      <TopBar tab="Tools" />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>

        {/* SEARCH */}
        <View style={[s.searchWrap, { backgroundColor: theme.s2, borderColor: theme.border }]}>
          <MaterialCommunityIcons name="magnify" size={21} color={theme.muted} />
          <TextInput style={[s.searchInput, { color: theme.text }]} value={query} onChangeText={setQuery}
            placeholder="Search calculators" placeholderTextColor={theme.muted} autoCorrect={false} returnKeyType="search" />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={theme.muted} />
            </Pressable>
          )}
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.list}>
            {filtered.length === 0 && query.length > 0 && (
              <Text style={[s.noResults, { color: theme.muted }]}>No match for "{query}"</Text>
            )}
            {filtered.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => {
                  const d = tool.danger;
                  const webShadow = Platform.OS === 'web' ? { boxShadow: isDark ? [
                    'inset 0 1.5px 0 rgba(255,255,255,.13)',
                    '0 0 0 1px rgba(0,0,0,.7)',
                    `0 1px 0 rgba(${tool.rgb},${d?.6:.42})`,
                    '0 3px 0 rgba(0,0,0,.9)',
                    `0 10px 28px rgba(${tool.rgb},${d?.2:.13})`,
                    '0 20px 55px rgba(0,0,0,.55)',
                  ].join(', ') : [
                    'inset 0 1px 0 rgba(255,255,255,.95)',
                    `0 0 0 1px rgba(${tool.rgb},${d?.22:.15})`,
                    `0 2px 0 rgba(${tool.rgb},${d?.38:.26})`,
                    '0 4px 0 rgba(0,0,0,.07)',
                    `0 8px 22px rgba(${tool.rgb},${d?.14:.09})`,
                  ].join(', ') } : { shadowColor: `rgba(${tool.rgb},0.4)`, borderBottomColor: `rgba(${tool.rgb},0.38)` };
                  return [s.row, webShadow, pressed && s.pressed];
                }}
                onPress={() => openTool(tool)}>
                <LinearGradient
                  colors={isDark ? [`rgba(${tool.rgb},0.22)`, '#1a1b22', '#14151b'] : [`rgba(${tool.rgb},0.12)`, '#ffffff', '#ffffff']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.rowGradient}>
                  <View style={[s.rowIcon, { backgroundColor: `rgba(${tool.rgb},0.15)`, ...(Platform.OS === 'web' ? { boxShadow: `0 0 0 1px rgba(${tool.rgb},.22), 0 3px 12px rgba(${tool.rgb},.2), inset 0 1px 0 rgba(255,255,255,.1)` } : {}) }]}>
                    <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                  </View>
                  <View style={s.rowText}>
                    <Text style={[s.rowName, { color: theme.text }]}>{tool.name}</Text>
                    <Text style={[s.rowDesc, { color: theme.muted }]}>{tool.desc}</Text>
                  </View>
                  {tool.danger && (
                    <View style={[s.dangerBadge, { backgroundColor: theme.dangerSoft }]}>
                      <Text style={[s.dangerText, { color: theme.danger }]}>HIGH-RISK</Text>
                    </View>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </ScrollView>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  pressed: { transform: [{ scale: 0.974 }], opacity: 0.92 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, marginBottom: 18, height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  list: { gap: 10 },
  row: { borderRadius: 20, overflow: 'hidden', ...Platform.select({ web: {}, default: { elevation: 6, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 16 } }) },
  rowGradient: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 20 },
  rowIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  rowDesc: { fontSize: 12, marginTop: 2 },
  dangerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  dangerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  noResults: { textAlign: 'center', paddingVertical: 40, fontSize: 14 },
});
