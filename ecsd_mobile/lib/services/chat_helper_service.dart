import 'package:flutter/foundation.dart';

class ChatHelperService {
  static const String chat_host = "app.ecscompliance.com";
  static const int chat_port = 443;
  static const String chat_scheme = "https";
  static const String chatPath = "/expert/";
  //static const String chatPath = "/";

  static Uri buildUri(String path) {
    var uri = Uri(
      scheme: chat_scheme,
      host: chat_host,
      port: chat_port,
      path: chatPath + path,
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
