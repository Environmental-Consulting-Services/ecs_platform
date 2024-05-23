import 'dart:convert';
import 'package:http/http.dart' as http;
import 'authentication_service_helper.dart';

class AuthenticationService {
  static const String loginPath = 'login/';
  static const String registerPath = 'register/';
  static const String refreshPath = 'token/refresh/';
  static const String verifyPath = 'token/verify/';

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      HelperService.buildUri(loginPath),
      headers: HelperService.buildHeaders(),
      body: jsonEncode(
        {
          "data": {
            "type": "users",
            "attributes": {
              "email": email,
              "password": password,
            }
          }
        },
      ),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        String access_token = json['access_token'];
        String refresh_token = json['refresh_token'];

        return {
          'access_token': access_token,
          'refresh_token': refresh_token,
        };

      case 400:
      case 300:
      case 500:
      default:
        return {"": ""};
    }
  }
}
