import dotenv from "dotenv";
import nodemailer from "nodemailer";
import randomToken from "random-token";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { UserModel } from "../users/schema/user.schema";
import { roleModel } from "../roles/schema/role.schema"
import { passwordResetModel } from "./schema/passwordResets.schema";
import CrudService from "../../services/cruds-service";

//dotenv.config();


const APP_URL_API = process.env.APP_URL_API;
const mail_api_host = process.env.MAIL_API_HOST;
const mail_api_port = process.env.MAIL_API_PORT;


/* const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

 */export const loginRouteHandler = async (req, res, email, password) => {
  //Check If User Exists
  let foundUser = await UserModel.findOne({ email: email });
  if (foundUser == null) {
    return res.status(400).json({
      errors: [{ detail: "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client." }],
    });
  } else {
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (validPassword) {

      req.headers.authorization;
      // Generate JWT token
      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email },
        "token",
        {
          expiresIn: "24h",
        }
      );

      const resBody = {
        token_type: "Bearer",
        expires_in: "24h",
        access_token: token,
        refresh_token: token,
      }
      return res.json(resBody);
    } else {
      return res.status(400).json({
        errors: [{ detail: "Invalid password" }],
      });
    }
  }
};


export const tokeRouteHandler = async (req, res) => {


/*
/  This is the expected request from the client



    - Convert INCOMING params.
      
      'email': email,
      'password': password,
      'cellphone': cellphone,
      'first_name': firstName,
      'last_name': lastName

    - Call the registerRouteHandler function
      registerRouteHandler = async (req, res, type, first_name, last_name, email, password, profile_image, phone, address, role,)


    */

/*
/  This is the expected response from the server
/

  id: json['userId'],
  email: json['userEmail'],
  firstName: json['userFirstName'],
  lastName: json['userLastName'],
  cellphone: json['userCellphone'],
  accessToken: json['access'],
  refreshToken: json['refresh'], */




}




export const registerRouteHandler = async (req, res, type, first_name, last_name, email, password, profile_image, phone, address, role,) => {
  // check if user already exists
  let foundUser = await UserModel.findOne({ email: email });
  if (foundUser) {
    // does not get the error
    return res.status(400).json({ message: "The email is already in use" });
  }

  // check password to exist and be at least 8 characters long
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "The password must be at least 8 characters long." });
  }

  //hack the type for now
  type = "user";

  // hash password to save in db
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  let newRole = await roleModel.findOne({ name: 'member' });

  const newUser = new UserModel({
    type, first_name, last_name, email, profile_image, phone, address, role,
    password: hashPassword,
  });
  newUser.role = newRole;
  await newUser.save();


  newUser.password = undefined;


  const setData = {
    data: {
      type: "users",
      id: newUser.id,
      attributes: {
        ...newUser._doc,
      },
      relationships: {
        roles: {
          links: {
            self: `${process.env.APP_URL_API}/${newRole.id}/relationships/roles`,
            related: `${process.env.APP_URL_API}/${newRole.id}/roles`,
          },
        },
      },
    },
  };

  return res.status(201).send(setData);







  // Generate JWT token
  /* const token = jwt.sign({ id: newUser.id, email: newUser.email }, "token", {
    expiresIn: "24h",
  }); */
/*   return res.status(200).json({
    token_type: "Bearer",
    expires_in: "24h",
    access_token: token,
    refresh_token: token,
  }); */
};

export const forgotPasswordRouteHandler = async (req, res, email) => {
  let foundUser = await UserModel.findOne({ email: email });

  if (!foundUser) {
    return res.status(400).json({errors: { email: ["The email does not match any existing user."] }});
  } else {
    let token = randomToken(20);
    // send mail with defined transport object
    
    
    const formData = new FormData();
    formData.append("to", email);
    formData.append("subject", "Smart Complai: Reset Password");

    let html = `<p>You requested to change your password. If this request was not made by you please contact us. Access <a href='${process.env.APP_URL_CLIENT}/auth/reset-password?token=${token}&email=${email}'>this link</a> to reste your password </p>`; // html body

    formData.append("message", html);
    console.log("Sending email!");

    CrudService.sendMail(formData, email).then( async (response) => {

      console.log("Sent email");
      
      const dataSent = {
        data: "password-forgot",
        attributes: {
          redirect_url: `${process.env.APP_URL_API}/password-reset`,
          email: email,
        },
      };

      await passwordResetModel.create({
        email: foundUser.email,
        token: token,
        created_at: new Date(),
        });

        return res.status(204).json(dataSent);
    
      }).catch((error) => {
        console.log(error);
        return res.status(400).json({errors: { email: ["The email does not match any existing user."] }});
      });
        // save token in db
      
 
   
  }
}

export const resetPasswordRouteHandler = async (req, res) => {
  const foundUser = await UserModel.findOne({ email: req.body.data.attributes.email  });
  const foundToken = await passwordResetModel.findOne({ email: req.body.data.attributes.email, token: req.body.data.attributes.token });

  if (!foundUser || !foundToken) {
    return res.status(400).json({errors: { email: ["The email or token does not match any existing user."] }});
  } else {
    const { password, password_confirmation } = req.body.data.attributes;
    // validate password
    if (password.length < 8) {
      return res.status(400).json({errors: { password: ["The password should have at lest 8 characters."] }});
    }

    if (password != password_confirmation) {
      return res.status(400).json({errors: { password: ["The password and password confirmation must match."] }});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await passwordResetModel.deleteOne({ email: foundUser.email });

    await UserModel.updateOne(
      { email: foundUser.email },
      { $set: { "password": hashPassword } }
    );
    return res.sendStatus(204);
  }
}