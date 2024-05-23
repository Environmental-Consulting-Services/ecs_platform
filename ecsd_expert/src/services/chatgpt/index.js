import dotenv from "dotenv";
import OpenAI from "openai";
import { messageModel } from "../../schemas/message.schema";
import { UserModel } from "../../schemas/user.schema";

dotenv.config();


const { OPEN_AI_API_KEY, OPEN_AI_ASSISTANT_ID } = process.env;
let pollingInterval;
let pollingComplete = false;

// Set up OpenAI Client
const openai = new OpenAI({
    apiKey: OPEN_AI_API_KEY,
});

// Assistant can be created via API or UI
const assistantId = OPEN_AI_ASSISTANT_ID;

export const createThreadRoute = async (req, res) => {
    
  var userId = req.user.id
  var thread = await createThread();
  res.json({ threadId: thread.id });
}

// Set up a Thread
export const createThread = async () => {
  console.log('Creating a new thread...');

  const thread = await openai.beta.threads.create();
  return thread;
}



export const createExpertMessageRoute = async (message, userId) => {
  
  UserModel.findById(userId).then( async (user) => {
    
    var threadId;
    if (user.expert_thread && user.expert_thread != "") {
      threadId = user.expert_thread;
    } else {
      const thread = await openai.beta.threads.create().then( async (thread) => {

        user.expert_thread = thread.id;
        await user.save();
        threadId = thread.id ;
      });
    }

    addMessage(threadId, message).then(message => {
      runAssistant(threadId).then(run => {
        const runId = run.id;
        pollingInterval = setInterval(() => {
          var theStatus = checkingStatus( userId, threadId, runId).then(status => {
            if (!status) {
              clearInterval(pollingInterval);
            }
          });
        }, 3000);
      });
      const sentData = {
        data: {
          type: "expert_message",
          id: "",
          attributes: {
            status: "message_sent",
          },
        },
      };
      return sentData
    });
    }).catch(err => {
      clearInterval(pollingInterval);
      return { error: err };
    }
  );
}



export const addMessage = async (threadId, message) => {
    console.log('Adding a new message to thread: ' + threadId);
    try{

 
      const response = await openai.beta.threads.messages.create(
          threadId,
          {
              role: "user",
              content: message
          }
      );
      return response;
    }catch(err){
      console.log(err);
    }
}

export const runAssistant = async (threadId,) => {
    console.log('Running assistant for thread: ' + threadId)
    const response = await openai.beta.threads.runs.create(
        threadId,
        { 
          assistant_id: assistantId
          // Make sure to not overwrite the original instruction, unless you want to
        }
      );

    console.log(response)

    return response;
}

export const checkingStatus = async ( userId, threadId, runId) => {
    const runObject = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
    );

    const status = runObject.status;
    //console.log(runObject)
    //console.log('Current status: ' + status);
    
    if(status == 'completed'){
      if(pollingComplete) {
        return false;
      } else {
      pollingComplete = true;
      clearInterval(pollingInterval);

        const messagesList = await openai.beta.threads.messages.list(threadId);
        let messages = []
        
        messagesList.body.data.forEach(message => {
            messages.push(message.content);
        });
      
        const newMessage = new messageModel({
          from: "expert",
          to: userId,
          message: JSON.stringify(messages[0][0]['text']['value']),
        });

        await newMessage.save().then(() => {
          console.log("Message saved");
        }).catch(err => {
          console.log(err);
        });
        return false;
    }
  } else {
    return true;
  }
}

