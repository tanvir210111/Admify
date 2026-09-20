import Scholarship from '../models/Scholarship.js';

// @desc    Get all scholarships with filtering
// @route   GET /api/scholarships
// @access  Public
export const getScholarships = async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const query = {};

    if (type && type !== 'all') {
      query.type = type.toLowerCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sponsor: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } },
      ];
    }

    const scholarships = await Scholarship.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      data: { scholarships },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scholarship
// @route   GET /api/scholarships/:id
// @access  Public
export const getScholarshipById = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create scholarship
// @route   POST /api/scholarships
// @access  Private (Admin)
export const createScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scholarship
// @route   PUT /api/scholarships/:id
// @access  Private (Admin)
export const updateScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully',
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private (Admin)
export const deleteScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
