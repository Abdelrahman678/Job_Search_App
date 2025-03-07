import Joi from "joi";

/* DOB Validation */
const ageRule = (value, helper) => {
  if (
    value < new Date() &&
    new Date().getFullYear() - value.getFullYear() > 18
  ) {
    return value;
  }
  return helper.error(
    "any.invalid",
    "DOB must be a valid date and older than 18 years old"
  );
};

/* update user profile schema */
export const updateUserProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().messages({
      "string.base": "First Name must be a string",
    }),
    lastName: Joi.string().messages({
      "string.base": "Last Name must be a string",
    }),
    gender: Joi.string().valid("male", "female").messages({
      "string.base": "Gender must be a string",
      "string.valid": "Gender must be male or female",
    }),
    DOB: Joi.date().custom(ageRule).messages({
      "any.base": "DOB must be a date",
    }),
    mobileNumber: Joi.string().messages({
      "string.base": "Mobile Number must be a string",
    }),
  }),
};

/* get Other User Schema */
export const getOtherUserSchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "User ID is required",
      "string.base": "User ID must be a string",
      "string.hex": "User ID must be a hex string",
    }),
  }),
};

/* update Password Schema */
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required().messages({
      "any.required": "Old Password is required",
      "string.base": "Old Password must be a string",
    }),
    newPassword: Joi.string().required().messages({
      "any.required": "New Password is required",
      "string.base": "New Password must be a string",
    }),
  }),
};