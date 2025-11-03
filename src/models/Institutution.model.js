import mongoose from "mongoose";

const { Schema } = mongoose;

const institutionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "pending"],
      default: "pending",
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming there’s a User/Admin model
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// optional index for quick search by status or admin
institutionSchema.index({ status: 1 });
institutionSchema.index({ adminId: 1 });

export const Institution = mongoose.model("Institution", institutionSchema);
