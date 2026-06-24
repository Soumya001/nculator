import React, { useContext, useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, Animated, Easing, ScrollView, Pressable, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';
import TopBar from '../components/TopBar';

function card3dShadow(rgb, isDark, danger) {
  if (Platform.OS !== 'web') return {};
  const d = danger ? true : false;
  if (isDark) {
    return { boxShadow: [
      'inset 0 1.5px 0 rgba(255,255,255,.13)',
      'inset 1px 0 0 rgba(255,255,255,.04)',
      'inset -1px 0 0 rgba(0,0,0,.2)',
      '0 0 0 1px rgba(0,0,0,.7)',
      `0 1px 0 rgba(${rgb},${d?.6:.42})`,
      '0 3px 0 rgba(0,0,0,.9)',
      '0 5px 0 rgba(0,0,0,.4)',
      `0 10px 28px rgba(${rgb},${d?.2:.13})`,
      '0 20px 55px rgba(0,0,0,.55)',
    ].join(', ') };
  }
  return { boxShadow: [
    'inset 0 1px 0 rgba(255,255,255,.95)',
    'inset 0 -1px 0 rgba(0,0,0,.04)',
    `0 0 0 1px rgba(${rgb},${d?.22:.15})`,
    `0 2px 0 rgba(${rgb},${d?.38:.26})`,
    '0 4px 0 rgba(0,0,0,.07)',
    `0 8px 22px rgba(${rgb},${d?.14:.09})`,
    '0 18px 40px rgba(0,0,0,.08)',
  ].join(', ') };
}

const ICON_DURATIONS = {
  dose: 850, drip: 550, pump: 650, weight: 600,
  infusion: 700, convert: 750, oxygen: 650, titration: 800, cannula: 650,
  creatinine: 500, reconstitution: 500, bsa: 500,
};

function getIconStyle(id, anim) {
  if (!anim) return {};
  switch (id) {
    case 'dose':
      return {
        transform: [{ rotate: anim.interpolate({ inputRange: [0, 0.15, 0.35, 0.55, 0.72, 0.85, 1], outputRange: ['0deg', '-18deg', '14deg', '-8deg', '5deg', '-2deg', '0deg'] }) }],
      };
    case 'drip':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.15, 0.55], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [-14, 5, -3, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [0.6, 1.1, 0.97, 1] }) },
        ],
      };
    case 'pump':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.7], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: ['-30deg', '8deg', '0deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 1.08, 1] }) },
        ],
      };
    case 'weight':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.6], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 0.6, 0.8, 1], outputRange: [-22, 7, -4, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.6, 0.8, 1], outputRange: [0.6, 1.1, 0.96, 1] }) },
        ],
      };
    case 'infusion':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.75], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: ['-200deg', '8deg', '0deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0.5, 1.06, 1] }) },
        ],
      };
    case 'convert':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.65], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: ['0deg', '390deg', '360deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.5, 1.1, 1] }) },
        ],
      };
    case 'oxygen':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.55], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [0.4, 1.18, 0.94, 1] }) }],
      };
    case 'titration':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.2], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.2, 0.35, 0.5, 0.65, 1], outputRange: [0.7, 1.25, 0.95, 1.15, 1, 1] }) }],
      };
    case 'cannula':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.65], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [-28, 4, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.7, 1.06, 1] }) },
        ],
      };
    default:
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.2, 0.6], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 1.1, 1] }) }],
      };
  }
}

