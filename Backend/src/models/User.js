const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true,
            default: null
        },

        department: {
            type: String,
            trim: true,
            default: null
        },
        
        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "staff", "admin"],
            default: "user"
        },

        isActive:{
            type: Boolean,
            default: true
        }
    },
    {
       timestamps: true 
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
