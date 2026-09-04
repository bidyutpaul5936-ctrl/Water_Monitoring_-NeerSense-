import React from 'react';
import { Droplet } from 'lucide-react';

const diseaseGuide = [
  {
    name: 'Cholera (Vibrio cholerae)',
    nameHindi: 'हैजा / तीव्र डायरिया',
    transmission: 'Contaminated water sources, raw flood run-off entering wells',
    symptoms: 'Profuse watery diarrhea ("rice-water stools"), rapid severe dehydration, leg cramps',
    prevention: 'Drink boiled/chlorinated water, immediate WHO ORS hydration, sanitary handwashing'
  },
  {
    name: 'Typhoid (Salmonella Typhi)',
    nameHindi: 'टाइफाइड / मियादी बुखार',
    transmission: 'Fecal-oral ingestion of contaminated drinking water and unwashed food',
    symptoms: 'Step-ladder high fever, abdominal pain, rose spots on chest, weakness',
    prevention: 'Typhoid vaccination, protect well rims with concrete platforms, boil water'
  },
  {
    name: 'Hepatitis A / Jaundice',
    nameHindi: 'पीलिया (हेपेटाइटिस ए)',
    transmission: 'Ingestion of water contaminated with viral sewage',
    symptoms: 'Yellow eyes and skin (Jaundice), dark brown urine, nausea, extreme fatigue',
    prevention: 'Avoid unprotected river/pond drinking, ensure chlorine residual > 0.2 ppm'
  },
  {
    name: 'Bacillary Dysentery (Shigella)',
    nameHindi: 'पेचिश (खूनी दस्त)',
    transmission: 'Direct waterborne bacterial transmission and houseflies',
    symptoms: 'Frequent bloody and mucus stools, severe abdominal cramping, tenesmus',
    prevention: 'Food covering, chlorination of village tube wells, Zinc supplementation'
  }
];

export default function WaterBorneDiseaseTable() {
  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Water-Borne Disease Reference Guide</h2>
            <p className="text-2xs text-sky-700">Early symptom recognition, transmission pathways, and prevention</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Disease Name</th>
                <th>Primary Transmission</th>
                <th>Key Clinical Symptoms</th>
                <th>Preventive Actions</th>
              </tr>
            </thead>
            <tbody>
              {diseaseGuide.map((d, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="font-bold text-xs text-sky-950">{d.name}</div>
                    <div className="text-2xs text-slate-500">{d.nameHindi}</div>
                  </td>
                  <td className="text-xs text-slate-700">{d.transmission}</td>
                  <td className="text-xs text-slate-700">{d.symptoms}</td>
                  <td className="text-xs font-medium text-emerald-800">{d.prevention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
