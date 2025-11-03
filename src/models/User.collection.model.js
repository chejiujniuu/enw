import mongoose from "mongoose";
import validator from "validator"; // For email & phone validation

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      index: true,
      trim: true,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution ID is required"],
      index: true,
    },

    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      required: true,
      default: "student",
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },

    profile: {
      name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
      },
      dateOfBirth: {
        type: Date,
        validate: {
          validator: function (v) {
            return v < new Date();
          },
          message: "Date of birth cannot be in the future",
        },
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            // Basic phone number validation
            return !v || validator.isMobilePhone(v, "any", { strictMode: false });
          },
          message: "Invalid phone number",
        },
      },
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
    versionKey: false, // Prevents "__v" field
    minimize: true, // Removes empty objects
  }
);

//
// 🔒 SECURITY & PERFORMANCE ENHANCEMENTS
//

// ✅ Compound index for faster multi-tenant queries
userSchema.index({ institutionId: 1, role: 1 });

// ✅ Hide sensitive or internal fields when returning data (best practice)
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

// ✅ Optional pre-save hook for sanitization
userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = validator.normalizeEmail(this.email);
  }
  if (this.profile?.name) {
    this.profile.name = this.profile.name.trim();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
