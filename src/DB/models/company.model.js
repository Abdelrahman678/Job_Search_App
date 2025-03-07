import mongoose from "mongoose";
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    companyName: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    address: { type: String, required: true },
    numberOfEmployees: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 11 && v <= 20;
        },
        message: (props) =>
          `${props.value} is not a valid number of employees!`,
      },
    },
    companyEmail: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    logo: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    HRs: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    legalAttachment: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    approvedByAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/* Virtual field for jobs */
companySchema.virtual("jobs", {
  ref: "JobOpportunity",
  localField: "_id",
  foreignField: "companyId",
});

export const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);
