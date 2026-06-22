import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppContext } from '../../App';

export default function ToolScreen({ route, navigation }) {
  const { tool } = route.params;
  const { theme } = useContext(AppContext);
  const [values, setValues] = useState({});
  const [titCheck, setTitCheck] = useState('');
  const s = styles(theme);

  const setValue = useCallback((key, val) => setValues(prev => ({ ...prev, [key]: val })), []);
  const getVal = (key, opts) => values[key] ?? (opts ? opts[0]?.value : '');

  // Build input object for calc function
  const inputs = {};
  tool.fields.forEach(f => { inputs[f.key] = getVal(f.key, f.options); });
  let result = null;
  try { result = tool.calc(inputs); } catch(e) { result = { err: String(e) }; }

  const isOxygen = tool.id === 'oxygen';
  const isCannula = tool.id === 'cannula';
  const isTitration = tool.id === 'titration';
  const isWeight = tool.id === 'weight';

  // Footer bar
  let footerVal = '0', footerUnit = '', footerOk = false;
  if (result && !result.err) {
    footerOk = true;
    if (isWeight) { footerVal = result.per; footerUnit = `${result.unit} per dose`; }
    else if (isCannula) { footerVal = result.minVal; footerUnit = 'mL/min'; }
    else if (isOxygen) { footerVal = result.val; footerUnit = '%'; }
    else { footerVal = result.val || '0'; footerUnit = result.unit || ''; }
  }

  const accentRgb = tool.rgb;
  const accentColor = tool.color;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* HEADER */}
        <View style={[s.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.s2 }]} onPress={() => navigation.goBack()}>
            <Text style={[s.backIcon, { color: theme.text }]}>‹</Text>
          </TouchableOpacity>
          <View style={[s.iconBadge, { backgroundColor: `rgba(${accentRgb},0.2)`, borderColor: `rgba(${accentRgb},0.4)` }]}>
            <Text style={s.iconText}>{tool.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.toolName, { color: theme.text }]}>{tool.name}</Text>
            <Text style={[s.toolDesc, { color: theme.muted }]}>{tool.desc}</Text>
          </View>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* HIGH-RISK BANNER */}
          {isTitration && (
            <View style={[s.banner, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
              <Text style={s.bannerEmoji}>⚠️</Text>
              <Text style={[s.bannerText, { color: theme.text }]}><Text style={{ color: theme.danger, fontWeight: '700' }}>High-risk.</Text> Verify independently and against your pump's drug library before infusing.</Text>
            </View>
          )}

          {/* FIELDS */}
          <View style={s.fields}>
            {tool.fields.map((field, i) => {
              const val = getVal(field.key, field.options);
              const numVal = parseFloat(val);
              const isValid = field.mode === 'select' ? true : (val !== '' && isFinite(numVal) && numVal > 0);
              const borderColor = isValid ? `rgba(${accentRgb},0.55)` : theme.border;
              const shadowColor = isValid ? `rgba(${accentRgb},0.15)` : 'transparent';

              if (field.mode === 'select') {
                const opts = field.options || [];
                return (
                  <View key={field.key} style={[s.fieldCard, { backgroundColor: theme.s2, borderColor, shadowColor, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }]}>
                    <Text style={[s.fieldLabel, { color: theme.muted }]}>{field.label}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.optScroll}>
                      <View style={s.optRow}>
                        {opts.map(opt => (
                          <TouchableOpacity key={opt.value}
                            style={[s.optChip, { backgroundColor: val === opt.value ? `rgba(${accentRgb},0.2)` : theme.s3, borderColor: val === opt.value ? `rgba(${accentRgb},0.5)` : theme.border }]}
                            onPress={() => setValue(field.key, opt.value)}>
                            <Text style={[s.optText, { color: val === opt.value ? accentColor : theme.muted, fontWeight: val === opt.value ? '700' : '400' }]}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                );
              }

              return (
                <View key={field.key} style={[s.fieldCard, { backgroundColor: theme.s2, borderColor, shadowColor, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }]}>
                  <View style={s.fieldTop}>
                    <Text style={[s.fieldLabel, { color: theme.muted }]}>{field.label}</Text>
                    {isValid && <Text style={{ color: accentColor, fontSize: 16 }}>✓</Text>}
                  </View>
                  <View style={s.fieldInputRow}>
                    <TextInput style={[s.fieldInput, { color: theme.text }]} value={val} onChangeText={v => setValue(field.key, v)}
                      keyboardType={field.mode === 'numeric' ? 'number-pad' : 'decimal-pad'}
                      placeholder="0" placeholderTextColor={theme.muted} returnKeyType="done" />
                    {field.unit ? <Text style={[s.fieldUnit, { color: theme.muted }]}>{field.unit}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* RESULT */}
          {result?.err ? (
            <View style={[s.errCard, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
              <Text style={s.errEmoji}>⚠</Text>
              <Text style={[s.errText, { color: theme.danger }]}>{result.err}</Text>
            </View>
          ) : result && (
            <View style={[s.resultCard, { backgroundColor: theme.s1, borderColor: `rgba(${accentRgb},0.2)`, shadowColor: `rgba(${accentRgb},0.1)`, shadowOpacity: 1, shadowRadius: 20, elevation: 4 }]}>

              {/* Oxygen assessment */}
              {isOxygen && result.status && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Assessment</Text>
                  <Text style={[s.statusText, { color: result.severity === 'ok' ? accentColor : result.severity === 'danger' ? theme.danger : theme.warn }]}>{result.status}</Text>
                  <Text style={[s.statusTarget, { color: theme.muted }]}>Target: {result.target} · {result.label}</Text>
                  <View style={[s.actionBox, { backgroundColor: theme.s2 }]}>
                    <Text style={[s.actionText, { color: theme.text }]}>{result.action}</Text>
                  </View>
                  <Text style={[s.noteText, { color: theme.muted }]}>{result.note}</Text>
                </View>
              )}

              {/* Weight: two blocks */}
              {isWeight && !result.err && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Total per day</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.total}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.unit}</Text>
                  </View>
                  <Text style={[s.workingText, { color: theme.muted }]}>{result.totalWorking}</Text>
                  <View style={[s.divLine, { backgroundColor: theme.border }]} />
                  <Text style={[s.resultLabel, { color: accentColor }]}>Per dose</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.per}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.unit}</Text>
                  </View>
                  <Text style={[s.workingText, { color: theme.muted }]}>{result.perWorking}</Text>
                </View>
              )}

              {/* Cannula */}
              {isCannula && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Required flow</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.minVal}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> mL/min</Text>
                  </View>
                  {result.pick ? <View style={[s.pickCard, { backgroundColor: theme.primarySoft }]}><Text style={[s.pickText, { color: theme.primary }]}>{result.pick}</Text></View> : null}
                  {result.warn ? <View style={[s.warnCard, { backgroundColor: theme.dangerSoft }]}><Text style={[s.warnText, { color: theme.danger }]}>{result.warn}</Text></View> : null}
                  <View style={[s.gaugeTable, { borderColor: theme.border }]}>
                    <View style={s.gaugeHeader}>
                      <Text style={[s.gaugeHCell, { color: theme.muted, width: 44 }]}>G</Text>
                      <Text style={[s.gaugeHCell, { color: theme.muted, flex: 1 }]}>Colour</Text>
                      <Text style={[s.gaugeHCell, { color: theme.muted, width: 80, textAlign: 'right' }]}>mL/min</Text>
                    </View>
                    {(result.rows || []).map((row, i) => (
                      <View key={row.g} style={[s.gaugeRow, { backgroundColor: row.highlighted ? `rgba(${accentRgb},0.15)` : 'transparent', borderTopColor: theme.border }]}>
                        <Text style={[s.gaugeCell, { color: theme.text, width: 44, fontWeight: '700' }]}>{row.g}</Text>
                        <Text style={[s.gaugeCell, { color: theme.muted, flex: 1 }]}>{row.color}</Text>
                        <Text style={[s.gaugeCell, { color: theme.muted, width: 80, textAlign: 'right' }]}>{row.flow}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Titration: conc + rate */}
              {isTitration && result.conc && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Concentration</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { fontSize: 36, color: theme.text }]}>{result.conc}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.concUnit}</Text>
                  </View>
                  <Text style={[s.workingText, { color: theme.muted }]}>{result.concWorking}</Text>
                  <View style={[s.divLine, { backgroundColor: theme.border }]} />
                  <Text style={[s.resultLabel, { color: accentColor }]}>Pump rate</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.rate}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.rateUnit}</Text>
                  </View>
                  <Text style={[s.workingText, { color: theme.muted }]}>{result.rateWorking}</Text>
                  {/* Double-check */}
                  <View style={[s.divLine, { backgroundColor: `rgba(${accentRgb},0.3)`, borderStyle: 'dashed' }]} />
                  <Text style={[s.checkTitle, { color: theme.text }]}>Independent double-check</Text>
                  <Text style={[s.checkSub, { color: theme.muted }]}>Re-enter the pump rate to confirm before infusing.</Text>
                  <TextInput style={[s.checkInput, { backgroundColor: theme.s2, color: theme.text, borderColor: theme.border }]}
                    value={titCheck} onChangeText={setTitCheck} keyboardType="decimal-pad" placeholder="mL/hr" placeholderTextColor={theme.muted} returnKeyType="done" />
                  {titCheck !== '' && (
                    parseFloat(titCheck) === parseFloat(result.rate)
                      ? <View style={[s.checkResult, { backgroundColor: theme.primarySoft }]}><Text style={[s.checkResultText, { color: theme.primary }]}>✓ Confirmed — matches the calculated rate.</Text></View>
                      : <View style={[s.checkResult, { backgroundColor: theme.dangerSoft }]}><Text style={[s.checkResultText, { color: theme.danger }]}>✗ Does not match — recheck before infusing.</Text></View>
                  )}
                </View>
              )}

              {/* Reconstitution */}
              {tool.id === 'reconstitution' && result.conc && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Concentration</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.conc}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.concUnit}</Text>
                  </View>
                  <Text style={[s.workingText, { color: theme.muted }]}>{result.concWorking}</Text>
                  {result.volToDraw && (<>
                    <View style={[s.divLine, { backgroundColor: theme.border }]} />
                    <Text style={[s.resultLabel, { color: accentColor }]}>Volume to draw</Text>
                    <View style={s.resultRow}>
                      <Text style={[s.bigNum, { color: theme.text }]}>{result.volToDraw}</Text>
                      <Text style={[s.bigUnit, { color: theme.muted }]}> mL</Text>
                    </View>
                    <Text style={[s.workingText, { color: theme.muted }]}>{result.drawWorking}</Text>
                  </>)}
                </View>
              )}

              {/* Standard single result */}
              {!isOxygen && !isWeight && !isCannula && !isTitration && tool.id !== 'reconstitution' && result.val !== undefined && (
                <View>
                  <Text style={[s.resultLabel, { color: theme.muted }]}>Result</Text>
                  <View style={s.resultRow}>
                    <Text style={[s.bigNum, { color: theme.text }]}>{result.val}</Text>
                    <Text style={[s.bigUnit, { color: theme.muted }]}> {result.unit}</Text>
                  </View>
                  {result.sub ? <Text style={[s.subText, { color: theme.muted }]}>{result.sub}</Text> : null}
                  {result.working ? <Text style={[s.workingText, { color: theme.muted }]}>{result.working}</Text> : null}
                  {/* Drip spot-check */}
                  {result.spotChecks && (
                    <View style={s.spotChecks}>
                      <Text style={[s.spotLabel, { color: theme.muted }]}>Bedside spot-check</Text>
                      <View style={s.spotRow}>
                        {result.spotChecks.map(sc => (
                          <View key={sc.label} style={[s.spotChip, { backgroundColor: `rgba(${accentRgb},0.1)`, borderColor: `rgba(${accentRgb},0.25)` }]}>
                            <Text style={[s.spotCount, { color: theme.text }]}>{sc.count}</Text>
                            <Text style={[s.spotTime, { color: accentColor }]}>{sc.label}</Text>
                            <Text style={[s.spotTip, { color: theme.muted }]}>{sc.tip}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {/* CrCl stage */}
                  {result.stage && (
                    <View style={[s.stageCard, { backgroundColor: theme.s2 }]}>
                      <Text style={[s.stageText, { color: result.stageSeverity === 'ok' ? accentColor : result.stageSeverity === 'danger' ? theme.danger : theme.warn }]}>{result.stage}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Warn */}
              {result.warn ? <View style={[s.warnCard, { backgroundColor: theme.warnSoft, marginTop: 12 }]}><Text style={[s.warnText, { color: theme.warn }]}>⚠ {result.warn}</Text></View> : null}
            </View>
          )}

          {/* SAFETY FOOTER */}
          <View style={[s.safetyFooter, { backgroundColor: `rgba(${accentRgb},0.06)` }]}>
            <Text style={[s.safetyText, { color: theme.muted }]}>Always double-check against the order and local protocol. <Text style={{ color: theme.text, fontWeight: '700' }}>The nurse is the final safety check.</Text></Text>
          </View>

        </ScrollView>

        {/* STICKY FOOTER */}
        <View style={[s.stickyFooter, { backgroundColor: footerOk ? accentColor : theme.s2, borderTopColor: theme.border }]}>
          {footerOk ? (<>
            <View style={{ flex: 1 }}>
              <Text style={[s.stickyLabel, { color: 'rgba(0,0,0,0.6)' }]}>Result</Text>
              <Text style={[s.stickyVal, { color: '#000' }]}>{footerVal} <Text style={{ fontSize: 18, fontWeight: '400' }}>{footerUnit}</Text></Text>
            </View>
            <Text style={{ fontSize: 28, color: 'rgba(0,0,0,0.5)' }}>✓</Text>
          </>) : (
            <Text style={[s.stickyEmpty, { color: theme.muted }]}>Enter values above to calculate</Text>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, lineHeight: 32 },
  iconBadge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  iconText: { fontSize: 22 },
  toolName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  toolDesc: { fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  banner: { flexDirection: 'row', gap: 11, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16, alignItems: 'flex-start' },
  bannerEmoji: { fontSize: 18 },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 19 },
  fields: { gap: 10, marginBottom: 14 },
  fieldCard: { borderRadius: 16, borderWidth: 1, padding: 14, shadowOffset: { width: 0, height: 2 } },
  fieldTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  fieldInputRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  fieldInput: { flex: 1, fontSize: 28, fontWeight: '600', fontFamily: 'Courier', letterSpacing: -0.5, height: 40 },
  fieldUnit: { fontSize: 14, fontWeight: '500' },
  optScroll: { marginTop: 4 },
  optRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  optChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  optText: { fontSize: 13 },
  errCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: 'flex-start', marginBottom: 14 },
  errEmoji: { fontSize: 18 },
  errText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 19 },
  resultCard: { borderRadius: 22, borderWidth: 1, padding: 22, marginBottom: 14, shadowOffset: { width: 0, height: 8 } },
  resultLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  resultRow: { flexDirection: 'row', alignItems: 'baseline' },
  bigNum: { fontSize: 52, fontWeight: '700', fontFamily: 'Courier', letterSpacing: -1, lineHeight: 60 },
  bigUnit: { fontSize: 18, fontWeight: '400' },
  subText: { fontSize: 14, fontFamily: 'Courier', marginTop: 6 },
  workingText: { fontSize: 12, fontFamily: 'Courier', marginTop: 10, lineHeight: 18 },
  divLine: { height: 1, marginVertical: 18 },
  statusText: { fontSize: 26, fontWeight: '700', fontFamily: 'Courier', marginTop: 8 },
  statusTarget: { fontSize: 12, marginTop: 4, marginBottom: 12 },
  actionBox: { padding: 12, borderRadius: 12, marginBottom: 10 },
  actionText: { fontSize: 13, lineHeight: 20 },
  noteText: { fontSize: 11, lineHeight: 17 },
  pickCard: { padding: 12, borderRadius: 12, marginTop: 10 },
  pickText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  warnCard: { padding: 12, borderRadius: 12, marginTop: 10 },
  warnText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  gaugeTable: { marginTop: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  gaugeHeader: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(128,128,128,0.06)' },
  gaugeHCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  gaugeRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  gaugeCell: { fontSize: 13, lineHeight: 18 },
  spotChecks: { marginTop: 16 },
  spotLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  spotRow: { flexDirection: 'row', gap: 8 },
  spotChip: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1 },
  spotCount: { fontSize: 22, fontWeight: '700', fontFamily: 'Courier' },
  spotTime: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  spotTip: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  stageCard: { marginTop: 12, padding: 12, borderRadius: 12 },
  stageText: { fontSize: 13, fontWeight: '600' },
  checkTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  checkSub: { fontSize: 12, lineHeight: 17, marginBottom: 12 },
  checkInput: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 20, fontFamily: 'Courier', fontWeight: '600' },
  checkResult: { marginTop: 10, padding: 13, borderRadius: 12 },
  checkResultText: { fontSize: 13, fontWeight: '700' },
  safetyFooter: { margin: 0, padding: 14, borderRadius: 16, marginTop: 4 },
  safetyText: { fontSize: 11.5, lineHeight: 17 },
  stickyFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 10 : 14, borderTopWidth: 1 },
  stickyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  stickyVal: { fontSize: 32, fontWeight: '700', fontFamily: 'Courier', letterSpacing: -0.5 },
  stickyEmpty: { fontSize: 14 },
});
