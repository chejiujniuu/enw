import mongoose from "mongoose";
import validator from "validator";

const courseSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution ID is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    category: {
      type: String,
      enum: ["Sports", "Arts", "Music", "Academics", "Technology", "Others"],
      required: [true, "Category is required"],
    },

    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to staff/trainers in User model
        validate: {
          validator: function (v) {
            return Array.isArray(v) && v.length > 0;
          },
          message: "At least one trainer must be assigned",
        },
      },
    ],

    schedule: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: [true, "Day is required in schedule"],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
          validate: {
            validator: (v) =>
              /^([01]\d|2[0-3]):?([0-5]\d)$/.test(v), // 24-hour format HH:mm
            message: "Start time must be in HH:mm format",
          },
        },
        endTime: {
          type: String,
          required: [true, "End time is required"],
          validate: {
            validator: (v) =>
              /^([01]\d|2[0-3]):?([0-5]\d)$/.test(v),
            message: "End time must be in HH:mm format",
          },
        },
      },
    ],

    fee: {
      amount: {
        type: Number,
        required: [true, "Fee amount is required"],
        min: [0, "Fee amount cannot be negative"],
      },
      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        validate: {
          validator: (v) => validator.isCurrency(v, { allow_negatives: false }),
          message: "Invalid currency format",
        },
      },
      type: {
        type: String,
        enum: ["one-time", "subscription"],
        required: [true, "Fee type is required"],
      },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false, // remove __v
    minimize: true, // remove empty objects
  }
);

//
// 🔒 SECURITY & PERFORMANCE BEST PRACTICES
//

// ✅ Index common query fields
courseSchema.index({ institutionId: 1, category: 1 });
courseSchema.index({ "fee.type": 1 });

// ✅ Transform output to hide internal fields
courseSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id; // optional alias
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// ✅ Ensure endTime is after startTime
courseSchema.pre("save", function (next) {
  for (const slot of this.schedule) {
    if (slot.startTime >= slot.endTime) {
      return next(new Error("End time must be later than start time"));
    }
  }
  next();
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
