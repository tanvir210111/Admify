import University from '../models/University.js';

// @desc    Get all universities with search & filtering
// @route   GET /api/universities
// @access  Public
export const getUniversities = async (req, res, next) => {
  try {
    const { search, country, degree, discipline, featured } = req.query;
    const query = {};

    if (country && country !== 'all') {
      query.country = country.toLowerCase();
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'programs.name': { $regex: search, $options: 'i' } },
      ];
    }

    const universities = await University.find(query).sort({ rank: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: universities.length,
      data: { universities },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single university by slug or id
// @route   GET /api/universities/:slug
// @access  Public
export const getUniversityBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let university = await University.findOne({ slug: slug.toLowerCase() });

    if (!university && slug.match(/^[0-9a-fA-F]{24}$/)) {
      university = await University.findById(slug);
    }

    if (!university) {
      return res.status(404).json({
        success: false,
        message: `University with identifier '${slug}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new university
// @route   POST /api/universities
// @access  Private (Admin)
export const createUniversity = async (req, res, next) => {
  try {
    const university = await University.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private (Admin)
export const updateUniversity = async (req, res, next) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'University updated successfully',
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private (Admin)
export const deleteUniversity = async (req, res, next) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'University deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
