import 'dart:convert';

import 'package:jwt_decoder/jwt_decoder.dart';

import '../exceptions/user_exceptions.dart';
import '../services/auth_service.dart';

class User {
  final String id;
  String email;
  String firstName;
  String lastName;
  String cellphone;
  String accessToken;
  String refreshToken;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.cellphone,
    required this.accessToken,
    required this.refreshToken,
  }) {
    /* if (isValidRefreshToken()) {
      getNewToken();
    } else {} */
  }

  factory User.create() {
    final user = User(
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      cellphone: "",
      accessToken: "",
      refreshToken: "",
    );
    return user;
  }

  String fullName() {
    return firstName + ' ' + lastName;
  }

  bool isValidRefreshToken() {
    if (refreshToken.isEmpty) return false;
    final jwtData = JwtDecoder.decode(refreshToken);
    return jwtData['exp'] < DateTime.now().millisecondsSinceEpoch;
  }
/* 
  void getNewToken() async {
    final jwtData = JwtDecoder.decode(accessToken);
    await Future.delayed(
      Duration(
        milliseconds:
            jwtData['exp'] * 1000 - DateTime.now().millisecondsSinceEpoch,
      ),
      () async {
        try {
          await AuthService.refreshToken(this);
        } catch (e) {}
      },
    );
    //getNewToken();
  } */

  String toJson() {
    return jsonEncode(
      {
        'id': id,
        'email': email,
        'cellphone': cellphone,
        'firstName': firstName,
        'lastName': lastName,
        "accessToken": accessToken,
        "refreshToken": refreshToken,
      },
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    final user = User(
      id: (json['id'] != null) ? json['id'] : 0,
      email: (json['email'] != null) ? json['email'] : "",
      firstName: (json['firstName'] != null) ? json['firstName'] : "",
      lastName: (json['lastName'] != null) ? json['lastName'] : "",
      cellphone: (json['cellphone'] != null) ? json['cellphone'] : "",
      accessToken: (json['accessToken'] != null) ? json['accessToken'] : "",
      refreshToken: (json['refreshToken'] != null) ? json['refreshToken'] : "",
    );
    return user;
  }

  factory User.fromAPIJson(Map<String, dynamic> json) {
    final user = User(
      id: (json['id'] != null) ? json['id'] : "",
      email: (json['email'] != null) ? json['email'] : "",
      firstName: (json['first_name'] != null) ? json['first_name'] : "",
      lastName: (json['last_name'] != null) ? json['last_name'] : "",
      cellphone: (json['phone'] != null) ? json['phone'] : "",
      accessToken: (json['access_token'] != null) ? json['access_token'] : "",
      refreshToken:
          (json['refresh_token'] != null) ? json['refresh_token'] : "",
    );
    return user;
  }
}
