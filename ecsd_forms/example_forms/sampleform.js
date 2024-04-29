{
  "pages": [
  {
   "name": "page1",
   "elements": [
    {
     "type": "html",
     "name": "title",
     "html": "<h4>In this survey, we will ask you a couple questions about your impressions of our product.</h4>"
    }
   ]
  },
  {
   "name": "page2",
   "elements": [
    {
     "type": "radiogroup",
     "name": "satisfaction-score",
     "title": "How would you describe your experience with our product?",
     "isRequired": true,
     "choices": [
      {
       "value": 5,
       "text": "Fully satisfying"
      },
      {
       "value": 4,
       "text": "Generally satisfying"
      },
      {
       "value": 3,
       "text": "Neutral"
      },
      {
       "value": 2,
       "text": "Rather unsatisfying"
      },
      {
       "value": 1,
       "text": "Not satisfying at all"
      }
     ]
    }
   ]
  },
  {
   "name": "page3",
   "elements": [
    {
     "type": "comment",
     "name": "what-would-make-you-more-satisfied",
     "visibleIf": "{satisfaction-score} = 4",
     "title": "What can we do to make your experience more satisfying?"
    },
    {
     "type": "rating",
     "name": "nps-score",
     "title": "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
     "rateCount": 11,
     "rateMin": 0,
     "rateMax": 10
    }
   ],
   "visibleIf": "{satisfaction-score} >= 4"
  },
  {
   "name": "page4",
   "elements": [
    {
     "type": "comment",
     "name": "how-can-we-improve",
     "title": "In your opinion, how could we improve our product?"
    }
   ],
   "visibleIf": "{satisfaction-score} = 3"
  },
  {
   "name": "page5",
   "elements": [
    {
     "type": "comment",
     "name": "disappointing-experience",
     "title": "Please let us know why you had such a disappointing experience with our product"
    }
   ],
   "visibleIf": "{satisfaction-score} <= 2"
  }
 ]
}