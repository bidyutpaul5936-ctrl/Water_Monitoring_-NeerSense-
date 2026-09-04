// mlEngine.js - Outbreak Early Warning & Intelligence Engine

export class OutbreakPredictionEngine {
  constructor() {
    this.config = {
      weights: {
        waterHazard: 0.35,
        symptomSurge: 0.30,
        weatherSurge: 0.20,
        historicalVulnerability: 0.15
      },
      thresholds: {
        low: 40,
        moderate: 65,
        critical: 80
      },
      spatialRadiusKm: 3.5, // Cluster radius
      timeWindowHours: 48
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // 1. Water Quality Anomaly Index (0 to 100)
  calculateWaterHazardScore(sensors, villageId, manualTests = []) {
    const villageSensors = sensors.filter(s => s.villageId === villageId);
    if (!villageSensors.length && !manualTests.length) return 20; // Default baseline

    let sensorScores = [];

    for (const sensor of villageSensors) {
      const r = sensor.currentReadings;
      if (!r) continue;

      let score = 0;
      // Turbidity: normal < 5 NTU, severe > 20 NTU
      if (r.turbidity > 20) score += 35;
      else if (r.turbidity > 10) score += 25;
      else if (r.turbidity > 5) score += 15;

      // Bacterial Coliform (E.coli CFU / 100ml surrogate): 0 is standard, >100 is high risk
      if (r.bacterialCfu > 200) score += 45;
      else if (r.bacterialCfu > 100) score += 35;
      else if (r.bacterialCfu > 30) score += 20;
      else if (r.bacterialCfu > 0) score += 10;

      // pH: safe 6.5 - 8.5
      if (r.ph < 6.0 || r.ph > 9.0) score += 15;
      else if (r.ph < 6.5 || r.ph > 8.5) score += 8;

      // Dissolved Oxygen: low DO (< 5 mg/L) indicates high organic decomposition
      if (r.doMgL < 4.0) score += 10;

      sensorScores.push(Math.min(100, score));
    }

    // Manual test kit factor (H2S black positive vials)
    const recentManual = manualTests.filter(t => t.villageId === villageId);
    let manualScore = 0;
    if (recentManual.length > 0) {
      const positives = recentManual.filter(t => t.h2sVialResult === 'BLACK_POSITIVE').length;
      manualScore = (positives / recentManual.length) * 85;
    }

    const maxSensorScore = sensorScores.length > 0 ? Math.max(...sensorScores) : 20;
    const avgSensorScore = sensorScores.length > 0 ? sensorScores.reduce((a, b) => a + b, 0) / sensorScores.length : 20;
    
    // Weight peak contamination source heavily (water is shared infrastructure)
    const compositeSensorScore = (maxSensorScore * 0.7) + (avgSensorScore * 0.3);
    return Math.min(100, Math.max(compositeSensorScore, manualScore));
  }

  // 2. Symptom Surge & Spatial Velocity Index (0 to 100)
  calculateSymptomSurgeScore(symptoms, villageId, population = 5000) {
    const now = Date.now();
    const windowMs = this.config.timeWindowHours * 3600 * 1000;
    
    const recentReports = symptoms.filter(s => {
      const reportTime = new Date(s.timestamp).getTime();
      return s.villageId === villageId && (now - reportTime) <= windowMs;
    });

    if (recentReports.length === 0) return 10;

    // Weight by severity and high-risk water-borne symptoms
    let weightedCount = 0;
    for (const rep of recentReports) {
      let weight = 1.0;
      if (rep.severity === 'CRITICAL') weight = 3.5;
      else if (rep.severity === 'SEVERE') weight = 2.5;
      else if (rep.severity === 'MODERATE') weight = 1.5;

      // Severe symptoms like Cholera, Acute Diarrhea, Typhoid
      const isHighRisk = rep.symptoms?.some(sym => 
        /diarrhea|vomiting|cholera|typhoid|jaundice/i.test(sym)
      );
      if (isHighRisk) weight *= 1.4;

      weightedCount += weight;
    }

    // Case rate per 1,000 population in 48h
    const ratePerThousand = (weightedCount / population) * 1000;

    let score = 0;
    if (ratePerThousand > 1.5) score = 95;
    else if (ratePerThousand > 0.8) score = 80;
    else if (ratePerThousand > 0.4) score = 60;
    else if (ratePerThousand > 0.2) score = 40;
    else score = Math.max(15, ratePerThousand * 100);

    // Velocity bonus (if 3+ cases arrived within last 12 hours)
    const last12h = recentReports.filter(s => (now - new Date(s.timestamp).getTime()) <= 12 * 3600 * 1000);
    if (last12h.length >= 3) score = Math.min(100, score + 15);

    return score;
  }

  // 3. Weather & Seasonal Vulnerability Index (0 to 100)
  calculateWeatherVulnerability(weather) {
    if (!weather) return 30;
    let score = 20;

    // Heavy Rainfall: Flooding / Run-off wash fecal matter into open wells
    if (weather.rainfall > 50) score += 50;
    else if (weather.rainfall > 30) score += 35;
    else if (weather.rainfall > 15) score += 20;

    // High Temperature: Enhances pathogen proliferation
    if (weather.temp > 35) score += 20;
    else if (weather.temp > 30) score += 10;

    // High Humidity
    if (weather.humidity > 85) score += 10;

    return Math.min(100, score);
  }

  // 4. Comprehensive Outbreak Risk Score & Contributing Factor Decomposition
  evaluateVillageRisk(village, allSensors, allSymptoms, manualTests = []) {
    const waterScore = this.calculateWaterHazardScore(allSensors, village.id, manualTests);
    const symptomScore = this.calculateSymptomSurgeScore(allSymptoms, village.id, village.population);
    const weatherScore = this.calculateWeatherVulnerability(village.weather);
    const baselineVulnerability = village.population > 8000 ? 55 : 45;

    const w = this.config.weights;
    const rawScore = (
      (waterScore * w.waterHazard) +
      (symptomScore * w.symptomSurge) +
      (weatherScore * w.weatherSurge) +
      (baselineVulnerability * w.historicalVulnerability)
    );

    const roundedScore = Math.min(100, Math.max(5, Math.round(rawScore)));

    let riskLevel = 'LOW';
    let status = 'NORMAL';
    if (roundedScore >= this.config.thresholds.critical) {
      riskLevel = 'CRITICAL';
      status = 'OUTBREAK_TRIGGERED';
    } else if (roundedScore >= this.config.thresholds.moderate) {
      riskLevel = 'HIGH';
      status = 'SURGE_WARNING';
    } else if (roundedScore >= this.config.thresholds.low) {
      riskLevel = 'MODERATE';
      status = 'ELEVATED';
    }

    // Explainable factor contribution percentages
    const totalWeightedSum = (waterScore * w.waterHazard) + (symptomScore * w.symptomSurge) + (weatherScore * w.weatherSurge) + (baselineVulnerability * w.historicalVulnerability);
    const factors = [
      {
        name: 'Water Quality Anomaly (Turbidity & E.coli)',
        score: Math.round(waterScore),
        contributionPct: Math.round(((waterScore * w.waterHazard) / totalWeightedSum) * 100),
        status: waterScore > 65 ? 'CRITICAL_HAZARD' : waterScore > 40 ? 'WARNING' : 'SAFE'
      },
      {
        name: 'Symptom Clustering & Case Velocity',
        score: Math.round(symptomScore),
        contributionPct: Math.round(((symptomScore * w.symptomSurge) / totalWeightedSum) * 100),
        status: symptomScore > 65 ? 'RAPID_SPIKE' : symptomScore > 35 ? 'ELEVATED' : 'STABLE'
      },
      {
        name: 'Monsoon Rainfall & Climate Vulnerability',
        score: Math.round(weatherScore),
        contributionPct: Math.round(((weatherScore * w.weatherSurge) / totalWeightedSum) * 100),
        status: weatherScore > 60 ? 'HIGH_RUNOFF_RISK' : 'NORMAL'
      }
    ];

    // 5-Day Outbreak Projection Curve
    const trendForecast = this.generateForecastTrend(roundedScore, waterScore, symptomScore);

    return {
      villageId: village.id,
      villageName: village.name,
      district: village.district,
      state: village.state,
      riskScore: roundedScore,
      riskLevel,
      status,
      waterHazardScore: Math.round(waterScore),
      symptomSurgeScore: Math.round(symptomScore),
      weatherScore: Math.round(weatherScore),
      contributingFactors: factors,
      forecast: trendForecast,
      computedAt: new Date().toISOString()
    };
  }

  // 5-day predictive trajectory using exponential acceleration model
  generateForecastTrend(currentScore, waterScore, symptomScore) {
    const days = ['Today', '+1 Day', '+2 Days', '+3 Days', '+4 Days', '+5 Days'];
    const forecast = [];
    let projected = currentScore;
    
    // If water contamination is high, projected risk rises before symptoms peak (Predictive Lead Time!)
    const contaminationPressure = (waterScore - 50) * 0.25;

    for (let i = 0; i < days.length; i++) {
      if (i === 0) {
        forecast.push({ day: days[i], score: currentScore, confidenceLow: currentScore - 2, confidenceHigh: currentScore + 2 });
      } else {
        projected = Math.min(100, Math.max(10, Math.round(projected + contaminationPressure + (Math.sin(i) * 3))));
        forecast.push({
          day: days[i],
          score: projected,
          confidenceLow: Math.max(5, projected - (i * 3)),
          confidenceHigh: Math.min(100, projected + (i * 4))
        });
      }
    }
    return forecast;
  }
}

export const predictionEngine = new OutbreakPredictionEngine();
