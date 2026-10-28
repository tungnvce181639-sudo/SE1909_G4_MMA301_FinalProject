const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        // ==========================================
        // 1. Identity Information (Authentication)
        // ==========================================
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            // Optional for Google Sign-in users; required for local email/password authentication
        },

        // ==========================================
        // 2. Profile Information (UserProfileScreen)
        // ==========================================
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: 'https://ui-avatars.com/api/?background=random&name=User',
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            default: null,
        },

        // ==========================================
        // 3. Wallet & Role Management
        // ==========================================
        walletPoints: {
            type: Number,
            default: 0,
            min: [0, 'Wallet points cannot be negative'],
        },
        role: {
            type: String,
            enum: {
                values: ['student', 'admin'],
                message: '{VALUE} is not a valid role',
            },
            default: 'student',
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'banned'],
                message: '{VALUE} is not a valid status',
            },
            default: 'active',
        },

        // ==========================================
        // 4. Security & OTP (Forgot Password flow)
        // ==========================================
        resetOtp: {
            type: String,
            default: null,
        },
        otpExpiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Transform schema output to JSON:
 * Removes sensitive fields before sending the user object to the client.
 */
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.resetOtp;
    delete userObject.otpExpiresAt;
    delete userObject.__v;

    return userObject;
};

// Indexes for frequently queried fields
// Note: email and firebaseUid already have unique indexes from schema definition
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
