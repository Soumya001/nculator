import React, { useContext, useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, Animated, Easing, ScrollView, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { AppContext } from '../../App';
import TopBar from '../components/TopBar';
import { BUILD_NUMBER } from '../buildNumber';

const ACCENTS = ['Slate', 'Orange', 'Cyan', 'Violet', 'Green'];
const ACCENT_COLORS = {
  Slate:  { dark: '#94a3b8', light: '#475569' },
  Orange: { dark: '#fb923c', light: '#ea580c' },
  Cyan:   { dark: '#2fd4d4', light: '#0a8c8c' },
  Violet: { dark: '#a98bff', light: '#6a47d0' },
  Green:  { dark: '#4cd47e', light: '#1f8a4c' },
};

const RELEASES_URL = 'https://api.github.com/repos/Soumya001/nculator/releases?per_page=10';

export default function SettingsScreen() {
  const { theme, isDark, setTheme, accent, setAccent } = useContext(AppContext);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []));

  // ── update state ──────────────────────────────────────────────────────
  const [updateStatus, setUpdateStatus] = useState('idle');
  // idle | checking | upToDate | available | downloading | error
  const [latestInfo, setLatestInfo]     = useState(null);
  const [dlProgress, setDlProgress]     = useState(0);

  const checkUpdate = useCallback(async () => {
    setUpdateStatus('checking');
    try {
      const res = await fetch(RELEASES_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const releases = await res.json();
      const latest   = releases.find(r => r.tag_name?.startsWith('android-v'));
      if (!latest) { setUpdateStatus('upToDate'); return; }
      const latestBuild = parseInt(latest.tag_name.replace('android-v', ''), 10);
      const apkAsset    = latest.assets?.find(a => a.name?.endsWith('.apk'));
      if (latestBuild > BUILD_NUMBER) {
        setLatestInfo({ build: latestBuild, name: latest.name, apkUrl: apkAsset?.browser_download_url });
        setUpdateStatus('available');
      } else {
        setUpdateStatus('upToDate');
      }
    } catch {
      setUpdateStatus('error');
    }
  }, []);

  useEffect(() => { checkUpdate(); }, []);

  const downloadAndInstall = async () => {
    if (!latestInfo?.apkUrl || Platform.OS !== 'android') return;
    setUpdateStatus('downloading');
    setDlProgress(0);
    try {
      const fileUri = FileSystem.cacheDirectory + 'nculator-update.apk';
      const info    = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) await FileSystem.deleteAsync(fileUri, { idempotent: true });

      const dl = FileSystem.createDownloadResumable(
        latestInfo.apkUrl, fileUri, {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0)
            setDlProgress(totalBytesWritten / totalBytesExpectedToWrite);
        }
      );
      const result = await dl.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');

      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/vnd.android.package-archive',
      });
      setUpdateStatus('idle');
    } catch {
      setUpdateStatus('error');
    }
  };

  // ── update row UI ─────────────────────────────────────────────────────
  const UpdateRow = () => {
    if (updateStatus === 'checking') return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="loading" size={22} color={theme.muted} />
        <Text style={[styles.rowSub, { color: theme.muted, flex: 1 }]}>Checking for updates…</Text>
      </View>
    );

    if (updateStatus === 'upToDate') return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="check-circle-outline" size={22} color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>Up to date</Text>
          <Text style={[styles.rowSub, { color: theme.muted }]}>Build #{BUILD_NUMBER} is the latest</Text>
        </View>
        <TouchableOpacity onPress={checkUpdate}
          style={[styles.retryBtn, { borderColor: theme.border, backgroundColor: theme.s2 }]}>
          <Text style={[styles.retryText, { color: theme.muted }]}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );

    if (updateStatus === 'available') return (
      <View style={{ gap: 12, padding: 16 }}>
        <View style={styles.rowInner}>
          <MaterialCommunityIcons name="arrow-up-circle-outline" size={22} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>Update available</Text>
            <Text style={[styles.rowSub, { color: theme.muted }]}>{latestInfo.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={downloadAndInstall}
          style={[styles.installBtn, { backgroundColor: theme.accent }]}>
          <MaterialCommunityIcons name="download" size={18} color="#000" />
          <Text style={styles.installText}>Download & Install</Text>
        </TouchableOpacity>
      </View>
    );

    if (updateStatus === 'downloading') return (
      <View style={{ gap: 10, padding: 16 }}>
        <View style={styles.rowInner}>
          <MaterialCommunityIcons name="download" size={22} color={theme.accent} />
          <Text style={[styles.rowTitle, { color: theme.text, flex: 1 }]}>
            Downloading… {Math.round(dlProgress * 100)}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${Math.round(dlProgress * 100)}%` }]} />
        </View>
      </View>
    );

    if (updateStatus === 'error') return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.warn} />
        <Text style={[styles.rowSub, { color: theme.muted, flex: 1 }]}>Couldn't check for updates</Text>
        <TouchableOpacity onPress={checkUpdate}
          style={[styles.retryBtn, { borderColor: theme.border, backgroundColor: theme.s2 }]}>
          <Text style={[styles.retryText, { color: theme.muted }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

    // idle
    return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="update" size={22} color={theme.muted} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>Check for updates</Text>
          <Text style={[styles.rowSub, { color: theme.muted }]}>Build #{BUILD_NUMBER}</Text>
        </View>
        <TouchableOpacity onPress={checkUpdate}
          style={[styles.retryBtn, { borderColor: theme.border, backgroundColor: theme.s2 }]}>
          <Text style={[styles.retryText, { color: theme.muted }]}>Check</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

          {/* APPEARANCE */}
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>
            <View style={styles.row}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Dark theme</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>{isDark ? 'On · night shifts' : 'Off · light mode'}</Text>
              </View>
              <Switch value={isDark} onValueChange={setTheme} trackColor={{ false: '#3e3e3e', true: theme.accent }} thumbColor="#fff" />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.row}>
              <MaterialCommunityIcons name="palette-outline" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Accent colour</Text>
                <View style={styles.swatches}>
                  {ACCENTS.map(name => {
                    const color  = ACCENT_COLORS[name][isDark ? 'dark' : 'light'];
                    const active = accent === name;
                    return (
                      <TouchableOpacity key={name} onPress={() => setAccent(name)}
                        style={[styles.swatch, { backgroundColor: color, borderWidth: active ? 2.5 : 1, borderColor: active ? theme.text : 'rgba(128,128,128,0.3)' }]}>
                        {active && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* UPDATES */}
          <Text style={[styles.sectionLabel, { color: theme.muted, marginTop: 24 }]}>UPDATES</Text>
          <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>
            <UpdateRow />
          </View>

          {/* ABOUT */}
          <Text style={[styles.sectionLabel, { color: theme.muted, marginTop: 24 }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="pill" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Nculator</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Version 1.1.0 · Build #{BUILD_NUMBER} · 12 calculators</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Safety design</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Shows working · refuses wrong answers · plausibility warnings</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <MaterialCommunityIcons name="scale-balance" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Not a medical device</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Mathematical aid only. The nurse is the final safety check.</Text>
              </View>
            </View>
          </View>

          {/* DISCLAIMER */}
          <View style={[styles.disclaimer, { backgroundColor: theme.s2, borderColor: theme.border }]}>
            <Text style={[styles.disclaimerText, { color: theme.muted }]}>This app is not a certified medical device and has not been validated under CE, FDA, TGA, or any other regulatory framework. Results are mathematical aids only. Professional accountability stays with the clinician.</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title:        { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  card:         { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  row:          { flexDirection: 'row', gap: 13, padding: 16, alignItems: 'center' },
  rowInner:     { flexDirection: 'row', gap: 13, alignItems: 'center' },
  rowTitle:     { fontSize: 15, fontWeight: '600' },
  rowSub:       { fontSize: 12, marginTop: 2 },
  divider:      { height: 1, marginHorizontal: 16 },
  swatches:     { flexDirection: 'row', gap: 10, marginTop: 12 },
  swatch:       { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  disclaimer:   { marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
  retryBtn:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  retryText:    { fontSize: 12, fontWeight: '600' },
  installBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14 },
  installText:  { fontSize: 15, fontWeight: '700', color: '#000' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 3 },
});
