import 'dart:convert';
import 'package:ecsd_mobile/model/inspection_model.dart';
import 'package:ecsd_mobile/model/inspectiontemplate_model.dart';
import 'package:ecsd_mobile/services/inspection_service.dart';
import 'package:ecsd_mobile/services/inspectiontemplate_service.dart';
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
  late Future<InspectionModel> inspectionFuture;
  late Future<InspectionTemplateModel> inspectionformTemplateFuture;

  late final WebViewController _controller;
  late String surveyJson = '''
  {
 "pages": [
  {
   "name": "page1",
   "elements": [
    {
     "type": "text",
     "name": "question"
    }
   ]
  }
 ]
}
''';

  String surveyCommand = '''
setJsonSurvey(
 {
 "title": "",
 "description": "",
 "pages": [
  {
   "name": "page1",
   "elements": [
    {
     "type": "text",
     "name": "question"
    }
   ]
  }
 ]
});
''';

  String surveyDataCommand = '''
loadPreviousData({"weather":["clear"]});
''';

  // function to fetch data from api and return future list of posts
  Future<InspectionTemplateModel> getInspectionTemplate(
      String inspectionId) async {
    Future<InspectionTemplateModel> inspectionTemplate =
        InspectionTemplateService.loadInspectionTemplateForInspection(
            inspectionId);
    return inspectionTemplate;
  }

  // function to fetch data from api and return future list of posts
  Future<InspectionModel> getInspection(String inspectionId) async {
    Future<InspectionModel> inspection =
        InspectionService.loadInspection(inspectionId);
    return inspection;
  }

  void _handleFormUpdateMessage(
      BuildContext context, JavaScriptMessage message) {
    // get form data
    print(message.message);
    try {
      InspectionModel inspection = InspectionModel.create();

      inspection.formdata = jsonDecode(message.message);
      inspection.id = widget.inspectionId;
      inspection.status = "started";

      saveFormInputsToInspection(context, inspection);

      //save messatge
    } catch (e) {
      print('Error: ${e}');
    }
  }

  void _handleFormCompleteMessage(
      BuildContext context, JavaScriptMessage message) {
    // get form data
    print(message.message);
    try {
      InspectionModel inspection = InspectionModel.create();

      inspection.id = widget.inspectionId;
      inspection.formdata = jsonDecode(message.message);
      inspection.status = "conducted";

      saveFormInputsToInspection(context, inspection);

      //save messatge
    } catch (e) {
      print('Error: ${e}');
    }
  }

  Future<bool> saveFormInputsToInspection(
      BuildContext context, InspectionModel inspection) async {
    /* 
    ObservableMap? _state =
        context.findAncestorWidgetOfExactType<AppState>()?.state;
    String projectId;

    if (_state != null) {
      projectId = _state?['projectId'];
    } else {
      projectId = "";
    }
 */

    InspectionService.updateInspection(inspection);

    return true;
  }

  @override
  void initState() {
    inspectionformTemplateFuture =
        getInspectionTemplate(widget.inspectionId).then((value) {
      //debugPrint('form json: ${value.items[0].toString()}');

      surveyCommand = "setJsonSurvey(" + jsonEncode(value.items[0]) + ");";
      //_controller.runJavaScript(surveyCommand);
      //_controller.runJavaScript("surveyIsReady(true);");

      return value;
    });

    inspectionFuture = getInspection(widget.inspectionId).then((value) {
      surveyDataCommand =
          "loadPreviousData(" + jsonEncode(value.formdata) + ");";
      //_controller.runJavaScript(surveyCommand);
      //_controller.runJavaScript("surveyIsReady(true);");

      late final PlatformWebViewControllerCreationParams params;
      if (WebViewPlatform.instance is WebKitWebViewPlatform) {
        params = WebKitWebViewControllerCreationParams(
          allowsInlineMediaPlayback: true,
          mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
        );
      } else {
        params = const PlatformWebViewControllerCreationParams();
      }

      final WebViewController controller =
          WebViewController.fromPlatformCreationParams(params);

      controller
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(Color.fromARGB(0, 255, 255, 255))
        ..setNavigationDelegate(
          NavigationDelegate(
            onProgress: (int progress) {
              //debugPrint('Form View is loading (progress : $progress%)');
            },
            onPageStarted: (String url) {
              //debugPrint('Page started loading: $url');
            },
            onPageFinished: (String url) {
              //debugPrint('Page finished loading: $url');
              _controller.runJavaScript(getSurveyCommand() /* surveyCommand */);
              _controller.runJavaScript(
                  getSurveyDataCommand() /* surveyDataCommand */);
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
              //debugPrint('allowing navigation to ${request.url}');
              return NavigationDecision.navigate;
            },
            onUrlChange: (UrlChange change) {
              //debugPrint('url change to ${change.url}');
            },

            /* onHttpAuthRequest: (HttpAuthRequest request) {
            openDialog(request);
          }, */
          ),
        )
        ..addJavaScriptChannel(
          'formUpdateHandler',
          onMessageReceived: (JavaScriptMessage message) {
            _handleFormUpdateMessage(context, message);
          },
        )
        ..addJavaScriptChannel(
          'formCompleteHandler',
          onMessageReceived: (JavaScriptMessage message) {
            _handleFormCompleteMessage(context, message);
          },
        )
        ..loadFlutterAsset("assets/forms/index.html");

      if (controller.platform is AndroidWebViewController) {
        AndroidWebViewController.enableDebugging(true);
        (controller.platform as AndroidWebViewController)
            .setMediaPlaybackRequiresUserGesture(false);
      }
      _controller = controller;

      return value;
    });

    super.initState();
  }

  double _left = 0;
  double _top = 0;

  String getSurveyCommand() {
    return surveyCommand;
  }

  String getSurveyDataCommand() {
    return surveyDataCommand;
  }

  WebViewController getWebView() {
    return _controller;
  }

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
            children: [buildWebView(context)],
          ),
        ],
      ),
    );
  }

  Widget buildWebView(BuildContext context) {
    return FutureBuilder(
      future: Future.wait([
        inspectionFuture, //Future that returns bool
        inspectionformTemplateFuture, //Future that returns bool
      ]),
      builder: (
        context,
        AsyncSnapshot<List<dynamic>> snapshot,
      ) {
        if (snapshot.hasData) {
          return Container(
              width: MediaQuery.of(context).size.width - 48,
              height: MediaQuery.of(context).size.height - 250,
              child: WebViewWidget(
                controller: getWebView(),
                gestureRecognizers: {Factory(() => EagerGestureRecognizer())},
              ));
        } else {
          return CircularProgressIndicator();
        }
      },
    );
  }
}
