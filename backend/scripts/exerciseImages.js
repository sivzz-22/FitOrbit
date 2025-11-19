// Generate SVG icon based on muscle group and difficulty
const generateMuscleIcon = (muscleGroup, difficulty) => {
  const colors = {
    'Beginner': '#10b981',    // Green
    'Intermediate': '#f59e0b', // Yellow/Orange
    'Advanced': '#ef4444'      // Red
  };
  
  const color = colors[difficulty] || colors['Beginner'];
  
  // Different SVG icons for different muscle groups
  const icons = {
    'Chest': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 30 50 Q 50 30 70 50 Q 50 70 30 50" fill="${color}"/>
      <path d="M 30 50 Q 50 40 70 50" stroke="${color}" stroke-width="3" fill="none"/>
    </svg>`,
    'Back': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 50 20 L 30 50 L 50 80 L 70 50 Z" fill="${color}"/>
      <path d="M 50 20 L 50 80" stroke="${color}" stroke-width="3"/>
    </svg>`,
    'Shoulders': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <circle cx="30" cy="40" r="12" fill="${color}"/>
      <circle cx="50" cy="35" r="12" fill="${color}"/>
      <circle cx="70" cy="40" r="12" fill="${color}"/>
      <path d="M 30 40 L 50 35 L 70 40" stroke="${color}" stroke-width="3" fill="none"/>
    </svg>`,
    'Legs': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <rect x="40" y="30" width="20" height="50" rx="10" fill="${color}"/>
      <rect x="35" y="70" width="10" height="15" rx="5" fill="${color}"/>
      <rect x="55" y="70" width="10" height="15" rx="5" fill="${color}"/>
    </svg>`,
    'Forearms': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <rect x="45" y="30" width="10" height="40" rx="5" fill="${color}"/>
      <circle cx="50" cy="35" r="8" fill="${color}"/>
    </svg>`,
    'Biceps': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 50 20 Q 60 30 65 50 Q 60 70 50 80 Q 40 70 35 50 Q 40 30 50 20" fill="${color}"/>
    </svg>`,
    'Triceps': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 50 20 L 60 50 L 50 80 L 40 50 Z" fill="${color}"/>
      <path d="M 50 20 L 50 80" stroke="${color}" stroke-width="2"/>
    </svg>`,
    'Core': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <ellipse cx="50" cy="50" rx="25" ry="15" fill="${color}"/>
      <path d="M 50 35 L 50 65" stroke="${color}" stroke-width="2"/>
      <path d="M 35 50 L 65 50" stroke="${color}" stroke-width="2"/>
    </svg>`,
    'Cardio': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 30 50 Q 50 30 70 50 Q 50 70 30 50" fill="none" stroke="${color}" stroke-width="4"/>
      <circle cx="50" cy="50" r="8" fill="${color}"/>
    </svg>`,
    'Flexibility': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <path d="M 50 20 Q 30 50 50 80" stroke="${color}" stroke-width="4" fill="none"/>
      <path d="M 50 20 Q 70 50 50 80" stroke="${color}" stroke-width="4" fill="none"/>
    </svg>`,
    'Mixed': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.2"/>
      <circle cx="50" cy="50" r="20" fill="${color}"/>
      <path d="M 50 30 L 50 70 M 30 50 L 70 50" stroke="white" stroke-width="3"/>
    </svg>`
  };
  
  const icon = icons[muscleGroup] || icons['Mixed'];
  // Encode SVG for data URI
  const encoded = encodeURIComponent(icon);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

// Helper function to get exercise image based on exercise name, muscle group, and difficulty
export const getExerciseImage = (name, targetMuscle, difficulty, category) => {
  // For Cardio and Flexibility categories, use category-specific icons
  if (category === 'Cardio') {
    return generateMuscleIcon('Cardio', difficulty);
  }
  if (category === 'Flexibility') {
    return generateMuscleIcon('Flexibility', difficulty);
  }
  if (category === 'Mixed') {
    return generateMuscleIcon('Mixed', difficulty);
  }
  
  // For Strength exercises, use the target muscle group
  const muscleGroup = targetMuscle || 'Mixed';
  return generateMuscleIcon(muscleGroup, difficulty);
};

// Legacy export for backward compatibility
export const exerciseImages = {};
