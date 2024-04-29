import 'dart:convert';
import 'package:flutter/gestures.dart';
import 'package:flutter/foundation.dart';
import 'package:ecsd_mobile/services/inspectionform_service.dart';
import 'package:flutter/material.dart';
import '../model/inspection_form_model.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

//widgets

class InspectionFormWidget extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String inspectionId;

  const InspectionFormWidget({Key? key, this.inspectionId = ""})
      : super(key: key);

  @override
  State<InspectionFormWidget> createState() => _InspectionFormWidgetState();
}

// homepage state
class _InspectionFormWidgetState extends State<InspectionFormWidget> {
  // variable to call and store future list of posts
  //String inspectionformId = "0";

  late Future<InspectionFormModel> inspectionformFuture;
  late final WebViewController _controller;
  late String surveyJson = '';

  // = getInspectionForm();

  // function to fetch data from api and return future list of posts
  Future<InspectionFormModel> getInspectionForm(String inspectionId) async {
    Future<InspectionFormModel> inspectionform =
        InspectionFormService.loadInspectionForm(inspectionId);
    return inspectionform;
  }

  void _handleFormMessage(JavaScriptMessage message) {
    print('Received message from form: ${message.message}');
  }

  String surveyCommand = '''
setJsonSurvey(
 {
 "title": "COVID-19 Screening Form",
 "description": "All fields with an asterisk (*) are required fields and must be filled out in order to process the information in strict confidentiality.",
 "logo": "https://api.surveyjs.io/private/Surveys/files?name=fe375fa6-4c8c-40ab-a9c7-51a97b7ad500",
 "logoFit": "cover",
 "logoPosition": "right",
 "pages": [
  {
   "name": "patient-info",
   "elements": [
    {
     "type": "panel",
     "name": "full-name",
     "elements": [
      {
       "type": "text",
       "name": "first-name",
       "title": "First name",
       "isRequired": true,
       "maxLength": 25
      },
      {
       "type": "text",
       "name": "last-name",
       "startWithNewLine": false,
       "title": "Last name",
       "isRequired": true,
       "maxLength": 25
      }
     ],
     "title": "Full name"
    },
    {
     "type": "panel",
     "name": "personal-info",
     "elements": [
      {
       "type": "text",
       "name": "ssn",
       "title": "Social Security number",
       "isRequired": true,
       "validators": [
        {
         "type": "regex",
         "text": "Your SSN must be a 9-digit number",
         "regex": "^\\d{9}\$"
        }
       ],
       "maxLength": 9
      },
      {
       "type": "text",
       "name": "birthdate",
       "startWithNewLine": false,
       "title": "Date of Birth",
       "isRequired": true,
       "inputType": "date"
      }
     ]
    }
   ],
   "title": "Patient Information"
  },
  {
   "name": "symptoms-and-contacts",
   "elements": [
    {
     "type": "checkbox",
     "name": "symptoms",
     "title": "Have you experienced any of the following symptoms of COVID-19 within the last 48 hours?",
     "isRequired": true,
     "choices": [
      "Fever or chills",
      "New and persistent cough",
      "Shortness of breath or difficulty breathing",
      "Fatigue",
      "Muscle or body aches",
      "New loss of taste or smell",
      "Sore throat"
     ],
     "showNoneItem": true,
     "noneText": "No symptoms"
    },
    {
     "type": "boolean",
     "name": "contacted-person-with-symptoms",
     "title": "Have you been in contact with anyone in the last 14 days who is experiencing these symptoms?"
    },
    {
     "type": "radiogroup",
     "name": "contacted-covid-positive",
     "title": "Have you been in contact with anyone who has since tested positive for COVID-19?",
     "choices": [
      "Yes",
      "No",
      "Not sure"
     ]
    },
    {
     "type": "boolean",
     "name": "travelled",
     "title": "Have you travelled abroad in the last 14 days?"
    },
    {
     "type": "text",
     "name": "travel-destination",
     "visibleIf": "travelled = true",
     "title": "Where did you go?"
    },
    {
     "type": "boolean",
     "name": "tested-covid-positive",
     "title": "Have you tested positive for COVID-19 in the past 10 days?"
    },
    {
     "type": "boolean",
     "name": "awaiting-covid-test",
     "title": "Are you currently awaiting results from a COVID-19 test?"
    },
    {
     "type": "paneldynamic",
     "name": "emergency-contacts",
     "visibleIf": "(({tested-covid-positive} = true or {contacted-covid-positive} = 'Yes') or ({symptoms} notempty and {symptoms} notcontains 'none'))",
     "title": "Emergency Contacts",
     "description": "If possible, it's best to specify at least TWO emergency contacts.",
     "isRequired": true,
     "templateElements": [
      {
       "type": "text",
       "name": "emergency-first-name",
       "title": "First name"
      },
      {
       "type": "text",
       "name": "emergency-last-name",
       "startWithNewLine": false,
       "title": "Last name"
      },
      {
       "type": "text",
       "name": "emergency-relationship",
       "title": "Relationship"
      },
      {
       "type": "text",
       "name": "emergency-phone",
       "startWithNewLine": false,
       "title": "Phone number",
       "inputType": "tel"
      }
     ],
     "panelsState": "firstExpanded",
     "confirmDelete": true,
     "panelAddText": "Add a new contact person"
    },
    {
     "type": "comment",
     "name": "additional-info",
     "title": "Additional information"
    },
    {
     "type": "text",
     "name": "date",
     "title": "Date",
     "inputType": "date"
    },
    {
     "type": "signaturepad",
     "name": "signature",
     "startWithNewLine": false,
     "title": "Signature"
    }
   ],
   "title": "Current Symptoms"
  }
 ],
 "showQuestionNumbers": "off",
 "questionErrorLocation": "bottom",
 "completeText": "Submit",
 "questionsOnPageMode": "singlePage",
 "showPreviewBeforeComplete": "showAnsweredQuestions",
 "widthMode": "static",
 "width": "1000px"
});
''';

