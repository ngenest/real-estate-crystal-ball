/**
 * Market data service.
 * Aggregates market indicators from FRED and Census APIs.
 * Falls back to seed data on error.
 */
import axios from 'axios';
import { SEED_MARKET_INDICATORS } from '../data/seedData.js';

// FRED Series IDs for Tampa-St. Pete-Clearwater MSA (CBSA 45300)
const FRED_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

// US Census ACS 5-Year Estimates
const CENSUS_BASE = 'https://api.census.gov/data/2022/acs/acs5';

/**
 * Fetch Tampa MSA home price index from FRED.
 * Returns an array of { date, value } observations.
 */
export async function fetchHousePriceIndex() {
  try {
    const { data } = await axios.get(FRED_BASE, {
      params: { id: 'ATNHPIUS45300Q' },
      timeout: 8000,
      responseType: 'text',
    });

    return parseFredCsv(data);
  } catch {
    return SEED_MARKET_INDICATORS.priceHistory.map((p) => ({
      date: p.quarter,
      value: p.medianSFR,
    }));
  }
}

/**
 * Fetch Census housing data for Hillsborough County.
 * Returns vacancy rates and median values.
 */
export async function fetchCensusHousingData() {
  try {
    const { data } = await axios.get(CENSUS_BASE, {
      params: {
        get: 'B25004_001E,B25004_002E,B25077_001E,B25064_001E',
        for: 'county:057',   // Hillsborough County FIPS
        in: 'state:12',       // Florida FIPS
        key: '',              // public endpoint (no key required for basic queries)
      },
      timeout: 8000,
    });

    if (Array.isArray(data) && data.length >= 2) {
      const [header, values] = data;
      const idx = (name) => header.indexOf(name);
      return {
        totalVacant: parseInt(values[idx('B25004_001E')], 10),
        vacantForSale: parseInt(values[idx('B25004_002E')], 10),
        medianHomeValue: parseInt(values[idx('B25077_001E')], 10),
        medianRent: parseInt(values[idx('B25064_001E')], 10),
        source: 'US Census ACS 5-Year 2022',
      };
    }
    throw new Error('Unexpected Census response');
  } catch {
    return {
      totalVacant: 42000,
      vacantForSale: 8924,
      medianHomeValue: SEED_MARKET_INDICATORS.overall.medianHomePriceSFR,
      medianRent: SEED_MARKET_INDICATORS.overall.medianRentTwoBR,
      source: 'Estimated (seed data)',
    };
  }
}

function parseFredCsv(csv) {
  const lines = csv.split('\n').filter(Boolean);
  // Skip header row
  return lines.slice(1).map((line) => {
    const [date, value] = line.split(',');
    return { date: date.trim(), value: parseFloat(value) };
  }).filter((d) => !isNaN(d.value));
}

/**
 * Returns the full market indicator snapshot (always uses seed data as base,
 * optionally enriched with live Census data).
 */
export async function fetchMarketSnapshot() {
  const [census] = await Promise.allSettled([fetchCensusHousingData()]);

  const base = { ...SEED_MARKET_INDICATORS };

  if (census.status === 'fulfilled') {
    base.overall = {
      ...base.overall,
      medianHomePriceSFR: census.value.medianHomeValue || base.overall.medianHomePriceSFR,
      medianRentTwoBR: census.value.medianRent || base.overall.medianRentTwoBR,
    };
  }

  return base;
}
