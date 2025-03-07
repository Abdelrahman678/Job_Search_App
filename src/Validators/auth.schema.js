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

/* Sign Up Schema */
export const signUpSchema = {
  body: Joi.object({
    firstName: Joi.string().required().messages({
      "any.required": "First Name is required",
      "string.base": "First Name must be a string",
    }),
    lastName: Joi.string().required().messages({
      "any.required": "Last Name is required",
      "string.base": "Last Name must be a string",
    }),
    // leave it commented for now "for mohml emails"
    /* email(
            {
                tlds: {
                    allow: ['com', 'net', 'org', 'edu'],
                },
                minDomainSegments: 2,
                maxDomainSegments: 3
            }  */
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.base": "Email must be a string",
      "string.email": "Email must be valid",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
      "string.base": "Password must be a string",
    }),
    gender: Joi.string().valid("male", "female").messages({
      "string.base": "Gender must be a string",
      "string.valid": "Gender must be male or female",
    }),
    DOB: Joi.date().custom(ageRule).messages({
      "any.base": "DOB must be a date",
    }),
    mobileNumber: Joi.string().required().messages({
      "any.required": "Mobile Number is required",
      "string.base": "Mobile Number must be a string",
    }),
  }),
};

/* Confirm Email Schema */
export const confirmEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.base": "Email must be a string",
      "string.email": "Email must be valid",
    }),
    confirmEmailOtp: Joi.string().required().messages({
      "any.required": "Confirm Email Otp is required",
      "string.base": "Confirm Email Otp must be a string",
    }),
  }),
};

/* Sign In Schema */
export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.base": "Email must be a string",
      "string.email": "Email must be valid",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
      "string.base": "Password must be a string",
    }),
  }),
};

/* Forget Password Schema */
export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.base": "Email must be a string",
      "string.email": "Email must be valid",
    }),
  }),
};

/* Reset Password Schema */
export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.base": "Email must be a string",
      "string.email": "Email must be valid",
    }),
    newPassword: Joi.string().required().messages({
      "any.required": "New Password is required",
      "string.base": "New Password must be a string",
    }),
    otp: Joi.string().required().messages({
      "any.required": "Reset Password Otp is required",
      "string.base": "Reset Password Otp must be a string",
    }),
  }),
};

/* Refresh Token Schema */
export const refreshTokenSchema = {
  headers: Joi.object({
    refreshtoken: Joi.string().required().messages({
      "any.required": "Refresh Token is required",
      "string.base": "Refresh Token must be a string",
    }),
  }).unknown(true),
};
