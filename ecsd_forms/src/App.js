import { useCallback, useState } from 'react';
import './App.css'

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

const surveyJson = { };

// Function to receive messages from Flutter
window.receiveMessageFromFlutter = function(message) {
    document.getElementById("messageFromFlutter").innerText = message;
}

window.sendMessageToFlutter = function(message){
    var messageHandler = window['messageHandler'];
    if (messageHandler) {
      messageHandler.postMessage(message);
    }
}

window.sendFormUpdateToFlutter = function(message){
  var messageHandler = window['formUpdateHandler'];
  if (messageHandler) {
    messageHandler.postMessage(message);
  }
}

window.sendFormCompleteToFlutter = function(message){
  var messageHandler = window['formCompleteHandler'];
  if (messageHandler) {
    messageHandler.postMessage(message);
  }
}

function SurveyApp() {
  // useRef enables the Model object to persist between state changes
  //const survey = useRef(new Model(surveyJson)).current;
  const [survey, setSurvey] = useState();
  const [surveyModel, setSurveyModel] = useState(new Model(surveyJson));
  const [surveyResults, setSurveyResults] = useState("");
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [isSurveyReady, setIsSurveyReady] = useState(false);

  window.surveyIsReady = (value) => {
    //survey.current = new Model(surveyJson);
    setIsSurveyReady(value);  
    return true;
  } 
  
  window.resetSurvey =  (json) => {
    var newSurveyModel = new Model(surveyJson);
    newSurveyModel.onValueChanged.add(sendPartialResults);
    newSurveyModel.onComplete.add(sendCompleteResults);
    setSurveyModel(newSurveyModel);
  }

  window.setJsonSurvey =  (json) => {
    var newSurveyModel = new Model(json);
    newSurveyModel.onValueChanged.add(sendPartialResults);
    newSurveyModel.onComplete.add(sendCompleteResults);
    setSurveyModel(newSurveyModel);
    return true;
  }

  window.logSurveyJson = () => {
    console.log(surveyModel);
  }

  window.loadPreviousData = (json) => {
    surveyModel.data = json;
    if (json.pageNo && json.pageNo !== null && json.pageNo !== undefined) { 
      surveyModel.currentPageNo = json.pageNo;
    }
    if(json.mode)
    {
      surveyModel.mode = json.mode;
    }
 }


  function SurveyGenerator() { 
    //setSurvey(Survey().fromJson(surveyModel));
    return  <Survey model={surveyModel} id="surveyContainer" key="surveyContainer"/> 
  } 

  const sendCompleteResults = useCallback((sender) => {
    setSurveyResults(JSON.stringify(sender.data, null, 4));
    setIsSurveyCompleted(true);
    window.sendFormCompleteToFlutter( JSON.stringify(sender.data));
  }, []);

  const sendPartialResults = useCallback((sender) => {
    setSurveyResults(JSON.stringify(sender.data, null, 4));
    setIsSurveyCompleted(true);
    window.sendFormUpdateToFlutter( JSON.stringify(sender.data));
  }, []);

    return (
      <>
         {isSurveyReady ? (
        <SurveyGenerator></SurveyGenerator>
        ): (<p>Survey is not ready</p>)}
      </>
    );
}

export default SurveyApp;
