/**
 * Tampa Open Data (Socrata) API service.
 * Base URL: https://opendata.tampa.gov
 * Uses the Socrata Open Data API (SODA).
 */
import axios from 'axios';
import { SEED_PERMITS } from '../data/seedData.js';

const SOCRATA_BASE = 'https://opendata.tampa.gov/resource';
const PERMIT_DATASET = 'g9y3-pcg4';

/**
 * Fetch building permits from Tampa Open Data.
 * Falls back to seed data on error.
 */
export async function fetchTampaPermits({ limit = 50, offset = 0, type = null } = {}) {
  try {
    const params = {
      $limit: limit,
      $offset: offset,
      $order: 'applied_date DESC',
    };
    if (type) params.permit_type = type;

    const { data } = await axios.get(`${SOCRATA_BASE}/${PERMIT_DATASET}.json`, {
      params,
      timeout: 8000,
    });

    return data.map(normalizeSocrataPermit);
  } catch {
    // Return seed data on API failure
    return SEED_PERMITS.slice(offset, offset + limit);
  }
}

function normalizeSocrataPermit(raw) {
  return {
    id: raw.permit_number || raw.objectid,
    type: classifyPermitType(raw.permit_type || ''),
    subtype: raw.permit_type || 'Unknown',
    address: raw.site_address || raw.address || '',
    region: guessRegion(raw.site_address || ''),
    value: parseFloat(raw.total_value || raw.declared_valuation || 0),
    units: parseInt(raw.units || 0, 10) || null,
    status: raw.status || raw.permit_status || 'Unknown',
    applicant: raw.applicant_name || raw.owner_name || '',
    date_applied: raw.applied_date || raw.issue_date || '',
    date_issued: raw.issue_date || null,
    description: raw.description || raw.work_description || '',
    lat: raw.latitude ? parseFloat(raw.latitude) : null,
    lng: raw.longitude ? parseFloat(raw.longitude) : null,
  };
}

function classifyPermitType(type) {
  const t = type.toLowerCase();
  if (t.includes('new') && (t.includes('construct') || t.includes('build'))) return 'new-construction';
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('demolit')) return 'demolition';
  if (t.includes('renov') || t.includes('remodel') || t.includes('addition')) return 'renovation';
  if (t.includes('infra') || t.includes('utility') || t.includes('road')) return 'infrastructure';
  return 'residential';
}

function guessRegion(address) {
  const a = address.toLowerCase();
  if (a.includes('33602') || a.includes('33603') || a.includes('channelside')) return 'tampa-downtown';
  if (a.includes('33606') || a.includes('33611') || a.includes('south tampa')) return 'south-tampa';
  if (a.includes('33647') || a.includes('33544') || a.includes('new tampa') || a.includes('wesley chapel')) return 'new-tampa';
  if (a.includes('33511') || a.includes('33578') || a.includes('brandon') || a.includes('riverview')) return 'brandon';
  if (a.includes('33626') || a.includes('33625') || a.includes('westchase')) return 'westchase';
  if (a.includes('st. pete') || a.includes('st pete') || a.includes('saint pete') || a.includes('33701') || a.includes('33705')) return 'st-pete';
  if (a.includes('clearwater') || a.includes('33755') || a.includes('33756')) return 'clearwater';
  if (a.includes('largo') || a.includes('33770') || a.includes('33771')) return 'largo';
  if (a.includes('dunedin') || a.includes('palm harbor') || a.includes('34698') || a.includes('34683')) return 'dunedin';
  if (a.includes('land o lake') || a.includes('lutz') || a.includes('34638')) return 'land-o-lakes';
  if (a.includes('bradenton') || a.includes('34205') || a.includes('34208')) return 'bradenton';
  return 'tampa-downtown';
}
