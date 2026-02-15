import mongoose from 'mongoose';

const passwordResetTokenCollection = 'passwordResetTokens';

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000)
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const passwordResetTokenModel = mongoose.model(passwordResetTokenCollection, passwordResetTokenSchema);

export default passwordResetTokenModel;