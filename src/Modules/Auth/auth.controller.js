import { Router } from "express";
import {
  confirmEmailService,
  forgotPasswordService,
  gmailSignInService,
  gmailSignUpService,
  refreshTokenService,
  resetPasswordService,
  signInService,
  signUpService,
} from "./services/authentication.service.js";
import {
  errorHandlerMiddleware,
  validationMiddleware,
} from "../../Middleware/index.middleware.js";
import {
  confirmEmailSchema,
  forgetPasswordSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../../Validators/auth.schema.js";

const authController = Router();

/* signUp */
authController.post(
  "/sign-up",
  validationMiddleware(signUpSchema),
  errorHandlerMiddleware(signUpService)
);

/* confirmEmail */
authController.put(
  "/confirm-email",
  validationMiddleware(confirmEmailSchema),
  errorHandlerMiddleware(confirmEmailService)
);

/* signIn */
authController.post(
  "/sign-in",
  validationMiddleware(signInSchema),
  errorHandlerMiddleware(signInService)
);

/* google signUp */
authController.post(
  "/gmail-signup",
  errorHandlerMiddleware(gmailSignUpService)
);

/* google signIn */
authController.post("/gmail-login", errorHandlerMiddleware(gmailSignInService));

/* forgetPassword */
authController.patch(
  "/forget-password",
  validationMiddleware(forgetPasswordSchema),
  errorHandlerMiddleware(forgotPasswordService)
);

/* resetPassword */
authController.put(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  errorHandlerMiddleware(resetPasswordService)
);

/* refreshToken  */
authController.post(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  errorHandlerMiddleware(refreshTokenService)
);

export { authController };
