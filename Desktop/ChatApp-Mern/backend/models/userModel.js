import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true
    },
    lastname: {
        type: String,
      },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: { 
        type: String
    },
    profilePicture: { 
        type: String, 
        default: "" 
    },
    profileSetup: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    isOnline: { 
        type: Boolean, 
        default: false 
    },
    lastSeen: { 
        type: Date 
    },
    contacts: {
        type: Array,
        default: []
    },
    groups: {
        type: Array,
        default: []
    },
    socketId: { 
        type: String 
    }, 
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: "1d"
    }
)
}

UserSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: "10d"
    }
)
}

export const User = mongoose.model("User", UserSchema);

