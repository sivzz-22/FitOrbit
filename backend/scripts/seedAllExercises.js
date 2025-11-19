import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Exercise from '../models/Exercise.js';
import WorkoutSection from '../models/WorkoutSection.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Helper function to generate exercise data
const createExercise = (name, category, targetMuscle, difficulty, equipment, description, instructions, proTips, variations, secondaryMuscles = []) => ({
  name,
  description,
  category,
  targetMuscle,
  secondaryMuscles,
  equipment,
  difficulty,
  instructions,
  proTips,
  variations,
  defaultSets: difficulty === 'Beginner' ? 3 : difficulty === 'Intermediate' ? 4 : 5,
  defaultReps: difficulty === 'Beginner' ? 12 : difficulty === 'Intermediate' ? 10 : 8,
  demoImage: '',
  demoVideo: ''
});

const exercises = [
  // ========== STRENGTH - CHEST ==========
  ...['Push-Ups', 'Incline Push-Ups', 'Dumbbell Floor Press', 'Chest Dips (Bench Assisted)'].map(name => 
    createExercise(
      name,
      'Strength',
      'Chest',
      'Beginner',
      name.includes('Dumbbell') ? 'Dumbbells' : name.includes('Dips') ? 'Bench' : 'Bodyweight',
      `${name} is a fundamental chest exercise that builds upper body strength and muscle mass.`,
      [
        'Start in plank position with hands slightly wider than shoulders',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep core engaged throughout the movement'
      ],
      [
        'Maintain a straight line from head to heels',
        'Control the descent - don\'t drop down',
        'Breathe out on the way up'
      ],
      []
    )
  ),
  
  ...['Bench Press', 'Incline Dumbbell Press', 'Dumbbell Flyes', 'Chest Dips'].map(name => 
    createExercise(
      name,
      'Strength',
      'Chest',
      'Intermediate',
      name.includes('Dumbbell') ? 'Dumbbells' : name.includes('Bench') ? 'Barbell, Bench' : 'Parallel Bars',
      `${name} targets the chest muscles with emphasis on the ${name.includes('Incline') ? 'upper' : name.includes('Decline') ? 'lower' : 'middle'} chest region.`,
      name.includes('Flyes') ? [
        'Lie on bench holding dumbbells above chest',
        'Lower weights in wide arc until chest stretch',
        'Squeeze chest to bring weights back together'
      ] : name.includes('Dips') ? [
        'Grip parallel bars and support body weight',
        'Lower body by bending arms',
        'Push back up to starting position'
      ] : [
        'Lie on bench, grip bar at shoulder width',
        'Lower bar to chest with control',
        'Press bar up explosively'
      ],
      [
        'Keep shoulder blades retracted',
        'Control the negative phase',
        'Don\'t bounce the weight off your chest'
      ],
      []
    )
  ),

  ...['Decline Bench Press', 'Weighted Dips', 'Clapping Push-Ups', 'Close-Grip Bench Press'].map(name => 
    createExercise(
      name,
      'Strength',
      'Chest',
      'Advanced',
      name.includes('Bench') ? 'Barbell, Bench' : name.includes('Dips') ? 'Weight Belt' : 'Bodyweight',
      `${name} is an advanced chest exercise that requires significant strength and control.`,
      name.includes('Clapping') ? [
        'Perform explosive push-up',
        'Push hard enough to lift hands off ground',
        'Clap hands together mid-air',
        'Land softly and immediately go into next rep'
      ] : name.includes('Close-Grip') ? [
        'Use narrow grip on barbell',
        'Targets triceps and inner chest',
        'Lower with control to upper chest'
      ] : [
        'Set bench to decline angle',
        'Lower weight to lower chest',
        'Press up with full range of motion'
      ],
      [
        'Focus on explosive power',
        'Maintain proper form at all times',
        'Use spotter for safety'
      ],
      [],
      name.includes('Close-Grip') ? ['Triceps'] : []
    )
  ),

  // ========== STRENGTH - BACK ==========
  ...['Superman', 'Resistance Band Rows', 'Cat-Cow Stretch', 'Reverse Snow Angels'].map(name => 
    createExercise(
      name,
      'Strength',
      'Back',
      'Beginner',
      name.includes('Band') ? 'Resistance Band' : 'Bodyweight',
      `${name} strengthens the posterior chain and improves posture.`,
      name.includes('Superman') ? [
        'Lie face down with arms extended',
        'Lift chest and legs simultaneously',
        'Hold for 2-3 seconds',
        'Lower with control'
      ] : name.includes('Cat-Cow') ? [
        'Start on hands and knees',
        'Arch back (cow) then round spine (cat)',
        'Move slowly through full range'
      ] : [
        'Lie face down with arms at sides',
        'Lift arms in wide arc overhead',
        'Return to starting position'
      ],
      [
        'Focus on squeezing shoulder blades',
        'Keep neck in neutral position',
        'Breathe throughout movement'
      ],
      [],
      []
    )
  ),

  ...['Lat Pulldown', 'Seated Cable Row', 'Bent Over Barbell Row', 'Dumbbell Row'].map(name => 
    createExercise(
      name,
      'Strength',
      'Back',
      'Intermediate',
      name.includes('Cable') ? 'Cable Machine' : name.includes('Barbell') ? 'Barbell' : name.includes('Dumbbell') ? 'Dumbbells' : 'Lat Pulldown Machine',
      `${name} targets the latissimus dorsi and rhomboids for a strong, wide back.`,
      name.includes('Pulldown') ? [
        'Sit at lat pulldown machine',
        'Grip bar wider than shoulder width',
        'Pull bar to upper chest',
        'Control the weight back up'
      ] : name.includes('Cable Row') ? [
        'Sit with feet on platform',
        'Pull handle to lower chest',
        'Squeeze shoulder blades together',
        'Return with control'
      ] : [
        'Bend at hips, keep back straight',
        'Pull weight to lower chest/upper abdomen',
        'Squeeze lats at top',
        'Lower with control'
      ],
      [
        'Keep core engaged',
        'Don\'t use momentum',
        'Focus on mind-muscle connection'
      ],
      [],
      ['Biceps', 'Rear Delts']
    )
  ),

  ...['Deadlift', 'T-Bar Row', 'Pendlay Rows', 'Weighted Pull-Ups'].map(name => 
    createExercise(
      name,
      'Strength',
      'Back',
      'Advanced',
      name.includes('Deadlift') ? 'Barbell' : name.includes('T-Bar') ? 'T-Bar Machine' : name.includes('Pull-Ups') ? 'Pull-Up Bar, Weight Belt' : 'Barbell',
      `${name} is a compound movement that builds serious back strength and overall power.`,
      name.includes('Deadlift') ? [
        'Stand with feet hip-width apart',
        'Bend at hips and knees to grip bar',
        'Drive through heels to stand up',
        'Keep bar close to body throughout'
      ] : name.includes('Pull-Ups') ? [
        'Hang from bar with overhand grip',
        'Pull body up until chin clears bar',
        'Lower with control',
        'Repeat for desired reps'
      ] : [
        'Set up with proper form',
        'Explosive pull to chest',
        'Return weight to floor',
        'Reset between each rep'
      ],
      [
        'Maintain neutral spine',
        'Engage core throughout',
        'Use proper breathing technique',
        'Start with lighter weight to master form'
      ],
      [],
      ['Hamstrings', 'Glutes', 'Core']
    )
  ),

  // ========== STRENGTH - SHOULDERS ==========
  ...['Arm Circles', 'Seated Dumbbell Press', 'Front Raises', 'Lateral Raises'].map(name => 
    createExercise(
      name,
      'Strength',
      'Shoulders',
      'Beginner',
      name.includes('Dumbbell') ? 'Dumbbells, Bench' : 'Bodyweight',
      `${name} targets the deltoid muscles for well-rounded shoulder development.`,
      name.includes('Circles') ? [
        'Stand with arms extended to sides',
        'Make small circles, gradually increasing size',
        'Reverse direction after set',
        'Keep core engaged'
      ] : name.includes('Press') ? [
        'Sit on bench with back support',
        'Press dumbbells overhead',
        'Lower with control',
        'Keep core tight'
      ] : name.includes('Front') ? [
        'Hold weights at thighs',
        'Raise arms forward to shoulder height',
        'Lower with control',
        'Avoid swinging'
      ] : [
        'Hold weights at sides',
        'Raise arms out to sides',
        'Lift to shoulder height',
        'Control the descent'
      ],
      [
        'Keep slight bend in elbows',
        'Don\'t use momentum',
        'Focus on deltoid contraction'
      ],
      [],
      []
    )
  ),

  ...['Barbell Overhead Press', 'Arnold Press', 'Upright Row', 'Face Pulls'].map(name => 
    createExercise(
      name,
      'Strength',
      'Shoulders',
      'Intermediate',
      name.includes('Barbell') ? 'Barbell' : name.includes('Face Pulls') ? 'Cable Machine' : 'Dumbbells',
      `${name} builds shoulder strength and stability through compound movement.`,
      name.includes('Arnold') ? [
        'Start with palms facing you',
        'Rotate as you press overhead',
        'Reverse rotation on way down',
        'Full range of motion'
      ] : name.includes('Upright') ? [
        'Grip bar with narrow grip',
        'Pull bar to upper chest',
        'Keep elbows high',
        'Lower with control'
      ] : name.includes('Face Pulls') ? [
        'Set cable at face height',
        'Pull rope to face level',
        'Squeeze rear delts',
        'Control the return'
      ] : [
        'Stand with feet shoulder-width',
        'Press bar overhead',
        'Keep core engaged',
        'Lower to upper chest'
      ],
      [
        'Maintain neutral spine',
        'Don\'t arch back excessively',
        'Control the weight throughout'
      ],
      [],
      ['Triceps', 'Core']
    )
  ),

  ...['Handstand Push-Ups', 'Behind-the-Neck Press', 'Landmine Press', 'Snatch-Grip High Pull'].map(name => 
    createExercise(
      name,
      'Strength',
      'Shoulders',
      'Advanced',
      name.includes('Handstand') ? 'Wall' : name.includes('Landmine') ? 'Landmine Setup' : 'Barbell',
      `${name} is an advanced shoulder exercise requiring significant strength and stability.`,
      name.includes('Handstand') ? [
        'Kick up to handstand against wall',
        'Lower head toward ground',
        'Press back up to full extension',
        'Maintain straight body line'
      ] : name.includes('Landmine') ? [
        'Hold barbell end at shoulder',
        'Press diagonally upward',
        'Rotate through movement',
        'Return with control'
      ] : [
        'Use wide grip on barbell',
        'Explosive pull to upper chest',
        'Keep elbows high',
        'Control descent'
      ],
      [
        'Master basic movements first',
        'Use spotter when needed',
        'Focus on form over weight',
        'Build up gradually'
      ],
      [],
      ['Triceps', 'Core', 'Traps']
    )
  ),

  // ========== STRENGTH - LEGS ==========
  ...['Bodyweight Squats', 'Lunges', 'Step-Ups', 'Glute Bridges'].map(name => 
    createExercise(
      name,
      'Strength',
      'Legs',
      'Beginner',
      name.includes('Step') ? 'Bench or Platform' : 'Bodyweight',
      `${name} builds lower body strength and improves functional movement patterns.`,
      name.includes('Squats') ? [
        'Stand with feet shoulder-width apart',
        'Lower as if sitting in chair',
        'Keep knees behind toes',
        'Drive through heels to stand'
      ] : name.includes('Lunges') ? [
        'Step forward into lunge position',
        'Lower back knee toward ground',
        'Push back to starting position',
        'Alternate legs'
      ] : name.includes('Step') ? [
        'Step up onto platform',
        'Drive through heel',
        'Step down with control',
        'Alternate leading leg'
      ] : [
        'Lie on back with knees bent',
        'Lift hips by squeezing glutes',
        'Hold at top',
        'Lower with control'
      ],
      [
        'Keep core engaged',
        'Maintain proper alignment',
        'Control the movement',
        'Breathe throughout'
      ],
      [],
      name.includes('Squats') || name.includes('Lunges') ? ['Glutes', 'Core'] : ['Hamstrings']
    )
  ),

  ...['Dumbbell Lunges', 'Barbell Squats', 'Romanian Deadlifts', 'Leg Press'].map(name => 
    createExercise(
      name,
      'Strength',
      'Legs',
      'Intermediate',
      name.includes('Dumbbell') ? 'Dumbbells' : name.includes('Barbell') ? 'Barbell' : 'Leg Press Machine',
      `${name} is a compound leg exercise that builds serious lower body strength.`,
      name.includes('Squats') ? [
        'Bar rests on upper back',
        'Lower until thighs parallel to floor',
        'Drive through heels to stand',
        'Keep chest up throughout'
      ] : name.includes('Romanian') ? [
        'Hold bar with overhand grip',
        'Hinge at hips, slight knee bend',
        'Lower bar along legs',
        'Feel stretch in hamstrings',
        'Return to standing'
      ] : name.includes('Press') ? [
        'Sit in leg press machine',
        'Place feet on platform',
        'Lower weight by bending knees',
        'Press back to starting position'
      ] : [
        'Hold dumbbells at sides',
        'Step forward into lunge',
        'Lower back knee',
        'Push back up',
        'Alternate legs'
      ],
      [
        'Keep core tight',
        'Maintain proper form',
        'Don\'t let knees cave in',
        'Control the weight'
      ],
      [],
      ['Glutes', 'Core', 'Calves']
    )
  ),

  ...['Barbell Front Squat', 'Bulgarian Split Squats', 'Barbell Hip Thrusts', 'Snatch Grip Deadlift'].map(name => 
    createExercise(
      name,
      'Strength',
      'Legs',
      'Advanced',
      'Barbell',
      `${name} is an advanced leg exercise that challenges strength, balance, and mobility.`,
      name.includes('Front Squat') ? [
        'Bar rests on front delts',
        'Elbows high, chest up',
        'Lower with upright torso',
        'Drive through heels'
      ] : name.includes('Bulgarian') ? [
        'Back foot elevated on bench',
        'Lower into single-leg squat',
        'Keep front knee behind toe',
        'Drive up through front heel'
      ] : name.includes('Hip Thrusts') ? [
        'Upper back on bench',
        'Bar across hips',
        'Drive hips up',
        'Squeeze glutes at top',
        'Lower with control'
      ] : [
        'Wide grip on barbell',
        'Hinge at hips',
        'Explosive pull',
        'Full extension at top'
      ],
      [
        'Master form before adding weight',
        'Use proper bracing technique',
        'Focus on full range of motion',
        'Consider using safety equipment'
      ],
      [],
      ['Glutes', 'Core', 'Back']
    )
  ),

  // ========== STRENGTH - FOREARMS ==========
  ...['Wrist Curls', 'Reverse Wrist Curls', 'Farmer\'s Carry (Light)', 'Grip Squeezer'].map(name => 
    createExercise(
      name,
      'Strength',
      'Forearms',
      'Beginner',
      name.includes('Farmer') ? 'Dumbbells' : name.includes('Grip') ? 'Grip Strengthener' : 'Dumbbell or Barbell',
      `${name} targets the forearm muscles for improved grip strength and wrist stability.`,
      name.includes('Wrist Curls') ? [
        'Sit with forearm on bench',
        'Curl weight up by flexing wrist',
        'Lower with control',
        'Full range of motion'
      ] : name.includes('Reverse') ? [
        'Sit with forearm on bench',
        'Curl weight up by extending wrist',
        'Lower slowly',
        'Focus on top contraction'
      ] : name.includes('Farmer') ? [
        'Hold heavy weights at sides',
        'Walk for distance or time',
        'Keep shoulders back',
        'Maintain upright posture'
      ] : [
        'Squeeze grip strengthener',
        'Hold for 2-3 seconds',
        'Release slowly',
        'Repeat for reps'
      ],
      [
        'Focus on full range of motion',
        'Control the movement',
        'Don\'t rush the reps',
        'Build up gradually'
      ],
      [],
      []
    )
  ),

  ...['Hammer Curls', 'Plate Pinch Holds', 'Barbell Holds', 'Reverse Barbell Curls'].map(name => 
    createExercise(
      name,
      'Strength',
      'Forearms',
      'Intermediate',
      name.includes('Plate') ? 'Weight Plates' : name.includes('Barbell') ? 'Barbell' : 'Dumbbells',
      `${name} builds forearm strength and improves grip endurance.`,
      name.includes('Hammer') ? [
        'Hold dumbbells with neutral grip',
        'Curl weights up',
        'Squeeze at top',
        'Lower with control'
      ] : name.includes('Pinch') ? [
        'Pinch weight plate between fingers',
        'Hold for time',
        'Focus on grip strength',
        'Switch hands'
      ] : name.includes('Holds') ? [
        'Hold loaded barbell',
        'Maintain grip for time',
        'Keep core engaged',
        'Build up duration'
      ] : [
        'Grip bar with overhand grip',
        'Curl bar up',
        'Focus on forearm contraction',
        'Lower slowly'
      ],
      [
        'Build up time/weight gradually',
        'Focus on grip strength',
        'Don\'t overdo it',
        'Allow recovery between sessions'
      ],
      [],
      name.includes('Hammer') ? ['Biceps'] : []
    )
  ),

  ...['Towel Pull-Ups', 'Thick Bar Holds', 'Heavy Farmer\'s Carry', 'Wrist Roller (Heavy)'].map(name => 
    createExercise(
      name,
      'Strength',
      'Forearms',
      'Advanced',
      name.includes('Towel') ? 'Pull-Up Bar, Towel' : name.includes('Thick Bar') ? 'Thick Bar' : name.includes('Farmer') ? 'Heavy Dumbbells' : 'Wrist Roller',
      `${name} is an advanced forearm exercise that significantly challenges grip strength.`,
      name.includes('Towel') ? [
        'Drape towel over pull-up bar',
        'Grip towel ends',
        'Perform pull-ups',
        'Focus on grip strength'
      ] : name.includes('Thick Bar') ? [
        'Hold thick bar with both hands',
        'Maintain grip for time',
        'Build up duration',
        'Focus on crushing grip'
      ] : name.includes('Farmer') ? [
        'Carry very heavy weights',
        'Walk for distance',
        'Maintain form',
        'Build up weight gradually'
      ] : [
        'Roll weight up using wrist motion',
        'Control the descent',
        'Alternate directions',
        'Build up weight'
      ],
      [
        'Advanced exercise - build up gradually',
        'Focus on safety',
        'Don\'t compromise form',
        'Allow adequate recovery'
      ],
      []
    )
  ),

  // ========== STRENGTH - BICEPS ==========
  ...['Dumbbell Bicep Curls', 'Hammer Curls', 'Resistance Band Curls', 'Seated Alternating Curls'].map(name => 
    createExercise(
      name,
      'Strength',
      'Biceps',
      'Beginner',
      name.includes('Band') ? 'Resistance Band' : name.includes('Seated') ? 'Dumbbells, Bench' : 'Dumbbells',
      `${name} targets the biceps muscles for arm strength and definition.`,
      name.includes('Alternating') ? [
        'Sit on bench holding dumbbells',
        'Curl one arm at a time',
        'Full range of motion',
        'Control the negative'
      ] : name.includes('Band') ? [
        'Stand on resistance band',
        'Curl handles up',
        'Squeeze biceps at top',
        'Lower with control'
      ] : [
        'Hold weights at sides',
        'Curl weights up',
        'Squeeze biceps',
        'Lower slowly'
      ],
      [
        'Keep elbows stationary',
        'Don\'t swing the weight',
        'Focus on bicep contraction',
        'Control the negative phase'
      ],
      [],
      []
    )
  ),

  ...['Barbell Curls', 'Preacher Curls', 'Concentration Curls', 'Cable Curls'].map(name => 
    createExercise(
      name,
      'Strength',
      'Biceps',
      'Intermediate',
      name.includes('Barbell') ? 'Barbell' : name.includes('Preacher') ? 'Preacher Bench, EZ Bar' : name.includes('Cable') ? 'Cable Machine' : 'Dumbbell',
      `${name} isolates the biceps for maximum muscle engagement and growth.`,
      name.includes('Preacher') ? [
        'Rest arm on preacher bench',
        'Curl weight up',
        'Full stretch at bottom',
        'Squeeze at top'
      ] : name.includes('Concentration') ? [
        'Sit, rest elbow on inner thigh',
        'Curl weight up',
        'Focus on peak contraction',
        'Lower with control'
      ] : name.includes('Cable') ? [
        'Stand facing cable machine',
        'Curl handle up',
        'Constant tension',
        'Control the return'
      ] : [
        'Hold bar with shoulder-width grip',
        'Curl bar up',
        'Squeeze biceps',
        'Lower with control'
      ],
      [
        'Focus on mind-muscle connection',
        'Don\'t use momentum',
        'Full range of motion',
        'Control the tempo'
      ],
      [],
      []
    )
  ),

  ...['Spider Curls', 'Reverse Curls', '21s', 'Machine Drop Sets'].map(name => 
    createExercise(
      name,
      'Strength',
      'Biceps',
      'Advanced',
      name.includes('Machine') ? 'Cable Machine' : name.includes('Spider') ? 'Preacher Bench' : 'Barbell or EZ Bar',
      `${name} is an advanced bicep training technique for maximum muscle stimulation.`,
      name.includes('21s') ? [
        'Do 7 reps bottom half',
        'Do 7 reps top half',
        'Do 7 full reps',
        'That\'s one set'
      ] : name.includes('Spider') ? [
        'Lie face down on incline bench',
        'Curl weight up',
        'Full range of motion',
        'Constant tension'
      ] : name.includes('Reverse') ? [
        'Grip bar with overhand grip',
        'Curl bar up',
        'Focus on forearms',
        'Lower with control'
      ] : [
        'Start with heavy weight',
        'Do reps to failure',
        'Immediately reduce weight',
        'Continue to failure again'
      ],
      [
        'Advanced technique',
        'Focus on form',
        'Don\'t overdo volume',
        'Allow recovery'
      ],
      [],
      name.includes('Reverse') ? ['Forearms'] : []
    )
  ),

  // ========== STRENGTH - TRICEPS ==========
  ...['Bench Dips', 'Cable Rope Pushdown', 'Dumbbell Kickbacks', 'Overhead Dumbbell Extension'].map(name => 
    createExercise(
      name,
      'Strength',
      'Triceps',
      'Beginner',
      name.includes('Bench') ? 'Bench' : name.includes('Cable') ? 'Cable Machine' : 'Dumbbells',
      `${name} targets the triceps muscles for arm strength and definition.`,
      name.includes('Bench Dips') ? [
        'Sit on edge of bench',
        'Place hands behind you',
        'Lower body by bending arms',
        'Push back up'
      ] : name.includes('Kickbacks') ? [
        'Bend over, support with one hand',
        'Extend arm back',
        'Squeeze triceps',
        'Return to start'
      ] : name.includes('Overhead') ? [
        'Hold dumbbell overhead',
        'Lower behind head',
        'Extend back up',
        'Keep elbows in'
      ] : [
        'Stand facing cable machine',
        'Push rope down',
        'Extend fully',
        'Control return'
      ],
      [
        'Keep elbows stationary',
        'Focus on tricep contraction',
        'Full extension',
        'Control the negative'
      ],
      [],
      []
    )
  ),

  ...['Skull Crushers', 'Close-Grip Bench Press', 'Parallel Bar Dips', 'Cable Overhead Extensions'].map(name => 
    createExercise(
      name,
      'Strength',
      'Triceps',
      'Intermediate',
      name.includes('Cable') ? 'Cable Machine' : name.includes('Bench') ? 'Barbell, Bench' : 'Parallel Bars',
      `${name} is a compound tricep exercise that builds serious arm strength.`,
      name.includes('Skull') ? [
        'Lie on bench',
        'Lower bar toward forehead',
        'Extend back up',
        'Keep elbows in'
      ] : name.includes('Close-Grip') ? [
        'Narrow grip on barbell',
        'Lower to chest',
        'Press up',
        'Focus on triceps'
      ] : name.includes('Dips') ? [
        'Support body on parallel bars',
        'Lower by bending arms',
        'Push back up',
        'Full range of motion'
      ] : [
        'Stand with cable behind',
        'Extend arms overhead',
        'Squeeze triceps',
        'Control return'
      ],
      [
        'Keep elbows tight',
        'Don\'t flare elbows',
        'Full range of motion',
        'Control the weight'
      ],
      [],
      name.includes('Close-Grip') ? ['Chest'] : []
    )
  ),

  ...['Ring Dips', 'Weighted Dips', 'JM Press', 'Heavy Close-Grip Press'].map(name => 
    createExercise(
      name,
      'Strength',
      'Triceps',
      'Advanced',
      name.includes('Ring') ? 'Rings' : name.includes('Weighted') ? 'Weight Belt' : 'Barbell, Bench',
      `${name} is an advanced tricep exercise requiring significant strength and stability.`,
      name.includes('Ring') ? [
        'Support body on rings',
        'Lower with control',
        'Push back up',
        'Maintain stability'
      ] : name.includes('JM') ? [
        'Hybrid of close-grip and skull crusher',
        'Lower bar to upper chest/neck area',
        'Press up',
        'Unique angle targets triceps'
      ] : [
        'Add weight to dips',
        'Or use heavy weight on close-grip',
        'Focus on form',
        'Build up gradually'
      ],
      [
        'Advanced movement',
        'Master basic form first',
        'Use proper progression',
        'Safety first'
      ],
      [],
      ['Chest', 'Shoulders']
    )
  ),

  // ========== STRENGTH - CORE ==========
  ...['Crunches', 'Heel Touches', 'Plank (Basic)', 'Lying Leg Raises'].map(name => 
    createExercise(
      name,
      'Strength',
      'Core',
      'Beginner',
      'Bodyweight',
      `${name} strengthens the core muscles for better stability and posture.`,
      name.includes('Crunches') ? [
        'Lie on back, knees bent',
        'Lift shoulders off ground',
        'Squeeze abs',
        'Lower with control'
      ] : name.includes('Heel') ? [
        'Lie on back',
        'Reach to touch heels',
        'Alternate sides',
        'Keep core engaged'
      ] : name.includes('Plank') ? [
        'Support on forearms and toes',
        'Keep body straight',
        'Hold position',
        'Breathe normally'
      ] : [
        'Lie on back',
        'Lift legs up',
        'Lower with control',
        'Keep lower back pressed down'
      ],
      [
        'Focus on core engagement',
        'Don\'t strain neck',
        'Breathe throughout',
        'Quality over quantity'
      ],
      [],
      []
    )
  ),

  ...['Mountain Climbers', 'Russian Twists', 'Hanging Knee Raises', 'Bicycle Crunches'].map(name => 
    createExercise(
      name,
      'Strength',
      'Core',
      'Intermediate',
      name.includes('Hanging') ? 'Pull-Up Bar' : 'Bodyweight',
      `${name} challenges the core with dynamic movement and increased difficulty.`,
      name.includes('Mountain') ? [
        'Start in plank position',
        'Alternate bringing knees to chest',
        'Keep hips level',
        'Maintain pace'
      ] : name.includes('Russian') ? [
        'Sit, lean back slightly',
        'Rotate torso side to side',
        'Can hold weight for added difficulty',
        'Keep core engaged'
      ] : name.includes('Hanging') ? [
        'Hang from pull-up bar',
        'Raise knees up',
        'Lower with control',
        'Avoid swinging'
      ] : [
        'Lie on back',
        'Alternate elbow to opposite knee',
        'Keep shoulders off ground',
        'Maintain rhythm'
      ],
      [
        'Control the movement',
        'Focus on core',
        'Don\'t rush',
        'Maintain form'
      ],
      [],
      []
    )
  ),

  ...['Dragon Flags', 'Ab Wheel Rollouts', 'Toes-to-Bar', 'Weighted Decline Sit-Ups'].map(name => 
    createExercise(
      name,
      'Strength',
      'Core',
      'Advanced',
      name.includes('Wheel') ? 'Ab Wheel' : name.includes('Decline') ? 'Decline Bench, Weight' : name.includes('Toes') ? 'Pull-Up Bar' : 'Bench',
      `${name} is an advanced core exercise requiring exceptional strength and control.`,
      name.includes('Dragon') ? [
        'Lie on bench, grip behind head',
        'Lift entire body up',
        'Keep body straight',
        'Lower with control'
      ] : name.includes('Wheel') ? [
        'Start on knees with wheel',
        'Roll forward',
        'Extend fully',
        'Roll back to start'
      ] : name.includes('Toes') ? [
        'Hang from bar',
        'Raise feet to touch bar',
        'Lower with control',
        'Full range of motion'
      ] : [
        'Secure on decline bench',
        'Hold weight',
        'Sit up',
        'Lower with control'
      ],
      [
        'Very advanced movement',
        'Build up gradually',
        'Focus on form',
        'Use proper progression'
      ],
      [],
      []
    )
  ),

  // ========== MIXED CATEGORY ==========
  ...['Goblet Squats', 'Step-Ups', 'Light Kettlebell Swings', 'Bodyweight Lunges'].map(name => 
    createExercise(
      name,
      'Mixed',
      'Legs',
      'Beginner',
      name.includes('Goblet') ? 'Dumbbell or Kettlebell' : name.includes('Kettlebell') ? 'Kettlebell' : name.includes('Step') ? 'Bench' : 'Bodyweight',
      `${name} combines strength and endurance for functional fitness.`,
      name.includes('Goblet') ? [
        'Hold weight at chest',
        'Squat down',
        'Drive through heels',
        'Keep chest up'
      ] : name.includes('Kettlebell') ? [
        'Hinge at hips',
        'Swing kettlebell to chest height',
        'Use hip drive',
        'Control the swing'
      ] : [
        'Step up onto platform',
        'Drive through heel',
        'Step down',
        'Alternate legs'
      ],
      [
        'Focus on form',
        'Control the movement',
        'Build up gradually',
        'Maintain proper breathing'
      ],
      [],
      ['Glutes', 'Core']
    )
  ),

  ...['Burpees', 'Thrusters', 'Kettlebell Clean & Press', 'Medicine Ball Slams'].map(name => 
    createExercise(
      name,
      'Mixed',
      'Full Body',
      'Intermediate',
      name.includes('Kettlebell') ? 'Kettlebell' : name.includes('Medicine') ? 'Medicine Ball' : name.includes('Thrusters') ? 'Barbell or Dumbbells' : 'Bodyweight',
      `${name} combines strength and cardio for high-intensity training.`,
      name.includes('Burpees') ? [
        'Squat down, hands to floor',
        'Jump feet back to plank',
        'Do push-up (optional)',
        'Jump feet forward, jump up'
      ] : name.includes('Thrusters') ? [
        'Hold weight at shoulders',
        'Squat down',
        'As you stand, press overhead',
        'Return to shoulders'
      ] : name.includes('Clean') ? [
        'Swing kettlebell up',
        'Catch at shoulder',
        'Press overhead',
        'Return and repeat'
      ] : [
        'Lift ball overhead',
        'Slam down with force',
        'Catch and repeat',
        'Use full body power'
      ],
      [
        'Maintain form under fatigue',
        'Control breathing',
        'Build up intensity gradually',
        'Stay hydrated'
      ],
      [],
      ['Core', 'Shoulders', 'Legs']
    )
  ),

  ...['Barbell Complex (Deadlift → Row → Clean → Press)', 'Man Makers', 'Box Jump Burpees', 'Snatch to Overhead Lunge'].map(name => 
    createExercise(
      name,
      'Mixed',
      'Full Body',
      'Advanced',
      name.includes('Barbell') ? 'Barbell' : name.includes('Box') ? 'Box' : name.includes('Snatch') ? 'Barbell' : 'Dumbbells',
      `${name} is an advanced full-body exercise combining multiple movements for maximum intensity.`,
      name.includes('Complex') ? [
        'Perform deadlift',
        'Row to chest',
        'Clean to shoulders',
        'Press overhead',
        'That\'s one rep'
      ] : name.includes('Man Makers') ? [
        'Start in plank with dumbbells',
        'Do row on each side',
        'Do push-up',
        'Jump feet forward',
        'Stand and press weights overhead'
      ] : name.includes('Box Jump') ? [
        'Perform burpee',
        'Instead of jump up, jump onto box',
        'Step down',
        'Repeat'
      ] : [
        'Snatch weight overhead',
        'Step into lunge',
        'Return to standing',
        'Lower weight and repeat'
      ],
      [
        'Very advanced - master components first',
        'Focus on form',
        'Build up gradually',
        'Allow recovery'
      ],
      [],
      ['Full Body']
    )
  ),

  // ========== FLEXIBILITY CATEGORY ==========
  ...['Hamstring Stretch', 'Chest Opener', 'Cat-Cow', 'Hip Flexor Stretch'].map(name => 
    createExercise(
      name,
      'Flexibility',
      'Flexibility',
      'Beginner',
      'Bodyweight',
      `${name} improves flexibility and mobility in key muscle groups.`,
      name.includes('Hamstring') ? [
        'Sit with one leg extended',
        'Reach toward toes',
        'Hold stretch',
        'Feel stretch in back of leg'
      ] : name.includes('Chest') ? [
        'Stand in doorway',
        'Place forearm on frame',
        'Lean forward',
        'Feel chest stretch'
      ] : name.includes('Cat-Cow') ? [
        'On hands and knees',
        'Arch back (cow)',
        'Round spine (cat)',
        'Move slowly'
      ] : [
        'Lunge position',
        'Back knee down',
        'Push hips forward',
        'Feel stretch in front of hip'
      ],
      [
        'Hold for 30-60 seconds',
        'Breathe deeply',
        'Don\'t bounce',
        'Feel stretch, not pain'
      ],
      [],
      []
    )
  ),

  ...['Pigeon Pose', 'Deep Lunge Stretch', 'Thoracic Spine Rotation', 'Shoulder Mobility Band Work'].map(name => 
    createExercise(
      name,
      'Flexibility',
      'Flexibility',
      'Intermediate',
      name.includes('Band') ? 'Resistance Band' : 'Bodyweight',
      `${name} targets deeper flexibility and mobility improvements.`,
      name.includes('Pigeon') ? [
        'Bring one leg forward, bent',
        'Extend other leg back',
        'Hold position',
        'Feel stretch in hip'
      ] : name.includes('Lunge') ? [
        'Deep lunge position',
        'Hold for extended time',
        'Focus on hip flexor',
        'Switch sides'
      ] : name.includes('Thoracic') ? [
        'On hands and knees',
        'Place hand behind head',
        'Rotate toward ceiling',
        'Feel stretch in upper back'
      ] : [
        'Hold band with arms extended',
        'Move through range of motion',
        'Focus on shoulder mobility',
        'Control the movement'
      ],
      [
        'Hold stretches longer',
        'Focus on breathing',
        'Progress gradually',
        'Consistency is key'
      ],
      [],
      []
    )
  ),

  ...['Full Splits', 'Bridge Pose', 'Deep Backbend', 'Loaded Mobility (Deep Squat Hold)'].map(name => 
    createExercise(
      name,
      'Flexibility',
      'Flexibility',
      'Advanced',
      name.includes('Loaded') ? 'Weight' : 'Bodyweight',
      `${name} is an advanced flexibility exercise requiring significant mobility.`,
      name.includes('Splits') ? [
        'Slide into split position',
        'Hold for time',
        'Focus on breathing',
        'Build up gradually'
      ] : name.includes('Bridge') ? [
        'Lie on back',
        'Push up into bridge',
        'Hold position',
        'Feel stretch in front body'
      ] : name.includes('Backbend') ? [
        'Stand, arch backward',
        'Reach hands toward ground',
        'Hold position',
        'Use support if needed'
      ] : [
        'Hold weight in deep squat',
        'Maintain position',
        'Focus on mobility',
        'Build up time'
      ],
      [
        'Very advanced flexibility',
        'Build up over time',
        'Use proper warm-up',
        'Don\'t force positions'
      ],
      [],
      []
    )
  ),

  // ========== CARDIO CATEGORY ==========
  ...['Brisk Walk', 'Low-Impact Jumping Jacks', 'Marching in Place', 'Step Aerobics'].map(name => 
    createExercise(
      name,
      'Cardio',
      'Cardiovascular',
      'Beginner',
      name.includes('Step') ? 'Step Platform' : 'Bodyweight',
      `${name} is a low-impact cardiovascular exercise perfect for beginners.`,
      name.includes('Walk') ? [
        'Walk at brisk pace',
        'Maintain for duration',
        'Swing arms naturally',
        'Focus on breathing'
      ] : name.includes('Jumping') ? [
        'Low impact version',
        'Step out instead of jump',
        'Raise arms overhead',
        'Return to center'
      ] : name.includes('Marching') ? [
        'March in place',
        'Lift knees',
        'Swing arms',
        'Maintain rhythm'
      ] : [
        'Step up and down on platform',
        'Follow pattern',
        'Maintain pace',
        'Keep core engaged'
      ],
      [
        'Start slow',
        'Build up duration',
        'Focus on form',
        'Stay hydrated'
      ],
      [],
      []
    )
  ),

  ...['Skipping Rope', 'Jogging', 'Cycling', 'Stair Climbing'].map(name => 
    createExercise(
      name,
      'Cardio',
      'Cardiovascular',
      'Intermediate',
      name.includes('Skipping') ? 'Jump Rope' : name.includes('Cycling') ? 'Bicycle' : 'Bodyweight',
      `${name} is an effective cardiovascular exercise that improves heart health and endurance.`,
      name.includes('Skipping') ? [
        'Hold rope handles',
        'Jump over rope',
        'Maintain rhythm',
        'Land softly'
      ] : name.includes('Jogging') ? [
        'Run at moderate pace',
        'Maintain for duration',
        'Focus on breathing',
        'Land mid-foot'
      ] : name.includes('Cycling') ? [
        'Pedal at steady pace',
        'Maintain resistance',
        'Focus on form',
        'Build up duration'
      ] : [
        'Climb stairs',
        'Maintain pace',
        'Use full step',
        'Control descent'
      ],
      [
        'Build up gradually',
        'Maintain consistent pace',
        'Focus on breathing',
        'Stay hydrated'
      ],
      [],
      ['Legs', 'Calves']
    )
  ),

  ...['Sprints', 'Box Jumps', 'Battle Ropes', 'HIIT Sprints'].map(name => 
    createExercise(
      name,
      'Cardio',
      'Cardiovascular',
      'Advanced',
      name.includes('Box') ? 'Box or Platform' : name.includes('Battle') ? 'Battle Ropes' : 'Bodyweight',
      `${name} is a high-intensity cardiovascular exercise for advanced fitness levels.`,
      name.includes('Sprints') ? [
        'Run at maximum speed',
        'Short bursts',
        'Recover between sprints',
        'Focus on form'
      ] : name.includes('Box') ? [
        'Jump onto box',
        'Land with both feet',
        'Step down',
        'Repeat explosively'
      ] : name.includes('Battle') ? [
        'Hold rope ends',
        'Create waves',
        'Alternate arms',
        'Maintain intensity'
      ] : [
        'High-intensity intervals',
        'Maximum effort',
        'Short rest periods',
        'Multiple rounds'
      ],
      [
        'Very high intensity',
        'Proper warm-up essential',
        'Build up gradually',
        'Allow recovery'
      ],
      [],
      ['Legs', 'Core', 'Full Body']
    )
  )
];

