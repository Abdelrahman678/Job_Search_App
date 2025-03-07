import { compareSync, hashSync } from "bcrypt";
import { User } from "../../../DB/models/index.models.js";
import { emailEventEmitter } from "../../../Services/send-email.service.js";
import { otpEnum, providerEnum } from "../../../Constants/constants.js";
import { generateToken, verifyToken } from "../../../utils/index.utils.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";

/* === signUp === */
export const signUpService = async (req, res, next) => {
  /* destructure request body */
  const { firstName, lastName, email, password, gender, DOB, mobileNumber } =
    req.body;
  /* check if email already exist */
  const isEmailExist = await User.findOne({ email: email });
  if (isEmailExist) {
    return res
      .status(409)
      .json({ message: "Email already exist. Please try again." });
  }

  /*
   * hash and encrypt password and mobile number using hooks
   */

  /* generate otp */
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = hashSync(otp, parseInt(process.env.SALT_ROUNDS));
  /* Send email */
  emailEventEmitter.emit("SendEmail", {
    subject: "Verify Your Email",
    html: `
        <div style=" height: 100vh; background-color: #f2f2f2; font-family: Arial, sans-serif; line-height: 1.5; text-align: center;">
            <h1 style="color: #4CAF50;">Verify Your Email</h1>
            <p>Hello,</p>
            <p>Thank you for registering with us. Your OTP for email verification is:</p>
            <p style="font-size: 24px; color: #FF5722;"><strong>${otp}</strong></p>
            <p>Please enter this OTP on the verification page to complete the process.</p>
            <p>If you did not sign up for this account, please ignore this email.</p>
            <p>Thank you!</p>
            <p>Best regards,<br>The Job Search App Team</p>
        </div>
        `,
    to: email,
  });

  /* create user */
  const user = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    gender: gender,
    DOB: DOB,
    mobileNumber: mobileNumber,
    OTP: [
      {
        code: hashedOtp,
        type: otpEnum.CONFIRM_EMAIL,
        // OTP expires in 10 minutes
        expiresIn: new Date(Date.now() + 10 * 60 * 1000),
      },
    ],
  });
  /* save user */
  await user.save();

  /* return response */
  if (!user) {
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
  return res.status(201).json({
    message: "User created successfully",
    data: user,
  });
};

/* === confirmEmail === */
export const confirmEmailService = async (req, res) => {
  /* get email and confirm otp */
  const { email, confirmEmailOtp } = req.body;
  /* check if user exists */
  const user = await User.findOne({
    email: email,
    isConfirmed: false,
    OTP: { $exists: true },
  });

  /* return error if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  /* check if confirmEmailOtp is the same as the one in the database */
  const isOtpMatch = compareSync(confirmEmailOtp, user.OTP[0].code);
  /* check if otp expired */
  const isOtpExpired = user.OTP[0].expiresIn < new Date();
  /* return error if otp is not valid */
  if (!isOtpMatch) {
    return res.status(400).json({
      message: "Invalid otp",
    });
  }
  /* return error if otp is expired */
  if (isOtpExpired) {
    return res.status(400).json({
      message: "OTP has expired",
    });
  }
  /* check OTP type */
  if (user.OTP[0].type === otpEnum.CONFIRM_EMAIL) {
    /* update user */
    await User.findByIdAndUpdate(user._id, {
      isConfirmed: true,
      $unset: { OTP: "" },
    });
    /* return success response */
    return res.status(200).json({
      message: "Email Confirmed successfully",
    });
  } else {
    return res.status(400).json({
      message: "Invalid OTP type",
    });
  }
};

