import 'dart:convert';

import 'package:jwt_decoder/jwt_decoder.dart';

import '../exceptions/user_exceptions.dart';
import '../services/auth_service.dart';

class User {
  final int id;
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
    if (isValidRefreshToken()) {
      getNewToken();
    } else {}
  }

  factory User.create() {
    final user = User(
      id: 0,
      email: "",
      firstName: "",
      lastName: "",
      cellphone: "",
      accessToken: "",
      refreshToken: "",
    );
    return user;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    final user = User(
      id: (json['userId'] != null) ? json['userId'] : 0,
      email: (json['userEmail'] != null) ? json['userEmail'] : "",
      firstName: (json['userFirstName'] != null) ? json['userFirstName'] : "",
      lastName: (json['userLastName'] != null) ? json['userLastName'] : "",
      cellphone: (json['userCellphone'] != null) ? json['userCellphone'] : "",
      accessToken: (json['access_token'] != null) ? json['access_token'] : "",
      refreshToken:
          (json['refresh_token'] != null) ? json['refresh_token'] : "",
    );
    if (user.isValidRefreshToken()) {
      return user;
    } else {
      throw InvalidUserException();
    }
  }

  String fullName() {
    return firstName + ' ' + lastName;
  }

  bool isValidRefreshToken() {
    if (refreshToken.isEmpty) return false;
    final jwtData = JwtDecoder.decode(refreshToken);
    return jwtData['exp'] < DateTime.now().millisecondsSinceEpoch;
  }

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
  }

  String toJson() {
    return jsonEncode(
      {
        'userId': id,
        'userEmail': email,
        'userCellphone': cellphone,
        'userFirstName': firstName,
        'userLastName': lastName,
        "access_token": accessToken,
        "refresh_token": refreshToken,
      },
    );
  }
}
