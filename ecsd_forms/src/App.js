import { useCallback, useState, useRef } from 'react';
import './App.css'

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';


const otherSurveyJson = {
  pages: [{
    elements: [{
      type: "html",
      html: "<h4>In this survey, we will ask you a couple questions about your impressions of our product.</h4>"
    }]
  }, {
    elements: [{
      name: "satisfaction-score",
      title: "How would you describe your experience with our product?",
      type: "radiogroup",
      choices: [
        { value: 5, text: "Fully satisfying" },
        { value: 4, text: "Generally satisfying" },
        { value: 3, text: "Neutral" },
        { value: 2, text: "Rather unsatisfying" },
        { value: 1, text: "Not satisfying at all" }
      ],
      isRequired: true
    }]
  }, {
    elements: [{
      name: "what-would-make-you-more-satisfied",
      title: "What can we do to make your experience more satisfying?",
      type: "comment",
      visibleIf: "{satisfaction-score} = 4"
    }, {
      name: "nps-score",
      title: "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
      type: "rating",
      rateMin: 0,
      rateMax: 10,
    }],
    visibleIf: "{satisfaction-score} >= 4"
  }, {
    elements: [{
      name: "how-can-we-improve",
      title: "In your opinion, how could we improve our product?",
      type: "comment"
    }],
    visibleIf: "{satisfaction-score} = 3"
  }, {
    elements: [{
      name: "disappointing-experience",
      title: "Please let us know why you had such a disappointing experience with our product",
      type: "comment"
    }],
    visibleIf: "{satisfaction-score} =< 2"
  }],
  showQuestionNumbers: "off",
  pageNextText: "Forward",
  completeText: "Submit",
  showPrevButton: false,
  firstPageIsStarted: true,
  startSurveyText: "Take the Survey",
  completedHtml: "Thank you for your feedback!",
  showPreviewBeforeComplete: "showAnsweredQuestions"
};


const surveyJson = {
  "title": "NPS Survey Question",
  "completedHtml": "<h3>Thank you for your feedback</h3>",
  "completedHtmlOnCondition": [
   {
    "expression": "{nps_score} >= 9",
    "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you love our product. Your ideas and suggestions will help us make it even better.</h4>"
   },
   {
    "expression": "{nps_score} >= 6  and {nps_score} <= 8",
    "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you shared your ideas with us. They will help us make our product better.</h4>"
   }
  ],
  "pages": [
   {
    "name": "page1",
    "elements": [
     {
      "type": "rating",
      "name": "nps_score",
      "title": "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
      "isRequired": true,
      "rateCount": 11,
      "rateMin": 0,
      "rateMax": 10,
      "minRateDescription": "(Most unlikely)",
      "maxRateDescription": "(Most likely)"
     },
     {
      "type": "checkbox",
      "name": "promoter_features",
      "visibleIf": "{nps_score} >= 9",
      "title": "Which of the following features do you value the most?",
      "description": "Please select no more than three features.",
      "isRequired": true,
      "validators": [
       {
        "type": "answercount",
        "text": "Please select no more than three features.",
        "maxCount": 3
       }
      ],
      "choices": [
       "Performance",
       "Stability",
       "User interface",
       "Complete functionality",
       "Learning materials (documentation, demos, code examples)",
       "Quality support"
      ],
      "showOtherItem": true,
      "otherText": "Other features:",
      "colCount": 2
     },
     {
      "type": "comment",
      "name": "passive_experience",
      "visibleIf": "{nps_score} >= 7  and {nps_score} <= 8",
      "title": "What can we do to make your experience more satisfying?"
     },
     {
      "type": "comment",
      "name": "disappointing_experience",
      "visibleIf": "{nps_score} <= 6",
      "title": "Please let us know why you had such a disappointing experience with our product"
     }
    ]
   }
  ],
  "showQuestionNumbers": "off"
 };




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

function App() {
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
  } 

  window.resetSurvey =  (json) => {
    var newSurveyModel = new Model(surveyJson);
    
    newSurveyModel.onComplete.add(displayResults);

    setSurveyModel(newSurveyModel);

  }



  window.setJsonSurvey =  (json) => {
    
    setSurveyModel(new Model(json));

  }

  window.logSurveyJson = () => {
    console.log(surveyModel);

  }

  function SurveyGenerator(Model) { 

    //setSurvey(Survey().fromJson(surveyModel));
    return  <Survey model={surveyModel} id="surveyContainer" key="surveyContainer"/> 
  } 

  const displayResults = useCallback((sender) => {
    setSurveyResults(JSON.stringify(sender.data, null, 4));
    setIsSurveyCompleted(true);
    window.sendMessageToFlutter(sender.data)
  }, []);

  surveyModel.onComplete.add(displayResults);

    return (
      <>
       
         {isSurveyReady ? (
       

        <SurveyGenerator></SurveyGenerator>
        
       
        ): (<p>Survey is not ready</p>)}
       
        {isSurveyCompleted && (
          <>
            <p>Result JSON:</p>
            <code style={{ whiteSpace: 'pre' }}>
              {surveyResults}
            </code>
          </>
          
          )
        }
      
      
      </>
    
    );
  
}

export default App;
