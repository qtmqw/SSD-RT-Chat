const mongoose = require("mongoose")
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        image: {
            type: String,
        },
        banner: {
            type: String,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
        },
        gendere: {
            type: String,
        },
        bio: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        userType: {
            type: String,
            enum: ["1", "0"],
            required: true,
            default: "0",
        },
        pCAccess: {
            type: String,
            enum: ["Everyone", "Just Friends", "Just me"],
            required: true,
            default: "Everyone",
        },
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema)

module.exports = User