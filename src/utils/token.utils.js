import jwt from "jsonwebtoken";

/* generate token function */
export const generateToken = ({
  publicClaims,
  registeredClaims,
  secretKey,
}) => {
  return jwt.sign(publicClaims, secretKey, registeredClaims);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};
