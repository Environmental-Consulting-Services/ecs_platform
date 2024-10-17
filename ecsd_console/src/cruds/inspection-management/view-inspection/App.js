import { useCallback, useState } from 'react';
import './App.css'

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

const surveyJson = { };

function SurveyApp() {
  // useRef enables the Model object to persist between state changes
  //const survey = useRef(new Model(surveyJson)).current;
  const [survey, setSurvey] = useState();
  const [surveyModel, setSurveyModel] = useState(new Model(surveyJson));
  const [surveyResults, setSurveyResults] = useState("");
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [isSurveyReady, setIsSurveyReady] = useState(false);


  
  function resetSurvey(json) {
    var newSurveyModel = new Model(surveyJson);
    newSurveyModel.onValueChanged.add(sendPartialResults);
    newSurveyModel.onComplete.add(sendCompleteResults);
    setSurveyModel(newSurveyModel);
  }

  function setJsonSurvey (json){
    var newSurveyModel = new Model(json);
    newSurveyModel.onValueChanged.add(sendPartialResults);
    newSurveyModel.onComplete.add(sendCompleteResults);
    setSurveyModel(newSurveyModel);
    return true;
  }

  function logSurveyJson () {
    console.log(surveyModel);
  }

  function loadPreviousData (json) {
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
