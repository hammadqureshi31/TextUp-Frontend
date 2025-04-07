import mongoose from "mongoose";

const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: "Hey, we are using TextUp for communication and team work."
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members:{
        type: Array,
        default: []
    }

  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model('Group', GroupSchema);
