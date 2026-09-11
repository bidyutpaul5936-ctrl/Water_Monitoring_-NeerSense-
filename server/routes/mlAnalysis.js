import express from 'express';
import { predictionEngine } from '../mlEngine.js';
import { state } from '../state.js';

const router = express.Router();

/**
 * POST /api/ml/risk-assessment
 * Evaluates water report readings + village health data to provide AI/ML Hazard Assessment.
 */
router.post('/risk-assessment', (req, res) => {
  try {
    const {
      villageId = 'vil-01',
      ph,
      turbidity,
      bacterialCfu,
      h2sVialResult,
      tds,
      doMgL,
      sourceType = 'TUBEWELL'
    } = req.body || {};

    const numPh = ph !== undefined && ph !== null && ph !== '' ? parseFloat(ph) : 7.2;
    const numTurbidity = turbidity !== undefined && turbidity !== null && turbidity !== '' ? parseFloat(turbidity) : 2.5;
    const numCfu = bacterialCfu !== undefined && bacterialCfu !== null && bacterialCfu !== '' ? parseFloat(bacterialCfu) : 0;
    const numTds = tds !== undefined && tds !== null && tds !== '' ? parseFloat(tds) : 220;
    const numDo = doMgL !== undefined && doMgL !== null && doMgL !== '' ? parseFloat(doMgL) : 6.8;

    // Build synthetic sensor reading for calculation
    const syntheticSensor = {
      villageId,
      currentReadings: {
        ph: numPh,
        turbidity: numTurbidity,
        bacterialCfu: numCfu,
        tds: numTds,
        doMgL: numDo,
        timestamp: new Date().toISOString()
      }
    };

    // Manual test info
    const manualTests = [];
    if (h2sVialResult) {
      manualTests.push({
        villageId,
        h2sVialResult,
        timestamp: new Date().toISOString()
      });
    }

    // Combine with current sensors in state if any
    const sensorsList = [syntheticSensor, ...(state.sensors || []).filter(s => s.villageId === villageId)];
    const waterHazardScore = predictionEngine.calculateWaterHazardScore(sensorsList, villageId, manualTests);

    // Find village or mock
    const village = (state.villages || []).find(v => v.id === villageId) || {
      id: villageId,
      name: 'Sample Village',
      district: 'Purulia',
      state: 'West Bengal',
      population: 4500,
      weather: { rainfall: 15, temp: 28, humidity: 75 }
    };

    // Symptoms in this village
    const villageSymptoms = (state.symptoms || []).filter(s => s.villageId === villageId);
    const symptomScore = predictionEngine.calculateSymptomSurgeScore(villageSymptoms, villageId, village.population || 4500);
    const weatherScore = predictionEngine.calculateWeatherVulnerability(village.weather);

    // Hazard calculation
    let phHazard = 0;
    let phReason = 'Optimal pH range (6.5 - 8.5)';
    if (numPh < 6.0) {
      phHazard = 25;
      phReason = 'Severely acidic water (pH < 6.0). Pipe corrosion & heavy metal leaching risk.';
    } else if (numPh < 6.5) {
      phHazard = 12;
      phReason = 'Mildly acidic (pH 6.0 - 6.5).';
    } else if (numPh > 8.5) {
      phHazard = 20;
      phReason = 'Alkaline water (pH > 8.5). Potential mineral or detergent runoff.';
    }

    let turbHazard = 0;
    let turbReason = 'Clear water (< 5 NTU)';
    if (numTurbidity > 20) {
      turbHazard = 35;
      turbReason = 'Extreme turbidity (> 20 NTU). High suspended solids shield pathogens from UV/chlorine.';
    } else if (numTurbidity > 10) {
      turbHazard = 25;
      turbReason = 'High turbidity (10 - 20 NTU). Microbial harboring potential.';
    } else if (numTurbidity > 5) {
      turbHazard = 15;
      turbReason = 'Moderate turbidity (5 - 10 NTU). Exceeds BIS drinking water limits.';
    }

    let microbialHazard = 0;
    let microbialReason = 'No microbial contamination detected';
    if (h2sVialResult === 'BLACK_POSITIVE' || numCfu > 100) {
      microbialHazard = 45;
      microbialReason = 'CRITICAL: Fecal coliform / H2S positive! Severe enteric pathogen presence.';
    } else if (numCfu > 30) {
      microbialHazard = 30;
      microbialReason = 'Elevated bacterial CFU detected (> 30 CFU/100ml).';
    } else if (numCfu > 0) {
      microbialHazard = 15;
      microbialReason = 'Low bacterial trace detected.';
    }

    const calculatedHazard = Math.min(100, Math.max(5, Math.round(
      (waterHazardScore * 0.5) + (phHazard + turbHazard + microbialHazard) * 0.5
    )));

    let riskLevel = 'LOW';
    let suggestedClassification = 'SAFE';
    let advisory = 'Water parameters comply with BIS 10500 standards. Safe for domestic consumption.';

    if (calculatedHazard >= 70 || microbialHazard >= 40 || numTurbidity > 25) {
      riskLevel = 'CRITICAL';
      suggestedClassification = 'CONTAMINATED';
      advisory = 'DO NOT DRINK UNTREATED. Immediate source closure, super-chlorination, and emergency boiling advisory required.';
    } else if (calculatedHazard >= 45 || numTurbidity > 8 || numPh < 6.5 || numPh > 8.5) {
      riskLevel = 'MODERATE';
      suggestedClassification = 'WARNING';
      advisory = 'Boil water for at least 1 minute before drinking or infant feeding. Halogen tablet disinfection recommended.';
    }

    const factors = [
      {
        name: 'Microbial & Pathogen Indicator',
        score: microbialHazard,
        status: microbialHazard >= 35 ? 'CRITICAL' : microbialHazard > 0 ? 'WARNING' : 'SAFE',
        description: microbialReason
      },
      {
        name: 'Turbidity & Suspended Solids',
        score: turbHazard,
        status: turbHazard >= 25 ? 'CRITICAL' : turbHazard > 10 ? 'WARNING' : 'SAFE',
        description: turbReason
      },
      {
        name: 'pH Chemical Balance',
        score: phHazard,
        status: phHazard >= 20 ? 'CRITICAL' : phHazard > 0 ? 'WARNING' : 'SAFE',
        description: phReason
      }
    ];

    const forecast = predictionEngine.generateForecastTrend(calculatedHazard, waterHazardScore, symptomScore);

    res.json({
      success: true,
      hazardScore: calculatedHazard,
      riskLevel,
      suggestedClassification,
      advisory,
      factors,
      symptomScore,
      weatherScore,
      forecast,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ML Analysis Route Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compute ML risk assessment',
      details: error.message
    });
  }
});

export default router;
