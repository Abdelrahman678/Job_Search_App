import { User } from "../../DB/models/user.model.js";
import BlackListTokens from "../../DB/models/black-list.model.js";
import jwt from "jsonwebtoken";

export const graphqlAuthentication = async (accesstoken) => {
    try{
        const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
        const isTokenBlacklisted = await BlackListTokens.findOne({tokenId:decoded.jti});
        if(isTokenBlacklisted){
            return {error:"Token expired, please log in again"}
        }
        // get user data
        const user = await User.findById(decoded._id, '-password -__v');
        if(!user){
            return {error:"please sign up first"}
        }
        // return user data 
        return {user:{...user._doc, token:{tokenId:decoded.jti, expiryDate: decoded.exp}}};
    }
    catch(error){
        return {error:error};
    }
}
