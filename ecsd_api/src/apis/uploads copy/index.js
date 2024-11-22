import dotenv from 'dotenv';
import { UserModel } from '../users/schema/user.schema';

dotenv.config();

export const setUserProfileImageRoute = async (randomId, req, res) => {
  const id = req.params.id;

  if (!req.file) {
    return res.status(400).send({ message: "No image was set" });
  } else {
    const foundUser = await UserModel.findById(id);
    if (!foundUser) {
      return res.status(400).send({ message: "No user found" });
    } else {
      const image = req.file;
      const addProfilePicture = await UserModel.updateOne({ _id: foundUser.id  },
        {
          profile_image: `${process.env.APP_URL_API}/public/images/users/${id}/${randomId}-${image.originalname}`,
        }
      );
      const sentData = {
        url: `${process.env.APP_URL_API}/public/images/users/${id}/${randomId}-${image.originalname}`,
      };
      return res.status(201).send(sentData);
    }
  }
};

