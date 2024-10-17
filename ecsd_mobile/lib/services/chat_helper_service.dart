import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ChatHelperService {
  static String chat_host = dotenv.get('chathost');
  static int chat_port = int.parse(dotenv.get('chatport'));
  static String chat_scheme = dotenv.get('chatscheme');
  static String chatPath = dotenv.get('chatpath');
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