const seedAllExercises = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get or create sections
    const sections = {};
    const sectionNames = ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio'];
    
    for (const name of sectionNames) {
      let section = await WorkoutSection.findOne({ name });
      if (!section) {
        section = await WorkoutSection.create({ name, description: `${name} exercises` });
      }
      sections[name] = section;
    }

    // Get admin user or create one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne();
      if (!adminUser) {
        console.log('No users found. Please create a user first.');
        process.exit(1);
      }
    }

    // Determine section for each exercise
    const getSection = (targetMuscle) => {
      if (['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms'].includes(targetMuscle)) {
        return sections['Upper Body'];
      } else if (['Legs'].includes(targetMuscle)) {
        return sections['Lower Body'];
      } else if (['Core'].includes(targetMuscle)) {
        return sections['Core'];
      } else if (['Cardiovascular', 'Flexibility'].includes(targetMuscle)) {
        return sections['Cardio'];
      }
      return sections['Full Body'];
    };

    // Create exercises
    let created = 0;
    let skipped = 0;

    for (const exerciseData of exercises) {
      // Check if exercise already exists
      const existing = await Exercise.findOne({ 
        name: exerciseData.name,
        isGlobal: true 
      });

      if (!existing) {
        const section = getSection(exerciseData.targetMuscle);
        const exercise = await Exercise.create({
          ...exerciseData,
          section: section._id,
          createdBy: adminUser._id,
          isGlobal: true,
          approvedByAdmin: true
        });
        console.log(`✓ Created: ${exercise.name} (${exercise.category}, ${exercise.difficulty})`);
        created++;
      } else {
        // Update image to empty if it's different
        if (existing.demoImage !== exerciseData.demoImage) {
          existing.demoImage = exerciseData.demoImage;
          await existing.save();
          console.log(`✓ Updated: ${exerciseData.name}`);
        } else {
          console.log(`- Skipped (exists): ${exerciseData.name}`);
        }
        skipped++;
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`Created: ${created} exercises`);
    console.log(`Skipped: ${skipped} exercises (already exist)`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }
};

seedAllExercises();

