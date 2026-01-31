/**
 * MBTI Personality System for Characters
 * 16 personality types with unique traits and behaviors
 */

export const MBTI_TYPES = {
  // Analysts
  INTJ: {
    name: 'Architect',
    traits: ['Strategic', 'Independent', 'Perfectionist'],
    color: 0x6a5acd,
    preferredBuilding: 'OFFICE',
    workSpeed: 1.2,
    socialNeed: 0.3,
    energyDrain: 0.5,
  },
  INTP: {
    name: 'Logician',
    traits: ['Innovative', 'Curious', 'Abstract'],
    color: 0x4169e1,
    preferredBuilding: 'OFFICE',
    workSpeed: 1.1,
    socialNeed: 0.2,
    energyDrain: 0.6,
  },
  ENTJ: {
    name: 'Commander',
    traits: ['Bold', 'Strong-willed', 'Strategic'],
    color: 0x8b008b,
    preferredBuilding: 'OFFICE',
    workSpeed: 1.3,
    socialNeed: 0.6,
    energyDrain: 0.4,
  },
  ENTP: {
    name: 'Debater',
    traits: ['Quick', 'Inventive', 'Energetic'],
    color: 0x9370db,
    preferredBuilding: 'CAFE',
    workSpeed: 1.2,
    socialNeed: 0.7,
    energyDrain: 0.3,
  },
  
  // Diplomats
  INFJ: {
    name: 'Advocate',
    traits: ['Insightful', 'Principled', 'Idealistic'],
    color: 0x228b22,
    preferredBuilding: 'RESTAURANT',
    workSpeed: 1.0,
    socialNeed: 0.4,
    energyDrain: 0.7,
  },
  INFP: {
    name: 'Mediator',
    traits: ['Creative', 'Idealistic', 'Empathetic'],
    color: 0x32cd32,
    preferredBuilding: 'CAFE',
    workSpeed: 0.9,
    socialNeed: 0.3,
    energyDrain: 0.8,
  },
  ENFJ: {
    name: 'Protagonist',
    traits: ['Charismatic', 'Inspiring', 'Altruistic'],
    color: 0x00fa9a,
    preferredBuilding: 'RESTAURANT',
    workSpeed: 1.1,
    socialNeed: 0.8,
    energyDrain: 0.5,
  },
  ENFP: {
    name: 'Campaigner',
    traits: ['Enthusiastic', 'Creative', 'Sociable'],
    color: 0x7fff00,
    preferredBuilding: 'CAFE',
    workSpeed: 1.0,
    socialNeed: 0.9,
    energyDrain: 0.4,
  },
  
  // Sentinels
  ISTJ: {
    name: 'Logistician',
    traits: ['Practical', 'Fact-minded', 'Reliable'],
    color: 0x4682b4,
    preferredBuilding: 'OFFICE',
    workSpeed: 1.0,
    socialNeed: 0.3,
    energyDrain: 0.5,
  },
  ISFJ: {
    name: 'Defender',
    traits: ['Warm', 'Dedicated', 'Protective'],
    color: 0x87ceeb,
    preferredBuilding: 'HOUSE',
    workSpeed: 0.9,
    socialNeed: 0.5,
    energyDrain: 0.6,
  },
  ESTJ: {
    name: 'Executive',
    traits: ['Organized', 'Direct', 'Traditional'],
    color: 0x1e90ff,
    preferredBuilding: 'OFFICE',
    workSpeed: 1.2,
    socialNeed: 0.6,
    energyDrain: 0.4,
  },
  ESFJ: {
    name: 'Consul',
    traits: ['Caring', 'Social', 'Popular'],
    color: 0x00bfff,
    preferredBuilding: 'RESTAURANT',
    workSpeed: 1.0,
    socialNeed: 0.8,
    energyDrain: 0.5,
  },
  
  // Explorers
  ISTP: {
    name: 'Virtuoso',
    traits: ['Bold', 'Practical', 'Experimental'],
    color: 0xff8c00,
    preferredBuilding: 'FIRE',
    workSpeed: 1.1,
    socialNeed: 0.2,
    energyDrain: 0.4,
  },
  ISFP: {
    name: 'Adventurer',
    traits: ['Flexible', 'Charming', 'Artistic'],
    color: 0xffa500,
    preferredBuilding: 'CAFE',
    workSpeed: 0.9,
    socialNeed: 0.4,
    energyDrain: 0.6,
  },
  ESTP: {
    name: 'Entrepreneur',
    traits: ['Energetic', 'Perceptive', 'Direct'],
    color: 0xff4500,
    preferredBuilding: 'POLICE',
    workSpeed: 1.3,
    socialNeed: 0.7,
    energyDrain: 0.3,
  },
  ESFP: {
    name: 'Entertainer',
    traits: ['Spontaneous', 'Enthusiastic', 'Fun'],
    color: 0xff6347,
    preferredBuilding: 'RESTAURANT',
    workSpeed: 1.0,
    socialNeed: 0.9,
    energyDrain: 0.4,
  },
};

/**
 * Get random MBTI type
 * @returns {string} MBTI type key
 */
export function getRandomMBTI() {
  const types = Object.keys(MBTI_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Get MBTI info
 * @param {string} mbtiType - MBTI type key
 * @returns {Object} MBTI info
 */
export function getMBTIInfo(mbtiType) {
  return MBTI_TYPES[mbtiType] || MBTI_TYPES.ISFP;
}

/**
 * Calculate personality compatibility
 * @param {string} type1 - First MBTI type
 * @param {string} type2 - Second MBTI type
 * @returns {number} Compatibility score (0-1)
 */
export function calculateCompatibility(type1, type2) {
  if (!type1 || !type2) return 0.5;
  
  // Same type = high compatibility
  if (type1 === type2) return 0.9;
  
  // Opposite I/E = good balance
  const introvert1 = type1[0] === 'I';
  const introvert2 = type2[0] === 'I';
  const oppositeIE = introvert1 !== introvert2;
  
  // Same middle letters = similar thinking
  const sameMiddle = type1.slice(1, 3) === type2.slice(1, 3);
  
  // Calculate score
  let score = 0.5;
  if (oppositeIE) score += 0.2;
  if (sameMiddle) score += 0.2;
  
  return Math.min(score, 1.0);
}

/**
 * Get mood emoji based on happiness and MBTI
 * @param {string} mbtiType - MBTI type
 * @param {number} happiness - Happiness level (0-100)
 * @returns {string} Emoji
 */
export function getMoodEmoji(mbtiType, happiness) {
  const info = getMBTIInfo(mbtiType);
  
  if (happiness > 80) return '😊';
  if (happiness > 60) return '🙂';
  if (happiness > 40) return '😐';
  if (happiness > 20) return '😟';
  return '😢';
}

/**
 * Generate character speech based on MBTI
 * @param {string} mbtiType - MBTI type
 * @param {string} situation - Current situation
 * @returns {string} Speech text
 */
export function generateSpeech(mbtiType, situation = 'idle') {
  const info = getMBTIInfo(mbtiType);
  const speeches = {
    idle: [
      `${info.traits[0]}ly working...`,
      `Being ${info.traits[1].toLowerCase()}!`,
      `${info.name} at work~`,
    ],
    happy: [
      'This is amazing!',
      'Loving this place!',
      'Perfect day!',
    ],
    tired: [
      'Need a break...',
      'So exhausted...',
      'Time to rest.',
    ],
    social: [
      'Let\'s chat!',
      'Hello there!',
      'Good to see you!',
    ],
  };
  
  const options = speeches[situation] || speeches.idle;
  return options[Math.floor(Math.random() * options.length)];
}
