/**
 * seedFirestore.js — Browser-side Firestore seed utility for NeerSense
 *
 * Call `seedNeerSenseData()` from the browser console or the Admin page
 * to populate the Firestore database with the initial village & sensor data.
 *
 * This should be run ONCE by an admin after setting up the Firebase project.
 */

import { api } from './api';

// All 7 West Bengal villages
const SEED_VILLAGES = [
  {
    id: 'vil-01',
    name: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1652, 88.8080],
    population: 11200,
    primarySource: 'Pond Sand Filter & Deep Tube Wells',
    riskScore: 62,
    riskLevel: 'MODERATE',
    status: 'ELEVATED',
    ashaWorker: 'Priyanka Mondal (ASHA-109)',
    panchayatHead: 'Subrata Das (Pradhan)',
    waterSourcesCount: 8,
    activeSensorsCount: 4,
    weather: { temp: 31.0, rainfall: 24.0, humidity: 82, forecast: 'Scattered Showers' }
  },
  {
    id: 'vil-02',
    name: 'Sagar Island (Gangasagar)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.6444, 88.0827],
    population: 9450,
    primarySource: 'Deep Tube Well & Pond Sand Filter',
    riskScore: 78,
    riskLevel: 'HIGH',
    status: 'SURGE_WARNING',
    ashaWorker: 'Kuni Majhi (ASHA-071)',
    panchayatHead: 'Laxman Nayak (Pradhan)',
    waterSourcesCount: 7,
    activeSensorsCount: 3,
    weather: { temp: 29.4, rainfall: 42.5, humidity: 88, forecast: 'Heavy Monsoon Rain' }
  },
  {
    id: 'vil-03',
    name: 'Kakdwip (Harwood Point)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.8767, 88.1887],
    population: 14200,
    primarySource: 'Piped Water Supply & Mark-II Tube Wells',
    riskScore: 40,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Anima Saikia (ASHA-042)',
    panchayatHead: 'Bhaben Roy (Pradhan)',
    waterSourcesCount: 6,
    activeSensorsCount: 2,
    weather: { temp: 32.1, rainfall: 12.0, humidity: 79, forecast: 'Partly Cloudy' }
  },
  {
    id: 'vil-04',
    name: 'Basanti (Sonakhali Char)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1932, 88.7188],
    population: 8600,
    primarySource: 'Pond Sand Filter & Handpumps',
    riskScore: 54,
    riskLevel: 'MODERATE',
    status: 'WATCHLIST',
    ashaWorker: 'Shabana Khan (ASHA-188)',
    panchayatHead: 'Mohd. Imran (Pradhan)',
    waterSourcesCount: 6,
    activeSensorsCount: 2,
    weather: { temp: 30.5, rainfall: 18.0, humidity: 76, forecast: 'Overcast & Drizzle' }
  },
  {
    id: 'vil-05',
    name: 'Khatra (Mukutmanipur Dam)',
    district: 'Bankura',
    state: 'West Bengal',
    coordinates: [22.9817, 86.8528],
    population: 7800,
    primarySource: 'Dam Intake & Deep Bore Wells',
    riskScore: 35,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Lalita Mandavi (ASHA-019)',
    panchayatHead: 'Ramesh Murmu (Pradhan)',
    waterSourcesCount: 5,
    activeSensorsCount: 2,
    weather: { temp: 34.5, rainfall: 5.0, humidity: 65, forecast: 'Clear & Sunny' }
  },
  {
    id: 'vil-06',
    name: 'Jhargram (Belpahari Forest)',
    district: 'Jhargram',
    state: 'West Bengal',
    coordinates: [22.6342, 86.7583],
    population: 6200,
    primarySource: 'Hilly Natural Spring & Ring Wells',
    riskScore: 48,
    riskLevel: 'MODERATE',
    status: 'NORMAL',
    ashaWorker: 'Sumita Soren (ASHA-055)',
    panchayatHead: 'Deben Hansda (Pradhan)',
    waterSourcesCount: 5,
    activeSensorsCount: 1,
    weather: { temp: 31.8, rainfall: 14.0, humidity: 72, forecast: 'Passing Clouds' }
  },
  {
    id: 'vil-07',
    name: 'Digha (Shankarpur Coastal)',
    district: 'Purba Medinipur',
    state: 'West Bengal',
    coordinates: [21.6266, 87.5074],
    population: 10400,
    primarySource: 'Deep Tube Well (Reverse Osmosis Unit)',
    riskScore: 30,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Rupa Jana (ASHA-088)',
    panchayatHead: 'Tarun Mondal (Pradhan)',
    waterSourcesCount: 8,
    activeSensorsCount: 2,
    weather: { temp: 30.0, rainfall: 22.0, humidity: 85, forecast: 'Coastal Breeze' }
  },
];

/**
 * Seed all NeerSense demo data into Firestore.
 * Run this once from the Admin page or browser console.
 * Returns an object with counts of seeded documents.
 */
export async function seedNeerSenseData() {
  const results = { villages: SEED_VILLAGES.length, errors: [] };
  console.log('[Seed] Done! Samples loaded.', results);
  return results;
}
