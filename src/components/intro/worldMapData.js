/**
 * World Map Vector Data & Global Study Destinations for Admify Cinematic Intro
 * ViewBox: 0 0 1000 500
 */

// Origin: Dhaka, Bangladesh
export const ORIGIN = {
  id: 'bd',
  name: 'Dhaka, Bangladesh',
  shortName: 'Bangladesh',
  country: 'Bangladesh',
  x: 751,
  y: 184,
};

// 20 Global Study Destinations requested
export const DESTINATIONS = [
  // Wave 1: Major Global Education Giants
  { id: 'uk', name: 'United Kingdom', city: 'London', x: 500, y: 107, wave: 1, isMajor: true },
  { id: 'ca', name: 'Canada', city: 'Toronto', x: 280, y: 129, wave: 1, isMajor: true },
  { id: 'us', name: 'United States', city: 'New York', x: 294, y: 137, wave: 1, isMajor: true },
  { id: 'au', name: 'Australia', city: 'Sydney', x: 920, y: 344, wave: 1, isMajor: true },

  // Wave 2: Premier European Hubs
  { id: 'de', name: 'Germany', city: 'Berlin', x: 537, y: 104, wave: 2, isMajor: true },
  { id: 'fr', name: 'France', city: 'Paris', x: 506, y: 114, wave: 2, isMajor: false },
  { id: 'it', name: 'Italy', city: 'Rome', x: 535, y: 134, wave: 2, isMajor: false },
  { id: 'nl', name: 'Netherlands', city: 'Amsterdam', x: 514, y: 104, wave: 2, isMajor: true },

  // Wave 3: Asia-Pacific & Nordic Innovation
  { id: 'se', name: 'Sweden', city: 'Stockholm', x: 550, y: 85, wave: 3, isMajor: true },
  { id: 'fi', name: 'Finland', city: 'Helsinki', x: 569, y: 83, wave: 3, isMajor: false },
  { id: 'ie', name: 'Ireland', city: 'Dublin', x: 482, y: 102, wave: 3, isMajor: false },
  { id: 'jp', name: 'Japan', city: 'Tokyo', x: 888, y: 151, wave: 3, isMajor: true },
  { id: 'kr', name: 'South Korea', city: 'Seoul', x: 853, y: 146, wave: 3, isMajor: false },
  { id: 'nz', name: 'New Zealand', city: 'Auckland', x: 985, y: 352, wave: 3, isMajor: false },

  // Wave 4: Central & Western Europe
  { id: 'ch', name: 'Switzerland', city: 'Zurich', x: 524, y: 118, wave: 4, isMajor: false },
  { id: 'dk', name: 'Denmark', city: 'Copenhagen', x: 535, y: 95, wave: 4, isMajor: false },
  { id: 'no', name: 'Norway', city: 'Oslo', x: 530, y: 84, wave: 4, isMajor: false },
  { id: 'es', name: 'Spain', city: 'Madrid', x: 490, y: 138, wave: 4, isMajor: false },
  { id: 'be', name: 'Belgium', city: 'Brussels', x: 512, y: 109, wave: 4, isMajor: false },
  { id: 'at', name: 'Austria', city: 'Vienna', x: 546, y: 116, wave: 4, isMajor: false },
];

/**
 * Calculates a natural, great-circle aviation arc from origin to destination
 */
export function getFlightArc(x1, y1, x2, y2, id) {
  let cx, cy;
  if (id === 'au' || id === 'nz') {
    // Southeast arc to Australasia
    cx = (x1 + x2) / 2 + 35;
    cy = (y1 + y2) / 2 - 25;
  } else if (id === 'jp' || id === 'kr') {
    // Northeast arc to East Asia
    cx = (x1 + x2) / 2;
    cy = Math.min(y1, y2) - 28;
  } else if (id === 'us' || id === 'ca') {
    // Trans-Atlantic / Trans-Eurasian flight to North America
    cx = (x1 + x2) / 2;
    cy = Math.min(y1, y2) - 80;
  } else {
    // European corridors
    cx = (x1 + x2) / 2;
    cy = Math.min(y1, y2) - 45;
  }
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/**
 * Optimized continent outline SVG paths (1000x500 equirectangular vector projection)
 */
export const CONTINENT_PATHS = [
  // North America
  {
    id: 'north-america',
    name: 'North America',
    d: 'M 160 55 L 195 52 L 235 60 L 265 52 L 310 65 L 300 88 L 325 105 L 305 130 L 285 145 L 260 185 L 230 195 L 220 220 L 200 210 L 190 180 L 165 170 L 150 145 L 140 120 L 120 100 L 135 75 Z M 80 65 L 130 55 L 145 75 L 125 90 L 95 85 Z M 280 40 L 335 35 L 345 55 L 315 60 Z',
  },
  // South America
  {
    id: 'south-america',
    name: 'South America',
    d: 'M 265 220 L 290 225 L 320 250 L 340 280 L 325 320 L 295 380 L 275 425 L 260 415 L 270 360 L 260 300 L 245 250 L 255 225 Z',
  },
  // Europe
  {
    id: 'europe',
    name: 'Europe',
    d: 'M 480 135 L 485 115 L 505 105 L 525 100 L 550 90 L 575 100 L 565 125 L 545 135 L 520 145 L 495 145 Z M 475 110 L 490 95 L 505 110 L 490 118 Z M 520 75 L 545 60 L 555 75 L 545 95 L 525 90 Z',
  },
  // Africa
  {
    id: 'africa',
    name: 'Africa',
    d: 'M 485 150 L 530 150 L 570 175 L 595 210 L 585 260 L 550 310 L 520 345 L 505 320 L 490 270 L 470 230 L 460 195 L 475 160 Z M 590 280 L 605 285 L 595 320 L 585 305 Z',
  },
  // Asia & Middle East
  {
    id: 'asia',
    name: 'Asia',
    d: 'M 570 100 L 610 85 L 680 75 L 750 80 L 830 95 L 880 110 L 870 140 L 830 160 L 800 180 L 775 220 L 750 225 L 730 200 L 710 185 L 670 195 L 630 200 L 590 180 L 580 140 L 585 115 Z M 855 135 L 875 135 L 870 155 L 850 150 Z M 875 130 L 890 140 L 885 170 L 870 155 Z',
  },
  // Australia & Oceania
  {
    id: 'australia',
    name: 'Australia',
    d: 'M 845 285 L 895 275 L 940 300 L 935 345 L 895 365 L 850 345 L 835 315 Z M 965 340 L 980 345 L 970 375 L 955 365 Z',
  },
];
