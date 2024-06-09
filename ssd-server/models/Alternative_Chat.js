const mongoose = require("mongoose")
const { Schema } = mongoose;

const altChatSchema = new Schema(
    {
        chatName: {
            type: String,
            required: true,
            unique: true,
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        messages: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['sent', 'delivered', 'read'],
                default: 'sent',
            },
            type: {
                type: String,
                enum: ['text', 'attachment', 'system', 'notification', 'command'],
                default: 'text',
            },
            replyTo: {
                type: Schema.Types.ObjectId,
                ref: 'AltChat',
            },
            forwardedFrom: {
                type: Schema.Types.ObjectId,
                ref: 'AltChat',
            },
            editedAt: {
                type: Date,
            },
        }],
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const AltChat = mongoose.model("AltChat", altChatSchema)

module.exports = AltChat