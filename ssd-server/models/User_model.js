const mongoose = require("mongoose")
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        image: {
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
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
);

const User = mongoose.model("User", userSchema)

module.exports = User