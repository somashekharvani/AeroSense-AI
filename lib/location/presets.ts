export interface LocationPreset {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export const PRESET_CITIES: LocationPreset[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    lat: 28.4595,
    lon: 77.0266,
  },
  {
    id: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 28.5355,
    lon: 77.391,
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 26.8467,
    lon: 80.9462,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    lat: 23.0225,
    lon: 72.5714,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    lat: 17.385,
    lon: 78.4867,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    country: 'India',
    lat: 25.5941,
    lon: 85.1376,
  },
];

export const DEFAULT_LOCATION: LocationPreset = PRESET_CITIES[0]; // Delhi
