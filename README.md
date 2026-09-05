# NeerSense (नीरसेंस)
NeerSense: offline-first, multilingual AI platform predicting water-borne disease outbreaks in rural India (SIH 2025) 3–5 days in advance, via a Risk Score (0–100) combining WaterHazard, SymptomVelocity, MonsoonRainfall, and Vulnerability.

**Data inputs:** ASHA/ANM field reports (voice-to-text, icon UI, H2S kits, USSD *999#/SMS), IoT sensors (pH, turbidity, E.coli, TDS, DO via MQTT/HTTP), and monsoon/weather feeds.

**Portals:** Home (slideshow, portal launcher, status); Villagers (water reports, symptom entry, 104/108 contacts); ASHA (case feed, triage—ORS/Zinc/home visit/PHC referral, water test logging); Govt/Admin (data entry, reports registry, surveillance feed, clear/load-demo controls); Hygiene & ORS Guide (WHO ORS steps, symptom/prevention table).

**Stack:** React 18, Vite, Tailwind, Leaflet GIS, Recharts, Web Speech API; PWA with IndexedDB/Service Worker sync; Node.js/Express/WebSockets backend.

**Data:** Seeded for Majuli (Assam), Sundarbans (WB), Kalahandi (Odisha), Mewat (Haryana), Bastar (Chhattisgarh).

**Demo features:** Role switcher (Villager/ASHA/District/Panchayat/Admin), Hindi/Bengali voice support, USSD feature-phone emulator, live "Simulate Critical Pathogen Spike," H2S/dehydration quizzes.

Google Drive for ppt and video explanation: https://drive.google.com/drive/folders/1k0ACesfMFG7T6uwfVeRdLe-Qi-YLLpGq?usp=drive_link
