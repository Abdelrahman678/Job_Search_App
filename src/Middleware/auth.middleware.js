import { BlackListTokens } from "../DB/models/index.models.js";
import jwt from "jsonwebtoken";
import { User } from "../DB/models/index.models.js";

/* for socket io */
const validateUserToken = async (accesstoken) => {
  const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
  const isTokenBlacklisted = await BlackListTokens.findOne({
    tokenId: decoded.jti,
  });
  if (isTokenBlacklisted) {
    return res.status(401).json({
      message: "Token expired, please log in again",
    });
  }
  // get user data
  const user = await User.findById(decoded._id, "-password -__v");
  if (!user) {
    return res.status(404).json({
      message: "please sign up first",
    });
  }
  // return user data
  return {
    ...user._doc,
    token: { tokenId: decoded.jti, expiryDate: decoded.exp },
  };
};

/* authentication middleware */
export const authenticationMiddleware = (socketToken = null) => {
  /* for socket io */
  if (socketToken) return validateUserToken(socketToken);
  /* for normal request */
  return async (req, res, next) => {
    try {
      const { accesstoken } = req.headers;
      if (!accesstoken) {
        return res.status(401).json({
          message: "please Login First",
        });
      }
      const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
      const isTokenBlacklisted = await BlackListTokens.findOne({
        tokenId: decoded.jti,
      });
      if (isTokenBlacklisted) {
        return res.status(401).json({
          message: "Token expired, please log in again",
        });
      }
      // get user data
      const user = await User.findById(decoded._id, "-password -__v");
      if (!user) {
        return res.status(404).json({
          message: "please sign up first",
        });
      }
      // add user to request
      req.loggedInUser = {
        ...user._doc,
        token: { tokenId: decoded.jti, expiryDate: decoded.exp },
      };
      next();
    } catch (error) {
      if (error.name === "jwt expired") {
        return res.status(401).json({
          message: "Token expired, please log in again",
        });
      }
      return res.status(500).json({
        message: error,
      });
    }
  };
};

export const authorizationMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { role } = req.loggedInUser;
      const isRoleAllowed = allowedRoles.includes(role);
      if (!isRoleAllowed) {
        return res.status(403).json({
          message: "You are not authorized to perform this action",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        message: error,
      });
    }
  };
};
