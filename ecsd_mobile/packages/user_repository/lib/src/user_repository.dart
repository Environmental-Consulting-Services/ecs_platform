import 'dart:async';
import 'dart:convert';

import 'package:user_repository/src/models/models.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import 'package:authentication_repository/src/authentication_service_helper.dart';

class UserRepository {
  User? _user;
  static const String profilePath = 'me/';

  Future<User?> getUser() async {
    if (_user != null) return _user;
    var storedToken = await SecureStorageService.getUserAccessToken();
    var access_token = storedToken['access_token'];

    final meResponse = await http.get(HelperService.buildUri(profilePath),
        headers: HelperService.buildHeaders(accessToken: access_token));
    final meStatusType = (meResponse.statusCode / 100).floor() * 100;

    switch (meStatusType) {
      case 200:
        String body = meResponse.body;
        final meJson = jsonDecode(body);
        var loggedInUser = meJson['data']['attributes'];

        //loggedInUser.access_token = access_token!;
        SecureStorageService.saveUser({"id": loggedInUser['id']});
        return User(loggedInUser['id']);
      case 400:
      case 300:
      case 500:
      default:
    }
  }
}
