import React, { useContext, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../../App';
import TopBar from '../components/TopBar';

const SECTION = ({ label, danger, children, theme }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={[styles.sectionLabel, { color: danger ? theme.danger : theme.muted }]}>{label}</Text>
    <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>{children}</View>
  </View>
);

const Row = ({ icon, title, body, theme, color }) => (
  <View style={styles.row}>
    <View style={[styles.rowIconWrap, { backgroundColor: theme.s2 }]}>
      <MaterialCommunityIcons name={icon} size={17} color={color || theme.muted} />
    </View>
    <View style={{ flex: 1 }}>
      {title && <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>}
      <Text style={[styles.rowBody, { color: theme.muted }]}>{body}</Text>
    </View>
  </View>
);

const Divider = ({ theme }) => <View style={[styles.div, { backgroundColor: theme.border }]} />;

const Step = ({ n, text, theme }) => (
  <View style={styles.step}>
    <View style={[styles.stepNum, { backgroundColor: theme.s2, borderColor: theme.border }]}>
      <Text style={[styles.stepNumText, { color: theme.accent }]}>{n}</Text>
    </View>
    <Text style={[styles.stepText, { color: theme.text }]}>{text}</Text>
  </View>
);

export default function ReferenceScreen() {
  const { theme } = useContext(AppContext);
  const s = styles;

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar tab="Reference" />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <SECTION label="HOW TO USE" theme={theme}>
            <Step n="1" text="Enter values exactly as written on the order — unit for unit. Do not convert in your head before entering." theme={theme} />
            <Divider theme={theme} />
            <Step n="2" text="Read the result and the working line below it. If the working doesn't match how you'd do it by hand, stop and recheck." theme={theme} />
            <Divider theme={theme} />
            <Step n="3" text="Cross-check the result against the prescriber's order. If they differ, the order is the authority — query the order, don't adjust the dose." theme={theme} />
            <Divider theme={theme} />
            <Step n="4" text="For high-risk calculations (titration, chemotherapy, paediatric), have a second qualified clinician independently verify before giving." theme={theme} />
            <Divider theme={theme} />
            <Step n="5" text="If the result or any warning feels wrong — trust that instinct. Call pharmacy or the prescriber before proceeding." theme={theme} />
          </SECTION>

          <SECTION label="WHEN NOT TO USE" danger theme={theme}>
            {['You are unfamiliar with the drug, route, or indication — look it up first.',
              'The patient is deteriorating — escalate immediately rather than calculating.',
              'Your policy mandates a pharmacist check — this app does not replace that requirement.',
              'Complex titration with multi-step adjustments — use the pump\'s validated drug library.',
              'The order is unclear or ambiguous — clarify with the prescriber before calculating.'
            ].map((t, i) => (
              <View key={i}>
                {i > 0 && <Divider theme={theme} />}
                <Row icon="close-octagon-outline" color={theme.danger} body={t} theme={theme} />
              </View>
            ))}
          </SECTION>

          <SECTION label="LEGAL & ETHICAL" theme={theme}>
            <Row icon="scale-balance" title="Not a certified medical device." body="This app is a mathematical aid. It has not been validated or approved under CE, FDA, TGA, or any other regulatory framework." theme={theme} />
            <Divider theme={theme} />
            <Row icon="clipboard-text-outline" title="The prescriber's order is the authority." body="A result that differs from the order means query the order — not that the order is wrong." theme={theme} />
            <Divider theme={theme} />
            <Row icon="account-tie-outline" title="Professional accountability stays with the clinician." body="Using this app does not transfer or reduce your professional, legal, or ethical responsibility." theme={theme} />
            <Divider theme={theme} />
            <Row icon="hospital-building" title="Local protocol takes precedence." body="Where your institution's protocol differs, follow your protocol and raise the discrepancy through the appropriate channel." theme={theme} />
            <Divider theme={theme} />
            <Row icon="baby-face-outline" title="Paediatric use requires additional caution." body="Weight-based calculations for neonates and children carry higher risk. Always apply age-appropriate references and a pharmacist check." theme={theme} />
          </SECTION>

          {/* SpO2 targets */}
          <SECTION label="OXYGEN / SPO₂ TARGETS" theme={theme}>
            <View style={styles.spo2Grid}>
              {[
                { label: 'General', range: '92–96%', sub: 'most adults · BTS/TSANZ', color: theme.primary },
                { label: 'COPD / at-risk', range: '88–92%', sub: 'hypercapnia risk', color: theme.warn },
                { label: 'Acutely ill', range: '94–98%', sub: 'sepsis, MI, stroke', color: theme.danger },
                { label: 'Paeds / neonate', range: '91–95%', sub: 'confirm per protocol', color: theme.muted },
              ].map(t => (
                <View key={t.label} style={[styles.spo2Card, { backgroundColor: theme.s2 }]}>
                  <Text style={[styles.spo2Label, { color: t.color }]}>{t.label}</Text>
                  <Text style={[styles.spo2Range, { color: theme.text }]}>{t.range}</Text>
                  <Text style={[styles.spo2Sub, { color: theme.muted }]}>{t.sub}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.warnNote, { backgroundColor: theme.warnSoft }]}>
              <MaterialCommunityIcons name="alert-outline" size={17} color={theme.warn} style={{ marginTop: 1 }} />
              <Text style={[styles.warnNoteText, { color: theme.text }]}>Titrate to the lowest flow that achieves the target. <Text style={{ fontWeight: '700' }}>Hyperoxia is harmful.</Text> Confirm unclear orders with the prescriber.</Text>
            </View>
          </SECTION>

          {/* INFO CARD */}
          <View style={[styles.infoCard, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="information-outline" size={19} color={theme.accent} style={{ marginTop: 1 }} />
            <Text style={[styles.infoText, { color: theme.text }]}>SpO₂ targets and cannula gauge tool are available from the Home and Tools tabs — tap any tool card to open it.</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 12, padding: 15, alignItems: 'flex-start' },
  rowIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  rowBody: { fontSize: 13, lineHeight: 19 },
  div: { height: 1, marginHorizontal: 15 },
  step: { flexDirection: 'row', gap: 12, padding: 15, alignItems: 'flex-start' },
  stepNum: { width: 26, height: 26, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { fontSize: 11, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 13, lineHeight: 19 },
  spo2Grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, padding: 12 },
  spo2Card: { width: '46%', padding: 13, borderRadius: 13 },
  spo2Label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  spo2Range: { fontSize: 22, fontWeight: '700', fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }), marginTop: 6, lineHeight: 26 },
  spo2Sub: { fontSize: 11, marginTop: 4, lineHeight: 15 },
  warnNote: { flexDirection: 'row', gap: 9, margin: 12, marginTop: 4, padding: 13, borderRadius: 12, alignItems: 'flex-start' },
  warnNoteText: { flex: 1, fontSize: 12.5, lineHeight: 19 },
  infoCard: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 14, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 19 },
});
