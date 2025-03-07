import { Router } from "express";
import {
  deleteCoverPictureCloudinaryService,
  deleteProfilePictureCloudinaryService,
  getOtherUserService,
  getLoggedInUserService,
  softDeleteUserService,
  updatePasswordService,
  updateUserProfileService,
  uploadCoverPictureCloudinaryService,
  uploadProfilePictureCloudinaryService,
} from "./services/profile.service.js";
import {
  authenticationMiddleware,
  errorHandlerMiddleware,
  MulterHost,
  validationMiddleware,
} from "../../Middleware/index.middleware.js";
import { imageExtensions } from "../../Constants/constants.js";
import {
  getOtherUserSchema,
  updatePasswordSchema,
  updateUserProfileSchema,
} from "../../Validators/profile.schema.js";
import { getChatHistoryService } from "./services/chat.service.js";
const userController = Router();
userController.use(authenticationMiddleware());

/* update profile */
userController.put(
  "/update-profile",
  validationMiddleware(updateUserProfileSchema),
  errorHandlerMiddleware(updateUserProfileService)
);
/* get logged in user */
userController.get(
  "/logged-in-user",
  errorHandlerMiddleware(getLoggedInUserService)
);
/* get other user */
userController.get(
  "/other-user/:id",
  validationMiddleware(getOtherUserSchema),
  errorHandlerMiddleware(getOtherUserService)
);
/* update password */
userController.patch(
  "/update-password",
  validationMiddleware(updatePasswordSchema),
  errorHandlerMiddleware(updatePasswordService)
);
/* soft delete user */
userController.delete(
  "/delete-account",
  errorHandlerMiddleware(softDeleteUserService)
);
/* upload profile picture */
userController.patch(
  "/upload-profile-picture",
  MulterHost(imageExtensions).single("profilePicture"),
  errorHandlerMiddleware(uploadProfilePictureCloudinaryService)
);
/* upload cover picture */
userController.patch(
  "/upload-cover-picture",
  MulterHost(imageExtensions).single("coverPicture"),
  errorHandlerMiddleware(uploadCoverPictureCloudinaryService)
);
/* delete profile picture */
userController.delete(
  "/delete-profile-picture",
  errorHandlerMiddleware(deleteProfilePictureCloudinaryService)
);
/* delete cover picture */
userController.delete(
  "/delete-cover-picture",
  errorHandlerMiddleware(deleteCoverPictureCloudinaryService)
);
/* get chat history 'couldn't test' */
userController.get(
  "/get-chat-history/:receiverId",
  errorHandlerMiddleware(getChatHistoryService)
)

export { userController };
