const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireProvider, requireLearner } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/profile
// @desc   Get current user profile
// @access Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('skills.skill')
            .populate('interests');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// @route   PUT /api/users/profile
// @desc   Update user profile
// @access Private
router.put('/profile', auth, [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    body('location.country')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Country cannot be empty'),
    body('location.city')
        .optional()
        .trim(),
    body('location.timezone')
        .optional()
        .trim(),
    body('hourlyRate')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Hourly rate must be a positive number'),
    body('socialLinks.linkedin')
        .optional()
        .isURL()
        .withMessage('LinkedIn must be a valid URL'),
    body('socialLinks.github')
        .optional()
        .isURL()
        .withMessage('GitHub must be a valid URL'),
    body('socialLinks.website')
        .optional()
        .isURL()
        .withMessage('Website must be a valid URL'),
    body('socialLinks.twitter')
        .optional()
        .isURL()
        .withMessage('Twitter must be a valid URL')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'firstName', 'lastName', 'phone', 'bio', 'location', 
            'hourlyRate', 'socialLinks'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'location') {
                    // Handle nested location object
                    Object.keys(req.body[field]).forEach(locField => {
                        user.location[locField] = req.body[field][locField];
                    });
                } else if (field === 'socialLinks') {
                    // Handle nested socialLinks object
                    Object.keys(req.body[field]).forEach(socialField => {
                        user.socialLinks[socialField] = req.body[field][socialField];
                    });
                } else {
                    user[field] = req.body[field];
                }
            }
        });

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// @route   POST /api/users/upload-avatar
// @desc   Upload profile image
// @access Private
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update profile image
        user.profileImage = req.file.path;
        await user.save();

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading avatar'
        });
    }
});

// @route   GET /api/users/:id
// @desc   Get public user profile
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('skills.skill')
            .populate('interests');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
});

// @route   GET /api/users/search/providers
// @desc   Search for skill providers
// @access Public
router.get('/search/providers', async (req, res) => {
    try {
        const {
            q = '', // search query
            skill,
            country,
            minRate,
            maxRate,
            page = 1,
            limit = 20
        } = req.query;

        const searchQuery = {
            accountType: 'provider',
            isActive: true,
            isVerified: true
        };

        // Add search filters
        if (q) {
            searchQuery.$text = { $search: q };
        }

        if (skill) {
            searchQuery['skills.skill'] = skill;
        }

        if (country) {
            searchQuery['location.country'] = country;
        }

        if (minRate || maxRate) {
            searchQuery.hourlyRate = {};
            if (minRate) searchQuery.hourlyRate.$gte = parseFloat(minRate);
            if (maxRate) searchQuery.hourlyRate.$lte = parseFloat(maxRate);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute search
        const users = await User.find(searchQuery)
            .populate('skills.skill')
            .sort(q ? { score: { $meta: 'textScore' } } : { hourlyRate: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password -emailVerificationToken -passwordResetToken');

        // Get total count for pagination
        const total = await User.countDocuments(searchQuery);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Search providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching providers'
        });
    }
});

// @route   GET /api/users/skills/:skillId
// @desc   Get users by skill
// @access Public
router.get('/skills/:skillId', async (req, res) => {
    try {
        const { skillId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.findBySkill(skillId)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password -emailVerificationToken -passwordResetToken');

        const total = await User.countDocuments({
            'skills.skill': skillId,
            accountType: 'provider',
            isActive: true,
            isVerified: true
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get users by skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users by skill'
        });
    }
});

// @route   PUT /api/users/skills
// @desc   Update user skills (providers only)
// @access Private
router.put('/skills', [auth, requireProvider], [
    body('skills')
        .isArray()
        .withMessage('Skills must be an array'),
    body('skills.*.skill')
        .isMongoId()
        .withMessage('Invalid skill ID'),
    body('skills.*.proficiencyLevel')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
        .withMessage('Invalid proficiency level'),
    body('skills.*.yearsExperience')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Years of experience must be a positive number'),
    body('skills.*.certifications')
        .optional()
        .isArray()
        .withMessage('Certifications must be an array'),
    body('skills.*.portfolioLinks')
        .optional()
        .isArray()
        .withMessage('Portfolio links must be an array')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update skills
        user.skills = req.body.skills;
        await user.save();

        // Populate skills for response
        await user.populate('skills.skill');

        res.json({
            success: true,
            message: 'Skills updated successfully',
            data: {
                skills: user.skills
            }
        });

    } catch (error) {
        console.error('Update skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating skills'
        });
    }
});

// @route   PUT /api/users/interests
// @desc   Update user interests (learners only)
// @access Private
router.put('/interests', [auth, requireLearner], [
    body('interests')
        .isArray()
        .withMessage('Interests must be an array'),
    body('interests.*')
        .isMongoId()
        .withMessage('Invalid skill ID')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update interests
        user.interests = req.body.interests;
        await user.save();

        // Populate interests for response
        await user.populate('interests');

        res.json({
            success: true,
            message: 'Interests updated successfully',
            data: {
                interests: user.interests
            }
        });

    } catch (error) {
        console.error('Update interests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating interests'
        });
    }
});

// @route   DELETE /api/users/account
// @desc   Deactivate user account
// @access Private
router.delete('/account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Deactivate account instead of deleting
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deactivating account'
        });
    }
});

module.exports = router;
