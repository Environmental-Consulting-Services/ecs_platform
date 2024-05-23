import 'package:flutter/foundation.dart';

class HelperService {
  static const String host = "app.ecscompliance.com";
  static const int port = 443;
  static const String scheme = "https";
  static const String apiPath = "/api/";
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
}
