import Exercise from '../models/Exercise.js';
import WorkoutSection from '../models/WorkoutSection.js';

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Private
export const createExercise = async (req, res) => {
  try {
    const {
      name,
      description,
      section,
      category,
      targetMuscle,
      secondaryMuscles,
      equipment,
      difficulty,
      instructions,
      proTips,
      variations,
      defaultSets,
      defaultReps,
      defaultDuration,
      demoVideo,
      demoImage,
      isGlobal
    } = req.body;

    const exercise = await Exercise.create({
      name,
      description,
      section,
      category: category || 'Strength',
      targetMuscle,
      secondaryMuscles: secondaryMuscles || [],
      equipment: equipment || 'None',
      difficulty: difficulty || 'Beginner',
      instructions: instructions || [],
      proTips: proTips || [],
      variations: variations || [],
      defaultSets: defaultSets || 3,
      defaultReps: defaultReps || 10,
      defaultDuration: defaultDuration || 0,
      demoVideo: demoVideo || '',
      demoImage: demoImage || '',
      createdBy: req.user._id,
      isGlobal: req.user.role === 'admin' && isGlobal ? true : false,
      approvedByAdmin: req.user.role === 'admin' && isGlobal ? true : false
    });

    const populatedExercise = await Exercise.findById(exercise._id)
      .populate('section')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
export const getExercises = async (req, res) => {
  try {
    const { section, targetMuscle, equipment, difficulty, search, isGlobal } = req.query;
    const query = {};

    // Show user's exercises and approved global exercises
    if (isGlobal === 'true') {
      query.isGlobal = true;
      query.approvedByAdmin = true;
    } else {
      // Show both user's exercises and approved global exercises
      query.$or = [
        { createdBy: req.user._id },
        { isGlobal: true, approvedByAdmin: true }
      ];
    }
    
    // If there's a search query, we need to handle it differently
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { targetMuscle: { $regex: search, $options: 'i' } }
        ]
      };
      // Combine with existing query
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          searchQuery
        ];
        delete query.$or;
      } else {
        Object.assign(query, searchQuery);
      }
    }

    if (section) query.section = section;
    if (targetMuscle) {
      if (query.$and) {
        query.$and.push({ targetMuscle: { $regex: targetMuscle, $options: 'i' } });
      } else {
        query.targetMuscle = { $regex: targetMuscle, $options: 'i' };
      }
    }
    if (equipment) {
      if (query.$and) {
        query.$and.push({ equipment: { $regex: equipment, $options: 'i' } });
      } else {
        query.equipment = { $regex: equipment, $options: 'i' };
      }
    }
    if (difficulty) {
      if (query.$and) {
        query.$and.push({ difficulty });
      } else {
        query.difficulty = difficulty;
      }
    }

    const exercises = await Exercise.find(query)
      .populate('section')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Private
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('section')
      .populate('createdBy', 'name email');

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user has access (own exercise or approved global)
    if (!exercise.isGlobal || !exercise.approvedByAdmin) {
      if (exercise.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
export const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user owns the exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      description,
      section,
      category,
      targetMuscle,
      secondaryMuscles,
      equipment,
      difficulty,
      instructions,
      proTips,
      variations,
      defaultSets,
      defaultReps,
      defaultDuration,
      demoVideo,
      demoImage
    } = req.body;

    exercise.name = name || exercise.name;
    exercise.description = description !== undefined ? description : exercise.description;
    exercise.section = section || exercise.section;
    exercise.category = category || exercise.category;
    exercise.targetMuscle = targetMuscle !== undefined ? targetMuscle : exercise.targetMuscle;
    exercise.secondaryMuscles = secondaryMuscles !== undefined ? secondaryMuscles : exercise.secondaryMuscles;
    exercise.equipment = equipment !== undefined ? equipment : exercise.equipment;
    exercise.difficulty = difficulty || exercise.difficulty;
    exercise.instructions = instructions !== undefined ? instructions : exercise.instructions;
    exercise.proTips = proTips !== undefined ? proTips : exercise.proTips;
    exercise.variations = variations !== undefined ? variations : exercise.variations;
    exercise.defaultSets = defaultSets !== undefined ? defaultSets : exercise.defaultSets;
    exercise.defaultReps = defaultReps !== undefined ? defaultReps : exercise.defaultReps;
    exercise.defaultDuration = defaultDuration !== undefined ? defaultDuration : exercise.defaultDuration;
    exercise.demoVideo = demoVideo !== undefined ? demoVideo : exercise.demoVideo;
    exercise.demoImage = demoImage !== undefined ? demoImage : exercise.demoImage;

    const updatedExercise = await exercise.save();
    const populatedExercise = await Exercise.findById(updatedExercise._id)
      .populate('section')
      .populate('createdBy', 'name email');

    res.json(populatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user owns the exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await exercise.deleteOne();
    res.json({ message: 'Exercise removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

