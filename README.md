<div align="center">

# 💊 Nculater

### Clinical calculators for nurses and the wider clinical team

[![Version](https://img.shields.io/badge/version-1.1.0-4ade80?style=for-the-badge&labelColor=0a0a0d)](https://github.com/Soumya001/nculater/releases)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-38bdf8?style=for-the-badge&labelColor=0a0a0d)](https://soumya001.github.io/nculater/)
[![PWA](https://img.shields.io/badge/PWA-installable-a78bfa?style=for-the-badge&labelColor=0a0a0d)](https://soumya001.github.io/nculater/)
[![License](https://img.shields.io/badge/license-MIT-fbbf24?style=for-the-badge&labelColor=0a0a0d)](LICENSE)
[![Built with Expo](https://img.shields.io/badge/built%20with-Expo-f472b6?style=for-the-badge&labelColor=0a0a0d)](https://expo.dev)

**[🚀 Live App](https://soumya001.github.io/nculater/) · [📱 React Native Source](bedside-native/) · [📋 Releases](https://github.com/Soumya001/nculater/releases)**

---

*Accurate · Transparent · Fast*

*"Make the human's verification effortless — the tool should show its working."*

</div>

---

## ✨ What is Nculater?

Nculater is a **mobile-first clinical calculator app** designed to work at the bedside — calm, clinical, and fast. Every result shows its full working so you and your checking colleague can verify the maths at a glance. No black-box answers. No guessing.

> Built to feel trustworthy and unhurried, like a tool a nurse can rely on at 3am.

---

## 🧮 12 Calculators

| # | Calculator | Formula | Safety features |
|---|---|---|---|
| 1 | 💊 **Drug dose** | (dose ÷ vial) × diluent = mL | Warns if dose > vial strength |
| 2 | 💧 **IV drip rate** | (volume × drop factor) ÷ (time × 60) | 6 drop factors · bedside spot-check (15s/30s/1min) |
| 3 | ⚡ **IV pump rate** | volume ÷ time = mL/hr | Plausibility warning on high rates |
| 4 | ⚖️ **Weight-based dose** | weight × mg/kg = total ÷ doses/day | Warns on implausible weight |
| 5 | ⏱ **Infusion time remaining** | volume ÷ rate = hours + minutes | Notes to re-check if rate changes |
| 6 | 🔄 **Unit converter** | kg↔lb · g→mg · mg→mcg · L→mL | Exact conversion factors |
| 7 | 🫁 **Oxygen / SpO₂** | Assessment tool | 4 evidence-based target ranges |
| 8 | ⚠️ **Titration (µg/kg/min)** | Concentration + pump rate | High-risk banner · independent double-check |
| 9 | 🩸 **Cannula gauge & flow** | mL/hr → mL/min → minimum gauge | Full reference table + flow-ceiling warning |
| 10 | 🧪 **Creatinine clearance** | Cockcroft–Gault | CKD staging G1–G5 |
| 11 | 💉 **Reconstitution** | drug ÷ diluent = concentration | Optional draw-up volume |
| 12 | 📐 **Body surface area** | Mosteller: √((ht × wt) ÷ 3600) | Range warning for implausible values |

---

## 🛡️ Safety by design

```
Input → Validate → Calculate → Show working → Flag anything implausible
```

- **Shows full working** for every result — e.g. `(200 ÷ 500) × 5 = 2 mL`
- **Refuses to display wrong answers** — invalid inputs show a clear error, never a bad number
- **Plausibility warnings** on implausible weights, very high rates, dose-exceeds-vial
- **Titration double-check** — re-enter the pump rate to confirm before infusing
- **Clinical governance reference** — how to use, when NOT to use, legal & ethical framework

---

## 📱 Platforms

### Web PWA (live now)
Open in Chrome or Safari → Add to Home Screen → works offline

```
https://soumya001.github.io/nculater/
```

### React Native (native app)
```bash
cd bedside-native
npm install
npx expo start        # scan QR with Expo Go app
```

### Build APK / IPA
```bash
npm install -g eas-cli
eas login
eas build --platform android   # → downloadable .apk
eas build --platform ios       # → requires Apple Developer account
```

---

## 🎨 Design

| Feature | Detail |
|---|---|
| Theme | Dark + light, switchable |
| Accent colours | Slate · Orange · Cyan · Violet · Green |
| Typography | System fonts + monospace for results |
| Animation | Spring-physics transitions |
| Navigation | Bottom tabs + horizontal stack slide |
| Inputs | Live validity states · colored borders · check icon |
| Results | Large mono numbers · sticky footer · step-by-step working |
| Dropdowns | Custom themed panels matching light/dark |

---

## 🗂️ Project structure

```
nculater/
├── 🌐 Web PWA
│   ├── index.html                # Splash + redirect
│   ├── bedside-bundle.html       # Self-contained app (fonts + JS inlined)
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (offline support)
│   └── .github/workflows/        # Auto-deploy to GitHub Pages
│
└── 📱 React Native
    └── bedside-native/
        ├── App.js                # Root: navigation + global context
        ├── app.json              # Expo config
        ├── src/
        │   ├── calculators.js    # All 12 formulas (pure JS)
        │   ├── theme.js          # Design tokens
        │   └── screens/
        │       ├── HomeScreen.js
        │       ├── ToolsScreen.js
        │       ├── ToolScreen.js
        │       ├── ReferenceScreen.js
        │       └── SettingsScreen.js
```

---

## ⚗️ Formula reference

| Calculator | Formula | Source |
|---|---|---|
| Drug dose | (dose ÷ vial strength) × diluent | Standard nursing pharmacology |
| IV drip | (volume × drop factor) ÷ (time × 60) | Standard infusion calculation |
| Titration concentration | (mg × 1000) ÷ bag volume | Critical care pharmacology |
| Titration pump rate | (dose × weight × 60) ÷ concentration | Critical care pharmacology |
| Cockcroft-Gault CrCl | ((140 − age) × weight) ÷ (72 × SCr) × 0.85 (female) | Cockcroft & Gault, 1976 |
| Mosteller BSA | √((height × weight) ÷ 3600) | Mosteller, 1987 |
| SpO₂ general target | 92–96% | BTS/TSANZ guidelines |
| SpO₂ COPD target | 88–92% | BTS/TSANZ guidelines |
| kg → lb | × 2.20462 (exact) | SI conversion |

---

## ⚖️ Clinical governance

> This app is a **mathematical aid**, not a certified medical device. It has not been validated or approved under CE, FDA, TGA, or any other regulatory framework.

- The prescriber's order is the clinical authority
- Professional accountability stays with the clinician  
- Local protocol takes precedence over any result shown here
- Paediatric use requires additional senior / pharmacist review
- See the **Reference tab** in-app for the full legal and ethical framework

---

## 🚀 Deploying your own instance

1. Fork this repo
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push any change to `main` → auto-deploys in ~30 seconds

---

## 📦 Releases

| Version | What's in it |
|---|---|
| [v1.1.0](https://github.com/Soumya001/nculater/releases/tag/v1.1.0) | React Native / Expo source — full native app |
| [v1.0.0](https://github.com/Soumya001/nculater/releases/tag/v1.0.0) | Web PWA — 12 calculators, offline-capable |

---

## 🤝 Contributing

1. Fork → branch → PR
2. All calculator logic lives in `bedside-native/src/calculators.js` — pure JS, easy to test
3. Add a new tool: add to `TOOLS` array + handle result layout in `ToolScreen.js`

---

<div align="center">

Made with care for nurses and the clinical team.

**Accuracy first. Speed second. Safety always.**

[![Live App](https://img.shields.io/badge/🌐_Live_App-soumya001.github.io/nculater-4ade80?style=for-the-badge&labelColor=0a0a0d)](https://soumya001.github.io/nculater/)

</div>
