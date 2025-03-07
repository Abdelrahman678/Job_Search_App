import { globalErrorHandlerMiddleware } from "../Middleware/index.middleware.js";
import { rateLimit } from "express-rate-limit";
import {
  authController,
  companyController,
  jobController,
  userController,
} from "../Modules/index.modules.controllers.js";
import { mainSchema } from "../GraphQl/main.schema.js";
import { createHandler } from "graphql-http/lib/use/express";

/* rate Limiter */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: {
    message: "Too many requests, please try again later",
  },
  legacyHeaders: false,
});

/* router handler function */
const routerHandler = (app) => {
  /* apply limiter to all routes */
  app.use(limiter);
  /* all routes */
  app.use("/graphql", createHandler({schema: mainSchema}));
  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/company", companyController);
  app.use("/job", jobController);
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to Job Search App",
    });
  });
  /* Global error handler */
  app.use(globalErrorHandlerMiddleware);
};

export default routerHandler;
