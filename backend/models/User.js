const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    
    // Account Type & Status
    accountType: {
        type: String,
        required: [true, 'Account type is required'],
        enum: ['learner', 'provider'],
        default: 'learner'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Profile Information
    profileImage: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        city: String,
        timezone: String
    },
    
    // Provider-specific fields
    hourlyRate: {
        type: Number,
        min: [0, 'Hourly rate cannot be negative'],
        default: 0
    },
    skills: [{
        skill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        proficiencyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'intermediate'
        },
        yearsExperience: {
            type: Number,
            min: 0,
            default: 0
        },
        certifications: [String],
        portfolioLinks: [String]
    }],
    
    // Learner-specific fields
    interests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    
    // Verification & Security
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    
    // Social & Contact
    socialLinks: {
        linkedin: String,
        github: String,
        website: String,
        twitter: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
    return this.fullName;
});

// Index for search functionality
userSchema.index({ 
    firstName: 'text', 
    lastName: 'text', 
    bio: 'text',
    'skills.skill': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    
    delete userObject.password;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpires;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    
    return userObject;
};

// Static method to find users by skill
userSchema.statics.findBySkill = function(skillId) {
    return this.find({
        'skills.skill': skillId,
        accountType: 'provider',
        isActive: true,
        isVerified: true
    }).populate('skills.skill');
};

// Static method to search users
userSchema.statics.searchUsers = function(searchTerm, filters = {}) {
    const searchQuery = {
        $text: { $search: searchTerm },
        isActive: true
    };
    
    // Add filters
    if (filters.accountType) searchQuery.accountType = filters.accountType;
    if (filters.country) searchQuery['location.country'] = filters.country;
    if (filters.minRate) searchQuery.hourlyRate = { $gte: filters.minRate };
    if (filters.maxRate) searchQuery.hourlyRate = { ...searchQuery.hourlyRate, $lte: filters.maxRate };
    
    return this.find(searchQuery)
        .populate('skills.skill')
        .sort({ score: { $meta: 'textScore' } });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
