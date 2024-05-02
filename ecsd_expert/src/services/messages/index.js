import dotenv from "dotenv";
var ObjectId = require('mongoose').Types.ObjectId; 

import { messageModel } from "../../schemas/message.schema";
import { createExpertMessageRoute } from "../chatgpt" ;


export const getMessagesRoute = async (req, res) => {
  let messagesObjectArray = [];
  let jsonArrayMessages = {};
  let options = [];

  if (req.query.include) {
    options = req.query.include.split(",");
  }

  // pagination
  let paginationSize = null;
  let pageNumber = null;
  if (req.query.page) {
    if (req.query.page.number) {
      pageNumber = +req.query.page.number;
    }
    if (req.query.page.size) {
      paginationSize = +req.query.page.size;
    }
  }
 
  // filtering
  let filters = {};

  if (req.query.filter) {
    filters = req.query.filter;
  }

  let sortValue;
  //sorting
  if (req.query.sort) {
    sortValue = req.query.sort;
  }



  const allMessages = await messageModel
    .find(filters)
    .where("to")
    .or([{to: new ObjectId(req.user._id)},{from: new ObjectId(req.user._id)}])
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  messagesObjectArray = allMessages.map((element) => {
    let jsonObj = {
      type: "messages",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayMessages = { ...jsonArrayMessages, ...jsonObj });
  });
  
  const sentData = { data: [...messagesObjectArray] };
  return res.status(200).send(sentData);
};


export const getMessageRoute = async (req, res) => {
  let options = [];

  const messageId = req.params.id;
  if (req.query.include) {
    options = req.query.include.split(",");
  }

  const message = await messageModel.findById(messageId);

  let sentData = {
    type: "messages",
    id: messageId,
    attributes: {
      ...message._doc,
    },
  };

  const finalData = {
    data: { ...sentData },
  };
  return res.status(200).send(finalData);
};

export const createMessageRoute = async (userId, from,to,message, delivered, read,) => {
 
  if (!to) {
    return { errors: [{ detail: "recipient (to) is required" }] };
  }
  if (!from) {
    return { errors: [{ detail: "sender (from) is required" }] };
  }

  const newMessage = new messageModel({
    from: from,
    to: to,
    message: message,
    delivered: delivered,
    read: read,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  await newMessage.save();
  

  if (to === "expert") {
    var result = await createExpertMessageRoute(message, userId);
    if (result && result.error) {
      return { error: result.error };
    }
  }

  const sentData = {
    data: {
      type: "messages",
      id: newMessage.id,
      attributes: {
        ...newMessage._doc,
      },
    },
  };

  return sentData;
};

export const editMessageRoute = async (req, res) => {
  const foundMessage = await messageModel.findById(req.params.id);
  const messageId = req.params.id;
  const { from,to,message, delivered, read, } =
    req.body.data.attributes;

 
  if (!foundMessage) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The message does not exist" }] });
  }
  const updatedMessage = await messageModel.updateOne(
    { _id: foundMessage._id },
    {
      
      updated_at: Date.now(),
      delivered: delivered,
      read: read,
    }
  );

  const sentData = {
    data: "messages",
    id: foundMessage.id,
    attributes: {
      ...updatedMessage._doc,
    },
  };
  return res.status(200).send(sentData);
}; 

export const deleteMessageRoute = async (req, res) => {
  // here should be verification if demo and other stuff?
  const toDeleteMessage = await messageModel.findById(req.params.id);
  if (!toDeleteMessage) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The message does not exist" }] });
  } else {
    try {
      await messageModel.deleteOne({ _id: toDeleteMessage._id });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
    }
  }
};