/* === signIn === */
export const signInService = async (req, res) => {
  /* destructure request body */
  const { email, password } = req.body;
  /* find user by email */
  const user = await User.findOne({ email: email });
  /* return error if user not found */
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  /* compare password */
  const isPasswordMatch = compareSync(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  /* generate tokens */
  const accessToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_LOGIN,
  });
  const refreshToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_REFRESH,
  });
  /* return success response */
  return res.status(200).json({
    message: "User logged in successfully",
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};

/* === google signUp === */
export const gmailSignUpService = async (req, res) => {
  /* destructure request body */
  const { idToken } = req.body;
  /* verify id token using google */
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  /* destructure payload from google */
  const { email_verified, given_name, family_name, email } = payload;
  // console.log(payload);

  /* return error if email is not verified */
  if (!email_verified) {
    return res.status(401).json({
      message: "Invalid gmail credentials",
    });
  }
  /* check if user exists */
  const isEmailExist = await User.findOne({ email: email });
  /* return error if user exists */
  if (isEmailExist) {
    return res.status(409).json({
      message: "User already exists",
    });
  }
  /* create user */
  const user = new User({
    firstName: given_name,
    lastName: family_name,
    email: email,
    provider: providerEnum.GOOGLE,
    isConfirmed: true,
    password: hashSync(uuidv4(), parseInt(process.env.SALT_ROUNDS)),
  });
  await user.save();
  /* return success response */
  return res.status(200).json({
    message: "User signed up successfully",
  });
};

/* === google signIn === */
export const gmailSignInService = async (req, res) => {
  /* destructure request body */
  const { idToken } = req.body;
  /* verify id token using google */
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  /* destructure payload from google */
  const { email, email_verified } = payload;
  /* return error if email is not verified */
  if (!email_verified) {
    return res.status(401).json({
      message: "Invalid gmail credentials",
    });
  }
  /* check if the user exists in db and is google provider */
  const user = await User.findOne({
    email: email,
    provider: providerEnum.GOOGLE,
  });
  /* return error if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* generate tokens */
  const accessToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_LOGIN,
  });
  const refreshToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_REFRESH,
  });
  /* return success response */
  res.status(200).json({
    message: "User logged in successfully",
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};

/* === forgetPassword === */
export const forgotPasswordService = async (req, res) => {
  /* destructure request body */
  const { email } = req.body;
  /* check if user exists */
  const user = await User.findOne({ email: email });
  /* return not found if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* generate otp */
  const otp = Math.floor(Math.random() * 10000);
  /* send otp to user email */
  emailEventEmitter.emit("SendEmail", {
    subject: "Reset your password",
    html: `
    <div style=" height: 100vh; background-color: #f2f2f2; font-family: Arial, sans-serif; line-height: 1.5; text-align: center;>
        <h1 style="color: #4CAF50;">Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. Your OTP is:</p>
        <p style="font-size: 24px; color: #FF5722;"><strong>${otp}</strong></p>
        <p>Please enter this OTP on the reset page to proceed.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you!</p>
        <p>Best regards,<br>The Job Search App Team</p>
    </div>
    `,
    to: user.email,
  });
  /* hash otp and save in db */
  const hashedOtp = hashSync(otp.toString(), parseInt(process.env.SALT_ROUNDS));

  // Check if OTP array exists, if not initialize it
  if (!user.OTP) {
    user.OTP = [];
  }

  // Push the new OTP into the array
  user.OTP.push({
    code: hashedOtp,
    type: otpEnum.FORGET_PASSWORD,
    // OTP expires in 10 minutes
    expiresIn: new Date(Date.now() + 10 * 60 * 1000),
  });
  /* save user */
  await user.save();
  /* return success response */
  return res.status(200).json({
    message: "Otp sent successfully",
  });
};

/* === resetPassword === */
export const resetPasswordService = async (req, res) => {
  /* destructure request body */
  const { email, newPassword, otp } = req.body;

  /* find user by email */
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  /* Check if user has OTP */
  if (!user.OTP || user.OTP.length === 0) {
    return res.status(400).json({
      message: "Generate OTP first",
    });
  }

  /* Check the latest OTP */
  const latestOtp = user.OTP[user.OTP.length - 1];

  /* Check OTP type */
  if (latestOtp.type !== otpEnum.FORGET_PASSWORD) {
    return res.status(400).json({
      message: "Invalid OTP type",
    });
  }

  /* Check if OTP is valid */
  const isOtpMatch = compareSync(otp.toString(), latestOtp.code);
  if (!isOtpMatch) {
    return res.status(400).json({
      message: "OTP does not match",
    });
  }

  /* Check OTP expiry */
  const isOtpExpired = latestOtp.expiresIn < new Date();
  if (isOtpExpired) {
    return res.status(400).json({
      message: "OTP has expired",
    });
  }

  /* Update user with new password and unset OTP */
  user.password = newPassword;
  user.OTP = user.OTP.filter((otpEntry) => otpEntry.code !== latestOtp.code);

  /* Save the updated user */
  await user.save();

  /* Return success response */
  return res.status(200).json({
    message: "Password reset successfully",
  });
};

/* === refresh token === */
export const refreshTokenService = async (req, res) => {
  /* get refresh token from headers */
  const { refreshtoken } = req.headers;
  /* verify refresh token */
  const decoded = verifyToken({
    token: refreshtoken,
    secretKey: process.env.JWT_SECRET_REFRESH,
  });
  /* generate new access token */
  const accessToken = generateToken({
    publicClaims: { _id: decoded._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_LOGIN,
  });
  /* return success response */
  return res.status(200).json({
    message: "Token refreshed successfully",
    accessToken,
  });
};
