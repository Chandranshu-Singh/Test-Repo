const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true,
        maxlength: [100, 'Skill name cannot exceed 100 characters'],
        unique: true
    },
    
    // Categorization
    category: {
        type: String,
        required: [true, 'Skill category is required'],
        enum: [
            'Technology',
            'Business',
            'Creative Arts',
            'Languages',
            'Health & Fitness',
            'Cooking & Food',
            'Music',
            'Sports',
            'Education',
            'Personal Development',
            'Other'
        ]
    },
    
    // Description & Details
    description: {
        type: String,
        required: [true, 'Skill description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Visual & Branding
    icon: {
        type: String,
        default: 'fas fa-star' // Default FontAwesome icon
    },
    color: {
        type: String,
        default: '#667eea' // Default brand color
    },
    
    // Statistics & Metrics
    providerCount: {
        type: Number,
        default: 0,
        min: 0
    },
    learnerCount: {
        type: Number,
        default: 0,
        min: 0
    },
    averageHourlyRate: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalSessions: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Difficulty & Requirements
    difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    
    // Popularity & Trends
    isTrending: {
        type: Boolean,
        default: false
    },
    searchCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Status & Moderation
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // SEO & Discovery
    tags: [String],
    keywords: [String],
    
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total participants
skillSchema.virtual('totalParticipants').get(function() {
    return this.providerCount + this.learnerCount;
});

// Virtual for popularity score
skillSchema.virtual('popularityScore').get(function() {
    return (this.searchCount * 0.3) + (this.totalSessions * 0.4) + (this.averageRating * 0.3);
});

// Index for search functionality
skillSchema.index({ 
    name: 'text', 
    description: 'text', 
    category: 'text',
    tags: 'text'
});

// Index for category-based queries
skillSchema.index({ category: 1, isActive: 1 });

// Index for popularity-based sorting
skillSchema.index({ popularityScore: -1 });

// Pre-save middleware to update related counts
skillSchema.pre('save', function(next) {
    // Update lastUpdated timestamp
    this.lastUpdated = new Date();
    next();
});

// Static method to get skills by category
skillSchema.statics.getByCategory = function(category, limit = 20) {
    return this.find({ 
        category, 
        isActive: true 
    })
    .sort({ popularityScore: -1 })
    .limit(limit);
};

// Static method to get trending skills
skillSchema.statics.getTrending = function(limit = 10) {
    return this.find({ 
        isActive: true,
        isTrending: true 
    })
    .sort({ popularityScore: -1 })
    .limit(limit);
};

// Static method to search skills
skillSchema.statics.searchSkills = function(searchTerm, filters = {}) {
    const searchQuery = {
        $text: { $search: searchTerm },
        isActive: true
    };
    
    // Add filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.difficultyLevel) searchQuery.difficultyLevel = filters.difficultyLevel;
    if (filters.minRate) searchQuery.averageHourlyRate = { $gte: filters.minRate };
    if (filters.maxRate) searchQuery.averageHourlyRate = { ...searchQuery.averageHourlyRate, $lte: filters.maxRate };
    
    return this.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .limit(filters.limit || 20);
};

// Static method to get popular skills
skillSchema.statics.getPopular = function(limit = 20) {
    return this.find({ isActive: true })
        .sort({ popularityScore: -1 })
        .limit(limit);
};

// Method to update provider count
skillSchema.methods.updateProviderCount = async function() {
    const User = mongoose.model('User');
    const count = await User.countDocuments({
        'skills.skill': this._id,
        accountType: 'provider',
        isActive: true
    });
    
    this.providerCount = count;
    return this.save();
};

// Method to update learner count
skillSchema.methods.updateLearnerCount = async function() {
    const User = mongoose.model('User');
    const count = await User.countDocuments({
        interests: this._id,
        accountType: 'learner',
        isActive: true
    });
    
    this.learnerCount = count;
    return this.save();
};

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