  String _decodeForm() {
    /* JsonEncoder encoder = JsonEncoder();
    surveyJson = encoder.convert(
     */

    String surveyJson = jsonEncode('''
{
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
}
''');
    return surveyJson;
  }

  @override
  void initState() {
    inspectionformFuture = getInspectionForm(widget.inspectionId);

    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    //  ..loadFlutterAsset("assets/forms/index.html")

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);
    // #enddocregion platform_features

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Color.fromARGB(0, 255, 255, 255))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            debugPrint('Form View is loading (progress : $progress%)');
          },
          onPageStarted: (String url) {
            debugPrint('Page started loading: $url');
          },
          onPageFinished: (String url) {
            debugPrint('Page finished loading: $url');
            _controller.runJavaScript(surveyCommand);
            _controller.runJavaScript("surveyIsReady(true);");
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('''
              Page resource error:
                code: ${error.errorCode}
                description: ${error.description}
                errorType: ${error.errorType}
                isForMainFrame: ${error.isForMainFrame}
          ''');
          },
          onNavigationRequest: (NavigationRequest request) {
            debugPrint('allowing navigation to ${request.url}');
            return NavigationDecision.navigate;
          },
          onUrlChange: (UrlChange change) {
            debugPrint('url change to ${change.url}');
          },

          /* onHttpAuthRequest: (HttpAuthRequest request) {
            openDialog(request);
          }, */
        ),
      )
      ..addJavaScriptChannel(
        'messageHandler',
        onMessageReceived: (JavaScriptMessage message) {
          _handleFormMessage(message);
        },
      )
      ..loadFlutterAsset("assets/forms/index.html");

    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }
    _controller = controller;

    super.initState();
  }

  double _left = 0;
  double _top = 0;

  @override
  Widget build(BuildContext context) {
    // variable to call and store future inspectionform
    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height,
      padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [buildWebView()],
          ),
        ],
      ),
    );
  }

  Widget buildWebView() {
    return Container(
        width: MediaQuery.of(context).size.width - 48,
        height: MediaQuery.of(context).size.height - 250,
        child: WebViewWidget(
          controller: _controller,
          gestureRecognizers: {Factory(() => EagerGestureRecognizer())},
        ));
  }
}
