# JalSuraksha (जल सुरक्षा)
### Digital Surveillance & Early Warning Platform for Water-Borne Disease Outbreaks in Rural India

**Smart India Hackathon (SIH 2025) — Problem Statement 25001**  
*Ministry of Development of North Eastern Region (MDoNER) | Ministry of Health & Family Welfare | Ministry of Jal Shakti*

---

## 1. System Overview

**JalSuraksha** is an offline-first, multilingual, AI-powered digital surveillance and early warning platform designed for rural India. The system ingests three streams of continuous data:
1. **Community & ASHA/ANM Field Reports**: Voice-to-text, low-literacy icon interface, household triage, manual H2S test kit logs, and zero-internet USSD (`*999#`)/SMS fallback.
2. **IoT Water Quality Sensors**: Real-time telemetry (pH, Turbidity, Bacterial E.coli surrogate, TDS, Dissolved Oxygen) via MQTT/HTTP.
3. **Weather & Monsoon Precipitation Feeds**: Rain runoff and temperature patterns that accelerate bacterial incubation.

An integrated **AI/ML Epidemiological Prediction Engine** correlates these data streams to calculate dynamic **Outbreak Risk Scores (0–100)** with 3–5 days predictive lead-time before clinical case surges peak.

---

## 2. Dedicated Stakeholder Portals & Pages

| Portal / Page | Key Capabilities |
|---|---|
| 🏠 **Home & Slideshow** | • Interactive 4-slide hero presentation detailing water standards & surveillance<br>• Direct portal entry launchpad for Villagers, ASHA workers, and Government Admins<br>• Live system surveillance status indicator |
| 👨‍🌾 **Villagers Portal** | • **Official Water Quality Reports**: View water parameters (pH, turbidity, TDS, bacteria) and advisories published by the Admin<br>• **Enter Health Condition**: Multilingual voice input (Hindi, Bengali, English) and touch symptom selection<br>• Offline-ready with emergency 104 / 108 contact cards |
| 👩‍⚕️ **ASHA Workers Portal** | • **Villager Health Cases Feed**: Review and triage symptoms reported by villagers<br>• **Field Triage Actions**: 1-Click to give ORS/Zinc, mark home visits, or refer to PHC<br>• **Log Field Water Tests**: Rapid H2S bacterial test kits (Yellow vs Black), pH strips, chlorine |
| 🏛️ **Government & Admin** | • **Input Water Quality Data**: Form to enter and publish official water test parameters<br>• **Published Reports Registry**: Manage and review all published test records<br>• **Health Surveillance Feed**: Real-time aggregate feed of all symptoms reported across villages<br>• **System Controls**: 1-Click to Clear All Data (clean empty state) or Load Demonstration Sample Data |
| 📘 **Hygiene & ORS Guide** | • Step-by-step WHO Oral Rehydration Solution (ORS) preparation guide with voice narration<br>• Water-borne disease symptoms and prevention reference table |

---

## 3. Mathematical Risk Engine

The outbreak prediction score is calculated continuously per village:

$$\text{Risk Score} = w_1 \cdot \text{WaterHazard} + w_2 \cdot \text{SymptomVelocity} + w_3 \cdot \text{MonsoonRainfall} + w_4 \cdot \text{Vulnerability}$$

Where:
- **WaterHazard (0-100)**: Evaluates Turbidity (>5 NTU), E.coli Coliform CFU/100ml, pH deviations (<6.5 or >8.5), and H2S positive black vials.
- **SymptomVelocity (0-100)**: Time-decayed weighted sum of clinical reports per 1,000 population over 48h.
- **MonsoonRainfall (0-100)**: Precipitation >30mm/24h washes fecal runoff into shallow wells.
- **Lead-Time Advantage**: Detects water contamination 3–5 days before clinical cases overwhelm primary health centres.

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet GIS (`react-leaflet`), Recharts, Web Speech API (Voice input & Audio guidance).
- **Offline PWA**: IndexedDB offline caching, Service Worker, automatic background sync on reconnect.
- **Backend**: Node.js, Express, WebSockets for real-time live telemetry streaming.
- **Data & Seed Sets**: Realistic multi-region datasets covering Majuli Island (Assam), Sundarbans (West Bengal), Kalahandi (Odisha), Mewat (Haryana), and Bastar (Chhattisgarh).

---

## 5. Getting Started

### Unified Combined Server (Production Mode)

The entire full-stack application (Frontend UI, REST API, WebSockets, and ML prediction engine) is combined into a single unified server running on port **5000**:

```bash
# Install dependencies
npm install

# Build frontend and start the unified server
npm run serve
# (or if already built: npm start)
```

Visit the application at: **`http://localhost:5000`**

### Live Development Mode (Concurrent Vite Hot-Reload)

```bash
npm run dev
```
- Frontend with HMR: `http://localhost:5173`
- Backend API & WebSocket: `http://localhost:5000`

---

## 6. Demonstration Highlights

1. **Role Switcher**: Click the role pill in the top navbar to seamlessly switch between Villager, ASHA worker, District Official, Panchayat, and Admin.
2. **Multilingual Voice Support**: Switch to Hindi/Bengali and click the microphone or "Listen Audio Guide" buttons.
3. **Zero-Internet USSD Emulator**: Click the "Feature Phone (*999#)" button in the top bar to test live interactive dialing on a Nokia-style feature phone.
4. **Live Anomaly Simulation**: In Admin Console (`/admin`), click "Simulate Critical Pathogen Spike" to see the GIS map and early warning alerts react in real time.
5. **ASHA Microlearning**: Test the interactive H2S vial test and dehydration knowledge quizzes with instant feedback.
