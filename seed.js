require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Minimal Admin Schema for seeding
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        const newAdmin = new Admin({
            username: process.env.ADMIN_USERNAME,
            password: hashedPassword
        }); 

        await newAdmin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
