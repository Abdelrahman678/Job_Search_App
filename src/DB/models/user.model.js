import mongoose from "mongoose";
import {
  genderEnum,
  otpEnum,
  providerEnum,
  systemRoles,
} from "../../Constants/constants.js";
import { hashSync } from "bcrypt";
import { Decryption, Encryption } from "../../utils/index.utils.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.SYSTEM,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.MALE,
    },
    DOB: {
      type: Date,
      validate: {
        validator: function (v) {
          if (
            v < new Date() &&
            new Date().getFullYear() - v.getFullYear() > 18
          ) {
            // valid date
            return true;
          }
          // invalid date
          return false;
        },
        message: (props) => `${props.value} is not a valid date!`,
      },
    },
    mobileNumber: { type: String },
    role: {
      type: String,
      default: systemRoles.USER,
      enum: Object.values(systemRoles),
    },
    isConfirmed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changeCredentialTime: { type: Date },
    profilePic: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    OTP: [
      {
        code: { type: String },
        type: { type: String, enum: Object.values(otpEnum) },
        expiresIn: { type: Date },
      },
    ],
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

/* Virtual field for username */
userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/* pre hook for save to hash password and encrypt mobile number */
userSchema.pre("save", async function () {
  // console.log("this ==> ", this);
  if (this.isModified("password") && this.password) {
    /* hash password */
    // console.log(this.password);
    this.password = hashSync(this.password, parseInt(process.env.SALT_ROUNDS));
  }
  if (this.isModified("mobileNumber") && this.mobileNumber) {
    /* Encrypt mobile number */
    // console.log(this.mobileNumber);
    this.mobileNumber = await Encryption({
      plaintext: this.mobileNumber,
      secretKey: process.env.ENCRYPTED_KEY,
    });
  }
});

/* post hook for findOne and findById to decrypt mobile number  */
userSchema.post("findOne", async function (doc) {
  // console.log("doc ==> ", doc);
  if (doc && doc.mobileNumber) {
    // console.log(`Before decryption: ${doc.mobileNumber}`);
    doc.mobileNumber = await Decryption({
      ciphertext: doc.mobileNumber,
      secretKey: process.env.ENCRYPTED_KEY,
    });
    // console.log(`Decrypted mobile number: ${doc.mobileNumber}`);
  }
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
