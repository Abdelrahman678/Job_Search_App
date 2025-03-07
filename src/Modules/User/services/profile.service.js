import { compareSync } from "bcrypt";
import { BlackListTokens, User } from "../../../DB/models/index.models.js";
import { nanoid } from "nanoid";
import { cloudinary } from "../../../Config/cloudinary.config.js";

/* === updateUserProfile === */
export const updateUserProfileService = async (req, res) => {
  /* return response */
  const { _id } = req.loggedInUser;
  /* destructure request body */
  const { firstName, lastName, gender, DOB, mobileNumber } = req.body;
  /* find user */
  const user = await User.findById({ _id });
  /* return error if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* update user */
  if (firstName) {
    user.firstName = firstName;
  }
  if (lastName) {
    user.lastName = lastName;
  }
  if (gender) {
    user.gender = gender;
  }
  if (DOB) {
    user.DOB = DOB;
  }
  if (mobileNumber) {
    user.mobileNumber = mobileNumber;
  }
  /* save user */
  await user.save();
  /* return response */
  return res.status(200).json({
    message: "Profile updated successfully",
  });
};

/* === getLoggedInUser === */
export const getLoggedInUserService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* find user */
  const user = await User.findById(_id);
  /* user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* return response */
  return res.status(200).json({
    message: "User profile",
    data: user,
  });
};

/* === getOtherUser === */
export const getOtherUserService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* get user id from request parameters */
  const { id } = req.params;

  /* find user */
  const user = await User.findById(id);

  /* user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  /* return response */
  return res.status(200).json({
    message: "User profile retrieved successfully",
    user: {
      userName: user.username,
      mobileNumber: user.mobileNumber,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
    },
  });
};

/* === updatePassword === */
export const updatePasswordService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* destructure request body */
  const { oldPassword, newPassword } = req.body;
  /* compare old password with new password */
  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "The two fields cannot be the same",
    });
  }
  /* find user */
  const user = await User.findById(_id);
  /* user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* compare old password */
  const isPasswordMatch = compareSync(oldPassword, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({
      message: "Old password is incorrect",
    });
  }
  /* set new password */
  user.password = newPassword;
  /* save user */
  await user.save();
  /* black list token */
  await BlackListTokens.create(req.loggedInUser.token);
  /* return response */
  return res.status(200).json({
    message: "Password updated successfully",
  });
};

/* === softDeleteUser === */
export const softDeleteUserService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  // Find user
  const user = await User.findById(_id);
  /* user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* if already deleted */
  if (user.isDeleted) {
    return res.status(400).json({
      message: "User already deleted",
    });
  }
  // Soft delete user
  user.isDeleted = true;
  user.deletedAt = new Date();
  // Save user
  await user.save();

  /* blackList user token */
  await BlackListTokens.create(req.loggedInUser.token);

  // Return response
  return res.status(200).json({
    message: "User account deleted successfully",
  });
};

/* === uploadProfilePictureCloudinary === */
export const uploadProfilePictureCloudinaryService = async (req, res) => {
  /* get user id and file from request */
  const { _id } = req.loggedInUser;
  const { file } = req;
  /* return error if no file uploaded */
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/User/Profile/${folderId}`,
    }
  );
  /* find and update user */
  const user = await User.findByIdAndUpdate(
    _id,
    { profilePic: { secure_url, public_id, folderId } },
    { new: true }
  );
  /* return response */
  res.status(200).json({
    message: "Profile picture uploaded successfully",
    user,
  });
};

/* === uploadCoverPictureCloudinary === */
export const uploadCoverPictureCloudinaryService = async (req, res) => {
  /* get user id and file from request */
  const { _id } = req.loggedInUser;
  const { file } = req;
  /* return error if no file uploaded */
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/User/Cover/${folderId}`,
    }
  );
  /* find and update user */
  const user = await User.findByIdAndUpdate(
    _id,
    { coverPic: { secure_url, public_id, folderId } },
    { new: true }
  );
  /* return response */
  res.status(200).json({
    message: "Cover picture uploaded successfully",
    user,
  });
};

/* === deleteProfilePictureCloudinary === */
export const deleteProfilePictureCloudinaryService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* find user */
  const user = await User.findById(_id);
  /* return error if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* check if profile picture exists */
  if (user.profilePic && user.profilePic.public_id) {
    /* delete profile picture from cloudinary */
    await cloudinary().uploader.destroy(user.profilePic.public_id);
    /* delete folder from cloudinary */
    await cloudinary().api.delete_folder(
      `${process.env.CLOUDINARY_FOLDER}/User/Profile/${user.profilePic.folderId}`
    );
    /* find and update user */
    await User.findByIdAndUpdate(
      _id,
      { $unset: { profilePic: "" } },
      { new: true }
    );
    /* return response */
    return res.status(200).json({
      message: "Profile picture deleted successfully",
    });
  }
  /* return no profile picture to delete */
  return res.status(200).json({
    message: "No profile picture to delete",
  });
};

/* === deleteCoverPictureCloudinary === */
export const deleteCoverPictureCloudinaryService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* find user */
  const user = await User.findById(_id);
  /* return error if user not found */
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  /* check if cover picture exists */
  if (user.coverPic && user.coverPic.public_id) {
    /* delete cover picture from cloudinary */
    await cloudinary().uploader.destroy(user.coverPic.public_id);
    /* delete folder from cloudinary */
    await cloudinary().api.delete_folder(
      `${process.env.CLOUDINARY_FOLDER}/User/Cover/${user.coverPic.folderId}`
    );
    /* find and update user */
    await User.findByIdAndUpdate(
      _id,
      { $unset: { coverPic: "" } },
      { new: true }
    );
    /* return response */
    return res.status(200).json({
      message: "Cover picture deleted successfully",
    });
  }
  /* return no cover picture to delete */
  return res.status(200).json({
    message: "No cover picture to delete",
  });
};
