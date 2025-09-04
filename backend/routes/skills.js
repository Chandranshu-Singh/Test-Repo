const express = require('express');
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { auth, requireProvider } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/skills
// @desc   Get all skills with pagination and filters
// @access Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            difficulty,
            trending,
            page = 1,
            limit = 20,
            sort = 'popularity' // popularity, name, difficulty
        } = req.query;

        const query = { isActive: true };

        // Add filters
        if (category) query.category = category;
        if (difficulty) query.difficultyLevel = difficulty;
        if (trending === 'true') query.isTrending = true;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'name':
                sortObj = { name: 1 };
                break;
            case 'difficulty':
                sortObj = { difficultyLevel: 1 };
                break;
            case 'popularity':
            default:
                sortObj = { popularityScore: -1 };
                break;
        }

        // Execute query
        const skills = await Skill.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Skill.countDocuments(query);

        res.json({
            success: true,
            data: {
                skills,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching skills'
        });
    }
});

// @route   GET /api/skills/categories
// @desc   Get all skill categories
// @access Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Skill.distinct('category');
        
        res.json({
            success: true,
            data: {
                categories
            }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
});

// @route   GET /api/skills/trending
// @desc   Get trending skills
// @access Public
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const skills = await Skill.getTrending(parseInt(limit));
        
        res.json({
            success: true,
            data: {
                skills
            }
        });

    } catch (error) {
        console.error('Get trending skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching trending skills'
        });
    }
});

// @route   GET /api/skills/popular
// @desc   Get popular skills
// @access Public
router.get('/popular', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        const skills = await Skill.getPopular(parseInt(limit));
        
        res.json({
            success: true,
            data: {
                skills
            }
        });

    } catch (error) {
        console.error('Get popular skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching popular skills'
        });
    }
});

// @route   GET /api/skills/search
// @desc   Search skills
// @access Public
router.get('/search', async (req, res) => {
    try {
        const {
            q = '',
            category,
            difficulty,
            minRate,
            maxRate,
            page = 1,
            limit = 20
        } = req.query;

        if (!q.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const filters = {};
        if (category) filters.category = category;
        if (difficulty) filters.difficultyLevel = difficulty;
        if (minRate) filters.minRate = parseFloat(minRate);
        if (maxRate) filters.maxRate = parseFloat(maxRate);

        const skills = await Skill.searchSkills(q, {
            ...filters,
            limit: parseInt(limit)
        });

        // Get total count for pagination
        const total = skills.length;

        res.json({
            success: true,
            data: {
                skills,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Search skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching skills'
        });
    }
});

// @route   GET /api/skills/:id
// @desc   Get skill by ID
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        if (!skill.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Increment search count
        skill.searchCount += 1;
        await skill.save();

        res.json({
            success: true,
            data: {
                skill
            }
        });

    } catch (error) {
        console.error('Get skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching skill'
        });
    }
});

// @route   POST /api/skills
// @desc   Create new skill (admin only for now)
// @access Private
router.post('/', auth, [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Skill name must be between 2 and 100 characters'),
    body('category')
        .isIn([
            'Technology', 'Business', 'Creative Arts', 'Languages',
            'Health & Fitness', 'Cooking & Food', 'Music', 'Sports',
            'Education', 'Personal Development', 'Other'
        ])
        .withMessage('Invalid skill category'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('difficultyLevel')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
        .withMessage('Invalid difficulty level'),
    body('icon')
        .optional()
        .trim(),
    body('color')
        .optional()
        .isHexColor()
        .withMessage('Color must be a valid hex color'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array')
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

        // Check if skill already exists
        const existingSkill = await Skill.findOne({ 
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
        });

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                message: 'Skill with this name already exists'
            });
        }

        // Create new skill
        const skill = new Skill({
            ...req.body,
            createdBy: req.user.userId
        });

        await skill.save();

        res.status(201).json({
            success: true,
            message: 'Skill created successfully',
            data: {
                skill
            }
        });

    } catch (error) {
        console.error('Create skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating skill'
        });
    }
});

// @route   PUT /api/skills/:id
// @desc   Update skill (admin only for now)
// @access Private
router.put('/:id', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Skill name must be between 2 and 100 characters'),
    body('category')
        .optional()
        .isIn([
            'Technology', 'Business', 'Creative Arts', 'Languages',
            'Health & Fitness', 'Cooking & Food', 'Music', 'Sports',
            'Education', 'Personal Development', 'Other'
        ])
        .withMessage('Invalid skill category'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('difficultyLevel')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
        .withMessage('Invalid difficulty level'),
    body('icon')
        .optional()
        .trim(),
    body('color')
        .optional()
        .isHexColor()
        .withMessage('Color must be a valid hex color'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array'),
    body('isTrending')
        .optional()
        .isBoolean()
        .withMessage('isTrending must be a boolean'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
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

        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'name', 'category', 'description', 'difficultyLevel',
            'icon', 'color', 'tags', 'keywords', 'isTrending', 'isActive'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                skill[field] = req.body[field];
            }
        });

        await skill.save();

        res.json({
            success: true,
            message: 'Skill updated successfully',
            data: {
                skill
            }
        });

    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating skill'
        });
    }
});

// @route   DELETE /api/skills/:id
// @desc   Delete skill (admin only for now)
// @access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Soft delete - mark as inactive
        skill.isActive = false;
        await skill.save();

        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });

    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting skill'
        });
    }
});

// @route   GET /api/skills/category/:category
// @desc   Get skills by category
// @access Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skills = await Skill.getByCategory(category, parseInt(limit));

        // Get total count
        const total = await Skill.countDocuments({ 
            category, 
            isActive: true 
        });

        res.json({
            success: true,
            data: {
                skills,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get skills by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching skills by category'
        });
    }
});

module.exports = router;
