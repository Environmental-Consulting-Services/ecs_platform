import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class HelperService {
  static String host = dotenv.get('apihost');
  static int port = int.parse(dotenv.get('apiport'));
  static String scheme = dotenv.get('apischeme');
  static String apiPath = dotenv.get('apipath');
  //static const String apiPath = "/";

  static Uri buildUri(String path) {
    var uri = Uri(
      scheme: scheme,
      host: host,
      port: port,
      path: apiPath + path,
    );
    debugPrint(uri.toString());
    return uri;
  }

  static Map<String, String> buildHeaders({String? accessToken}) {
    Map<String, String> headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    if (accessToken != null) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    return headers;
  }

  static Map<String, String> buildHeadersForUpload({String? accessToken}) {
    Map<String, String> headers = {
      "Content-Type": "multipart/form-data",
    };
    if (accessToken != null) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    return headers;
  }
}
