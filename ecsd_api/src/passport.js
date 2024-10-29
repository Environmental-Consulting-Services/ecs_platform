import { ExtractJwt } from "passport-jwt";
import passportJWT from "passport-jwt";
import dotenv from "dotenv";
import passport from "passport";

import { UserModel } from "./apis/users/schema/user.schema";
const JWTStrategy = passportJWT.Strategy;
//dotenv.config();

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // here use var from env
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, done) {
      return UserModel.findOne({ _id: jwtPayload.id })
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