export default function HomeScreen({ navigation }) {
  const { theme, isDark, recentTools, pinnedTools, addRecent, setPins } = useContext(AppContext);
  const [editing, setEditing] = useState(false);

  const startEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!pinnedTools?.length) {
      const fallback = (recentTools?.length ? recentTools.slice(0, 3) : ['dose', 'drip', 'titration']);
      setPins(fallback);
    }
    setEditing(true);
  }, [pinnedTools, recentTools, setPins]);

  const removePin = useCallback((id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = (pinnedTools || []).filter(p => p !== id);
    setPins(next.length ? next : null);
  }, [pinnedTools, setPins]);

  const addPin = useCallback((id) => {
    const cur = pinnedTools || [];
    if (cur.includes(id) || cur.length >= 3) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPins([...cur, id]);
  }, [pinnedTools, setPins]);
  const s = styles(theme);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const iconProgress = useRef(
    Object.fromEntries(TOOLS.map(t => [t.id, new Animated.Value(0)]))
  ).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    TOOLS.forEach(t => iconProgress[t.id].setValue(0));

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(80),
        Animated.stagger(35, TOOLS.map(t =>
          Animated.timing(iconProgress[t.id], {
            toValue: 1,
            duration: ICON_DURATIONS[t.id] ?? 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )),
      ]),
    ]).start();
  }, []));

  const featuredIds = useMemo(() => {
    if (pinnedTools?.length) return pinnedTools.slice(0, 3);
    if (recentTools?.length) return recentTools.slice(0, 3);
    return ['dose', 'drip', 'titration'];
  }, [pinnedTools, recentTools]);

  const featuredLabel = pinnedTools?.length ? 'Pinned' : recentTools?.length ? 'Recent' : 'Quick access';
  const featured  = featuredIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  const gridTools = TOOLS.filter(t => !featuredIds.includes(t.id));

  const openTool = (tool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecent(tool.id);
    navigation.push('Tool', { tool });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <SafeAreaView style={s.safe}>
      <TopBar tab="Home" />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* GREETING */}
          <View style={s.greeting}>
            <Text style={s.greetSub}>{greeting}</Text>
            <Text style={s.greetTitle}>Ready when{'\n'}you are.</Text>
            <View style={[s.greetBar, { backgroundColor: theme.accent }]} />
          </View>

          {/* FEATURED HEADER */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>{featuredLabel}</Text>
            {editing ? (
              <TouchableOpacity onPress={() => setEditing(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[s.doneText, { color: theme.accent }]}>Done</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={startEdit} style={[s.tuneBtn, { backgroundColor: theme.s2 }]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <MaterialCommunityIcons name="tune-variant" size={19} color={theme.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* FEATURED CARDS */}
          <View style={s.featuredList}>
            {featured.map((tool) => (
              <View key={tool.id} style={{ position: 'relative' }}>
                <Pressable
                  style={({ pressed }) => [s.featCard, { borderColor: `rgba(${tool.rgb},0.3)`, shadowColor: `rgba(${tool.rgb},0.5)`, ...card3dShadow(tool.rgb, isDark, tool.danger) }, pressed && !editing && s.pressed]}
                  onPress={() => editing ? null : openTool(tool)}>
                  <LinearGradient
                    colors={isDark ? [`rgba(${tool.rgb},0.22)`, '#1a1b22', '#14151b'] : [`rgba(${tool.rgb},0.12)`, '#ffffff', '#ffffff']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.featGradient}>
                    <View style={[s.featIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                      <Animated.View style={getIconStyle(tool.id, iconProgress[tool.id])}>
                        <MaterialCommunityIcons name={tool.icon} size={22} color={tool.color} />
                      </Animated.View>
                    </View>
                    <View style={s.featText}>
                      <Text style={[s.featName, { color: theme.text }]}>{tool.name}</Text>
                      <Text style={[s.featDesc, { color: theme.muted }]}>{tool.desc}</Text>
                    </View>
                    {!editing && <MaterialCommunityIcons name="chevron-right" size={22} color={tool.color} style={{ opacity: 0.7 }} />}
                  </LinearGradient>
                </Pressable>
                {editing && (
                  <TouchableOpacity onPress={() => removePin(tool.id)} style={s.removeCircle}>
                    <MaterialCommunityIcons name="minus" size={15} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* ADD TO PINNED (edit mode) */}
          {editing && (() => {
            const addable = TOOLS.filter(t => !(pinnedTools || []).includes(t.id));
            return addable.length > 0 && (pinnedTools || []).length < 3 ? (
              <View style={s.addSection}>
                <Text style={[s.addLabel, { color: theme.muted }]}>Add to pinned</Text>
                <View style={s.addChips}>
                  {addable.map(tool => (
                    <TouchableOpacity key={tool.id} onPress={() => addPin(tool.id)}
                      style={[s.addChip, { backgroundColor: `rgba(${tool.rgb},0.12)`, ...(Platform.OS === 'web' ? { boxShadow: `0 0 0 1px rgba(${tool.rgb},.22), 0 2px 0 rgba(0,0,0,.4)`, border: 'none' } : { borderColor: `rgba(${tool.rgb},0.22)` }) }]}
                      activeOpacity={0.7}>
                      <MaterialCommunityIcons name={tool.icon} size={17} color={tool.color} />
                      <Text style={[s.addChipText, { color: theme.text }]}>{tool.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null;
          })()}

          {/* DIVIDER */}
          <View style={s.divider}>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[s.dividerText, { color: theme.muted }]}>MORE</Text>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* GRID */}
          <View style={s.grid}>
            {gridTools.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => [s.gridCard, { borderColor: `rgba(${tool.rgb},0.2)`, shadowColor: `rgba(${tool.rgb},0.4)`, ...card3dShadow(tool.rgb, isDark, tool.danger) }, pressed && s.pressedGrid]}
                onPress={() => openTool(tool)}>
                <LinearGradient
                  colors={isDark ? [`rgba(${tool.rgb},0.22)`, '#1a1b22', '#14151b'] : [`rgba(${tool.rgb},0.12)`, '#ffffff', '#ffffff']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.gridGradient}>
                  <View style={[s.dotPip, { backgroundColor: tool.color }]} />
                  <View style={[s.gridIconWrap, { backgroundColor: `rgba(${tool.rgb},0.16)` }]}>
                    <Animated.View style={getIconStyle(tool.id, iconProgress[tool.id])}>
                      <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                    </Animated.View>
                  </View>
                  <Text style={[s.gridName, { color: theme.text }]}>{tool.name}</Text>
                  <Text style={[s.gridDesc, { color: theme.muted }]}>{tool.desc}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          {/* SAFETY NOTE */}
          <View style={[s.safetyNote, { backgroundColor: 'rgba(76,141,255,0.06)', borderColor: 'rgba(76,141,255,0.12)' }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="rgba(76,141,255,0.8)" style={{ marginTop: 1, marginRight: 12, flexShrink: 0 }} />
            <Text style={[s.safetyText, { color: theme.muted }]}>Every result shows its working so you can verify it. Does not replace the order or local protocol. <Text style={{ color: theme.text, fontWeight: '700' }}>The nurse is the final safety check.</Text></Text>
          </View>

        </ScrollView>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  pressed: { transform: [{ scale: 0.974 }], opacity: 0.92 },
  pressedGrid: { transform: [{ scale: 0.972 }], opacity: 0.92 },
  greeting: { marginTop: 4, marginBottom: 28 },
  greetSub: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: theme.muted, textTransform: 'uppercase' },
  greetTitle: { fontSize: 34, fontWeight: '700', color: theme.text, letterSpacing: -0.5, marginTop: 8, lineHeight: 40 },
  greetBar: { width: 36, height: 3, borderRadius: 2, marginTop: 14, opacity: 0.8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionLabel: { flex: 1, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase', opacity: 0.7 },
  tuneBtn: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: 13, fontWeight: '700', paddingVertical: 5, paddingHorizontal: 2 },
  featuredList: { gap: 9 },
  featCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, ...Platform.select({ web: {}, default: { elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 14 } }) },
  featGradient: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 19 },
  featIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  featText: { flex: 1 },
  featName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  featDesc: { fontSize: 12, marginTop: 3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.45 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  gridCard: { width: '48%', borderRadius: 20, overflow: 'hidden', borderWidth: 1, ...Platform.select({ web: {}, default: { elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 } }) },
  gridGradient: { padding: 17, paddingBottom: 20, position: 'relative' },
  dotPip: { position: 'absolute', top: 15, right: 15, width: 7, height: 7, borderRadius: 3.5 },
  gridIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  gridName: { fontSize: 14, fontWeight: '700', marginTop: 11, letterSpacing: -0.1 },
  gridDesc: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  safetyNote: { marginTop: 20, padding: 16, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start' },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 18 },
  removeCircle: { position: 'absolute', top: -7, left: -7, width: 26, height: 26, borderRadius: 13, backgroundColor: '#ef4444', borderWidth: 2, borderColor: theme.bg, alignItems: 'center', justifyContent: 'center', zIndex: 3, elevation: 5 },
  addSection: { paddingTop: 14, paddingBottom: 6 },
  addLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, opacity: 0.6 },
  addChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1 },
  addChipText: { fontSize: 12.5, fontWeight: '600' },
});
