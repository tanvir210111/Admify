import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, phone, gpa, ielts, targetCountry, targetCourse, bio, password } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gpa !== undefined) user.gpa = gpa;
    if (ielts !== undefined) user.ielts = ielts;
    if (targetCountry !== undefined) user.targetCountry = targetCountry;
    if (targetCourse !== undefined) user.targetCourse = targetCourse;
    if (bio !== undefined) user.bio = bio;
    if (password) user.password = password;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all students (for admin / agents)
// @route   GET /api/users/students
// @access  Private (Admin, Agent, Agency)
export const getStudents = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = { role: 'student' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all agents (for admin)
// @route   GET /api/users/agents
// @access  Private (Admin)
export const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: { $in: ['agent', 'agency'] } }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: agents.length,
      data: { agents },
    });
  } catch (error) {
    next(error);
  }
};
