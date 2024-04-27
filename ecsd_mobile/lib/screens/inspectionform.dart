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

  const InspectionFormWidget({Key? key, this.inspectionId = "22"})
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

  // = getInspectionForm();

  // function to fetch data from api and return future list of posts
  Future<InspectionFormModel> getInspectionForm(String inspectionId) async {
    Future<InspectionFormModel> inspectionform =
        InspectionFormService.loadInspectionForm(inspectionId);
    return inspectionform;
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
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message.message)),
          );
        },
      )
      // ..loadRequest(Uri.parse('http://192.168.0.133:3000'));
      ..loadFlutterAsset("assets/forms/index.html");
    // #docregion platform_features
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }
    // #enddocregion platform_features

    _controller = controller;

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future inspectionform
    return Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height,
        padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
        child: SingleChildScrollView(
          child: Column(
            children: [
              /* Padding(
                  padding: const EdgeInsets.only(top: 10.0), child: SizedBox()),
               */
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [buildWebView()],
              )
            ],
          ),
        ));
  }

  Widget buildWebView() {
    return Container(
        width: MediaQuery.of(context).size.width - 48,
        height: MediaQuery.of(context).size.height,
        child: WebViewWidget(
          controller: _controller,
        ));
  }
}
