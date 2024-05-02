/* import 'dart:convert';
import 'package:http/http.dart' as http;
import '../exceptions/form_exceptions.dart';
import '../model/user_model.dart';
import 'helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';

class AuthService {
  static const String loginPath = 'login/';
  static const String registerPath = 'register/';
  static const String refreshPath = 'token/refresh/';
  static const String verifyPath = 'token/verify/';
  static const String profilePath = 'me/';

  static Future<void> refreshToken(User user) async {
    final response = await http.post(
      HelperService.buildUri(refreshPath),
      headers: HelperService.buildHeaders(),
      body: jsonEncode(
        {
          'refresh_token': user.refreshToken,
        },
      ),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        user.accessToken = json['access_token'];
        User currentUser = await loadUser();
        currentUser.accessToken = user.accessToken;
        saveUser(user);
        break;
      case 400:
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }

  static Future<User> register({
    required String email,
    required String password,
    required String cellphone,
    required String firstName,
    required String lastName,
  }) async {
    final reqUrl = HelperService.buildUri(loginPath);
    final response = await http.post(
      reqUrl,
      headers:
          HelperService.buildHeaders(accessToken: await getUserAccessToken()),
      body: jsonEncode(
        {
          "data": {
            "type": "users",
            "attributes": {
              "first_name": email,
              "last_name": lastName,
              "email": email,
              "password": password,
              "phone": cellphone,
              "role": "",
            }
          }
        },
      ),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        //final json = jsonDecode(response.body);
        //final user = User.fromAPIJson(json);

        //saveUser(user);

        return login(email: email, password: password);
      case 400:
        final json = jsonDecode(response.body);
        throw handleFormErrors(json);
      case 300:
      case 500:
      default:
        throw FormGeneralException(message: 'Error contacting the server!');
    }
  }

  static Future<void> logout() async {
    SecureStorageService.deleteUser();
    SecureStorageService.deleteUserAccessToken();
  }

  static Future<User> login({
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

        final meResponse = await http.get(HelperService.buildUri(profilePath),
            headers: HelperService.buildHeaders(accessToken: access_token));
        final meStatusType = (meResponse.statusCode / 100).floor() * 100;

        switch (meStatusType) {
          case 200:
            String body = meResponse.body;
            final meJson = jsonDecode(body);
            User loggedInUser = User.fromAPIJson(meJson['data']['attributes']);
            loggedInUser.accessToken = access_token;
            loggedInUser.refreshToken = access_token;

            saveUser(loggedInUser);

            break;
          case 400:
            final json = jsonDecode(response.body);
            throw handleFormErrors(json);
          case 300:
          case 500:
          default:
            throw FormGeneralException(message: 'Error contacting the server!');
        }
        return loadUser();
      case 400:
        final json = jsonDecode(response.body);
        throw handleFormErrors(json);
      case 300:
      case 500:
      default:
        throw FormGeneralException(message: 'Error contacting the server!');
    }
  }
}
 */