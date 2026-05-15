/**
 * Public data sources for Tampa Bay real estate monitoring.
 * All sources listed here are publicly accessible (no API key required or key noted).
 */

export const DATA_SOURCES = [
  {
    id: 'tampa-open-data',
    name: 'City of Tampa Open Data',
    url: 'https://opendata.tampa.gov',
    type: 'portal',
    description: 'Building permits, land use, business licenses',
    datasets: {
      permits: 'https://opendata.tampa.gov/resource/g9y3-pcg4.json',
      zoningApplications: 'https://opendata.tampa.gov/resource/qb6b-3jr2.json',
    },
  },
  {
    id: 'hillsborough-gis',
    name: 'Hillsborough County GIS',
    url: 'https://www.arcgis.com/sharing/rest/content/items',
    type: 'gis',
    description: 'Parcel data, zoning, flood zones, development plans',
  },
  {
    id: 'hcpa',
    name: 'Hillsborough County Property Appraiser',
    url: 'https://hcpafl.org',
    type: 'property',
    description: 'Property values, ownership, recent sales',
  },
  {
    id: 'pcpao',
    name: 'Pinellas County Property Appraiser',
    url: 'https://www.pcpao.gov',
    type: 'property',
    description: 'Pinellas property values and sales',
  },
  {
    id: 'florida-dor',
    name: 'Florida Department of Revenue',
    url: 'https://floridarevenue.com/property/Pages/DataPortal_TaxRolls.aspx',
    type: 'tax',
    description: 'Statewide tax roll data',
  },
  {
    id: 'fred-api',
    name: 'FRED (Federal Reserve Economic Data)',
    url: 'https://fred.stlouisfed.org',
    type: 'economic',
    description: 'Tampa-St. Pete-Clearwater MSA housing price indices, rental rates',
    datasets: {
      // Home Price Index – Tampa MSA
      hpi: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=ATNHPIUS45300Q',
      // Median listing price
      medianListPrice: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=MEDLISPRI45300',
    },
  },
  {
    id: 'census-api',
    name: 'US Census Bureau ACS',
    url: 'https://api.census.gov',
    type: 'demographic',
    description: 'Housing units, vacancy rates, median home values by tract',
    datasets: {
      acs5: 'https://api.census.gov/data/2022/acs/acs5',
    },
  },
  {
    id: 'fdep-egis',
    name: 'Florida DEP Environmental GIS',
    url: 'https://services.arcgis.com/Zs2aNLFN00jrS4gG/arcgis/rest/services',
    type: 'environmental',
    description: 'Coastal construction, wetlands, environmental permits',
  },
  {
    id: 'fema-nfhl',
    name: 'FEMA National Flood Hazard Layer',
    url: 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer',
    type: 'flood',
    description: 'Official FEMA flood zone boundaries',
    wmsUrl: 'https://hazards.fema.gov/gis/nfhl/services/public/NFHL/MapServer/WMSServer',
  },
  {
    id: 'tampabaytimes-rss',
    name: 'Tampa Bay Times',
    url: 'https://www.tampabay.com',
    type: 'news',
    description: 'Real estate news, development coverage',
    rssFeeds: [
      'https://www.tampabay.com/local/feed/',
      'https://www.tampabay.com/business/real-estate/feed/',
    ],
  },
  {
    id: 'wfts-rss',
    name: 'ABC Action News (WFTS)',
    url: 'https://www.abcactionnews.com',
    type: 'news',
    rssFeeds: ['https://www.abcactionnews.com/sitemap.xml'],
  },
  {
    id: 'bizjournals-rss',
    name: 'Tampa Bay Business Journal',
    url: 'https://www.bizjournals.com/tampabay',
    type: 'news',
    rssFeeds: ['https://www.bizjournals.com/tampabay/feed/news/'],
  },
];

export const PERMIT_TYPES = [
  { id: 'new-construction', label: 'New Construction', color: '#e63946' },
  { id: 'commercial', label: 'Commercial', color: '#f4a261' },
  { id: 'residential', label: 'Residential', color: '#2a9d8f' },
  { id: 'demolition', label: 'Demolition', color: '#457b9d' },
  { id: 'renovation', label: 'Renovation/Addition', color: '#6a4c93' },
  { id: 'infrastructure', label: 'Infrastructure', color: '#e9c46a' },
];

export const ZONING_CATEGORIES = [
  { id: 'residential-single', label: 'Residential Single-Family (RS)', color: '#52b788' },
  { id: 'residential-multi', label: 'Residential Multi-Family (RM)', color: '#80b918' },
  { id: 'commercial-general', label: 'Commercial General (CG)', color: '#e63946' },
  { id: 'commercial-intensive', label: 'Commercial Intensive (CI)', color: '#f4a261' },
  { id: 'industrial', label: 'Industrial (I)', color: '#457b9d' },
  { id: 'mixed-use', label: 'Mixed Use (MU)', color: '#9d4edd' },
  { id: 'planned-development', label: 'Planned Development (PD)', color: '#fb6107' },
  { id: 'open-space', label: 'Open Space / Parks', color: '#2a9d8f' },
];
