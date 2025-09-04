const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const User = require('../models/User');
require('dotenv').config();

// Sample skills data
const sampleSkills = [
    {
        name: 'JavaScript Programming',
        category: 'Technology',
        description: 'Learn modern JavaScript including ES6+, async programming, and modern frameworks.',
        difficultyLevel: 'intermediate',
        icon: 'fab fa-js-square',
        color: '#f7df1e',
        tags: ['programming', 'web development', 'frontend'],
        keywords: ['javascript', 'js', 'es6', 'nodejs', 'react', 'vue'],
        isTrending: true,
        isVerified: true
    },
    {
        name: 'Python Development',
        category: 'Technology',
        description: 'Master Python programming for web development, data science, and automation.',
        difficultyLevel: 'beginner',
        icon: 'fab fa-python',
        color: '#3776ab',
        tags: ['programming', 'python', 'data science', 'automation'],
        keywords: ['python', 'django', 'flask', 'pandas', 'numpy'],
        isTrending: true,
        isVerified: true
    },
    {
        name: 'Digital Marketing',
        category: 'Business',
        description: 'Learn digital marketing strategies including SEO, social media, and content marketing.',
        difficultyLevel: 'intermediate',
        icon: 'fas fa-chart-line',
        color: '#00d4aa',
        tags: ['marketing', 'business', 'digital', 'seo'],
        keywords: ['digital marketing', 'seo', 'social media', 'content marketing'],
        isTrending: true,
        isVerified: true
    },
    {
        name: 'Graphic Design',
        category: 'Creative Arts',
        description: 'Master graphic design principles using tools like Adobe Creative Suite and Figma.',
        difficultyLevel: 'intermediate',
        icon: 'fas fa-palette',
        color: '#ff6b6b',
        tags: ['design', 'creative', 'graphics', 'adobe'],
        keywords: ['graphic design', 'photoshop', 'illustrator', 'figma'],
        isTrending: false,
        isVerified: true
    },
    {
        name: 'Spanish Language',
        category: 'Languages',
        description: 'Learn Spanish from beginner to advanced levels with native speakers.',
        difficultyLevel: 'beginner',
        icon: 'fas fa-language',
        color: '#ffd93d',
        tags: ['language', 'spanish', 'communication', 'culture'],
        keywords: ['spanish', 'language learning', 'conversation', 'grammar'],
        isTrending: false,
        isVerified: true
    },
    {
        name: 'Yoga & Meditation',
        category: 'Health & Fitness',
        description: 'Learn yoga poses, meditation techniques, and mindfulness practices.',
        difficultyLevel: 'beginner',
        icon: 'fas fa-spa',
        color: '#a8e6cf',
        tags: ['yoga', 'meditation', 'wellness', 'mindfulness'],
        keywords: ['yoga', 'meditation', 'mindfulness', 'wellness'],
        isTrending: true,
        isVerified: true
    },
    {
        name: 'Cooking Basics',
        category: 'Cooking & Food',
        description: 'Master fundamental cooking techniques and recipes for everyday meals.',
        difficultyLevel: 'beginner',
        icon: 'fas fa-utensils',
        color: '#ff8a80',
        tags: ['cooking', 'food', 'recipes', 'culinary'],
        keywords: ['cooking', 'recipes', 'culinary', 'kitchen skills'],
        isTrending: false,
        isVerified: true
    },
    {
        name: 'Guitar Lessons',
        category: 'Music',
        description: 'Learn guitar from basic chords to advanced techniques and music theory.',
        difficultyLevel: 'beginner',
        icon: 'fas fa-guitar',
        color: '#6c5ce7',
        tags: ['music', 'guitar', 'instruments', 'theory'],
        keywords: ['guitar', 'music', 'chords', 'strumming'],
        isTrending: false,
        isVerified: true
    },
    {
        name: 'Photography',
        category: 'Creative Arts',
        description: 'Master photography fundamentals including composition, lighting, and editing.',
        difficultyLevel: 'intermediate',
        icon: 'fas fa-camera',
        color: '#74b9ff',
        tags: ['photography', 'camera', 'composition', 'editing'],
        keywords: ['photography', 'camera', 'composition', 'lighting'],
        isTrending: false,
        isVerified: true
    },
    {
        name: 'Public Speaking',
        category: 'Personal Development',
        description: 'Develop confidence and skills for effective public speaking and presentations.',
        difficultyLevel: 'intermediate',
        icon: 'fas fa-microphone',
        color: '#fd79a8',
        tags: ['communication', 'public speaking', 'confidence', 'presentation'],
        keywords: ['public speaking', 'presentation', 'communication', 'confidence'],
        isTrending: false,
        isVerified: true
    }
];

// Sample users data
const sampleUsers = [
    {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'Password123!',
        accountType: 'provider',
        location: {
            country: 'United States',
            city: 'New York',
            timezone: 'America/New_York'
        },
        bio: 'Experienced software developer with 8+ years in web development. Passionate about teaching JavaScript and React.',
        hourlyRate: 75,
        isVerified: true,
        isActive: true
    },
    {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@example.com',
        password: 'Password123!',
        accountType: 'provider',
        location: {
            country: 'Spain',
            city: 'Madrid',
            timezone: 'Europe/Madrid'
        },
        bio: 'Native Spanish speaker and certified language teacher with 5 years of experience.',
        hourlyRate: 45,
        isVerified: true,
        isActive: true
    },
    {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@example.com',
        password: 'Password123!',
        accountType: 'learner',
        location: {
            country: 'Canada',
            city: 'Toronto',
            timezone: 'America/Toronto'
        },
        bio: 'Marketing professional looking to expand my digital marketing skills.',
        isVerified: true,
        isActive: true
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await Skill.deleteMany({});
        await User.deleteMany({});

        console.log('🗑️ Cleared existing data');

        // Insert skills
        const createdSkills = await Skill.insertMany(sampleSkills);
        console.log(`✅ Created ${createdSkills.length} skills`);

        // Insert users (one by one to trigger password hashing)
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }
        console.log(`✅ Created ${createdUsers.length} users`);

        // Update skill statistics
        for (const skill of createdSkills) {
            await skill.updateProviderCount();
            await skill.updateLearnerCount();
        }

        console.log('📊 Updated skill statistics');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample data created:');
        console.log(`- Skills: ${createdSkills.length}`);
        console.log(`- Users: ${createdUsers.length}`);
        console.log('\n🔑 Sample login credentials:');
        console.log('Provider: john.smith@example.com / Password123!');
        console.log('Provider: maria.garcia@example.com / Password123!');
        console.log('Learner: david.chen@example.com / Password123!');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    // Connect to database
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillshare', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('🔌 Connected to MongoDB');
        return seedDatabase();
    })
    .then(() => {
        console.log('✅ Seeding completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}

module.exports = { seedDatabase, sampleSkills, sampleUsers };
