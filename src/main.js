import { config } from "dotenv";
import cors from "cors";
import { db_connection } from "./DB/connection.js";
import express from "express";
import helmet from "helmet";
import path from "path";
import routerHandler from "./utils/router-handler.utils.js";
import { startOtpCleanupJob } from "./utils/otpCleanupJob.utils.js";
import { Server } from "socket.io";
import { establishIoConnection } from "./utils/socket.utils.js";

/* path to .env file */
config({ path: path.resolve(`.env`) });

/* cors whitelist */
const whitelist = [
  process.env.FRONTEND_CORS_ORIGIN,
  process.env.SOCKET_IO_CORS_ORIGIN,
  undefined,
];
/* cors options */
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

/* Start up bootStrap function */
async function bootStrap() {
  /* express app */
  const app = express();
  /*  use json  */
  app.use(express.json());
  /* use cors */
  app.use(cors(corsOptions));
  /* use helmet to secure the app */
  app.use(helmet());
  /* routerHandler */
  routerHandler(app);
  /* database connection */
  db_connection();
  /* start the otp cleanup job */
  startOtpCleanupJob();
  /* start the server */
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server Started on port ${process.env.PORT}`);
  });

  /* start the socket connection */
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN,
    },
  });
  /* establish io connection */
  establishIoConnection(io);
}

export default bootStrap;
