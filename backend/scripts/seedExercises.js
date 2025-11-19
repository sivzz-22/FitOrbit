import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';
import WorkoutSection from '../models/WorkoutSection.js';
import User from '../models/User.js';

dotenv.config();

const exercises = [
  {
    name: 'Bench Press',
    description: 'A compound upper body exercise that primarily targets the chest, with secondary emphasis on the shoulders and triceps. It\'s one of the most effective exercises for building upper body strength and muscle mass.',
    category: 'Strength',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Barbell, Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Lie flat on a bench with your feet firmly on the ground.',
      'Grip the barbell slightly wider than shoulder-width apart.',
      'Lower the bar to your chest with controlled movement.',
      'Press the bar back up to the starting position.',
      'Repeat for desired number of reps.'
    ],
    proTips: [
      'Keep your shoulder blades retracted throughout the movement.',
      'Maintain a slight arch in your back for better stability.',
      'Control the weight on the way down - don\'t let it drop.',
      'Breathe out as you press up, breathe in as you lower.'
    ],
    variations: [
      {
        name: 'Incline Bench Press',
        description: 'Performed on an inclined bench to target upper chest muscles more effectively.'
      },
      {
        name: 'Dumbbell Bench Press',
        description: 'Using dumbbells allows for greater range of motion and independent arm movement.'
      }
    ],
    defaultSets: 4,
    defaultReps: 8
  },
  {
    name: 'Bicep Curls',
    description: 'An isolation exercise that targets the biceps muscles in the upper arms. Perfect for building arm strength and definition.',
    category: 'Strength',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbells, Barbell',
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart, holding dumbbells at your sides.',
      'Keep your elbows close to your torso and your palms facing forward.',
      'Curl the weights while contracting your biceps.',
      'Continue to raise the weights until your biceps are fully contracted.',
      'Slowly lower the weights back to the starting position.',
      'Repeat for desired number of reps.'
    ],
    proTips: [
      'Keep your upper arms stationary throughout the movement.',
      'Don\'t swing your body or use momentum to lift the weight.',
      'Focus on the contraction at the top of the movement.',
      'Control the negative (lowering) phase for better muscle development.'
    ],
    variations: [
      {
        name: 'Hammer Curls',
        description: 'Performed with palms facing each other to target different parts of the biceps.'
      },
      {
        name: 'Concentration Curls',
        description: 'Seated exercise that isolates the biceps for maximum muscle engagement.'
      }
    ],
    defaultSets: 3,
    defaultReps: 12
  },
  {
    name: 'Box Jumps',
    description: 'An explosive plyometric exercise that develops power in the lower body and improves athletic performance. Great for building leg strength and coordination.',
    category: 'Cardio',
    targetMuscle: 'Quadriceps, Glutes',
    secondaryMuscles: ['Calves', 'Hamstrings'],
    equipment: 'Bench, Other',
    difficulty: 'Advanced',
    instructions: [
      'Stand facing a sturdy box or platform at a comfortable distance.',
      'Bend your knees and swing your arms back to generate momentum.',
      'Jump onto the box, landing with both feet flat on the surface.',
      'Stand up fully on the box.',
      'Step down one foot at a time and return to starting position.',
      'Repeat for desired number of reps.'
    ],
    proTips: [
      'Start with a lower box height and gradually increase.',
      'Land softly on the box to reduce impact on your joints.',
      'Keep your chest up and core engaged throughout the movement.',
      'Focus on landing with your entire foot on the box, not just your toes.'
    ],
    variations: [
      {
        name: 'Lateral Box Jumps',
        description: 'Jump onto the box from the side to improve lateral power and agility.'
      },
      {
        name: 'Single-Leg Box Jumps',
        description: 'Advanced variation that challenges balance and unilateral leg strength.'
      }
    ],
    defaultSets: 3,
    defaultReps: 10
  },
  {
    name: 'Jumping Jacks',
    description: 'A classic cardiovascular exercise that increases heart rate and improves coordination. Perfect for warming up or as part of a cardio routine.',
    category: 'Cardio',
    targetMuscle: 'Cardiovascular',
    secondaryMuscles: ['Shoulders', 'Calves'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Start standing with feet together and arms at your sides.',
      'Jump up while spreading your feet shoulder-width apart.',
      'Simultaneously raise your arms overhead.',
      'Jump back to starting position and repeat.'
    ],
    proTips: [
      'Land softly on the balls of your feet to reduce impact.',
      'Keep your core engaged throughout the movement.',
      'Maintain a steady rhythm and breathing pattern.',
      'Start slow and gradually increase speed for intensity.'
    ],
    variations: [
      {
        name: 'High Knee Jacks',
        description: 'Add high knees for more intensity and core engagement.'
      },
      {
        name: 'Star Jacks',
        description: 'Jump into a star shape with arms and legs fully extended for maximum range of motion.'
      }
    ],
    defaultSets: 3,
    defaultReps: 20
  }
];

const seedExercises = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get or create a default section
    let section = await WorkoutSection.findOne({ name: 'Upper Body' });
    if (!section) {
      section = await WorkoutSection.create({ name: 'Upper Body', description: 'Upper body exercises' });
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

    // Clear existing exercises (optional - comment out if you want to keep existing)
    // await Exercise.deleteMany({ isGlobal: true });

    // Create exercises
    for (const exerciseData of exercises) {
      // Check if exercise already exists
      const existing = await Exercise.findOne({ 
        name: exerciseData.name,
        isGlobal: true 
      });

      if (!existing) {
        const exercise = await Exercise.create({
          ...exerciseData,
          section: section._id,
          createdBy: adminUser._id,
          isGlobal: true,
          approvedByAdmin: true
        });
        console.log(`✓ Created exercise: ${exercise.name}`);
      } else {
        console.log(`- Exercise already exists: ${exerciseData.name}`);
      }
    }

    console.log('\n✅ Exercise seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }
};

seedExercises();

