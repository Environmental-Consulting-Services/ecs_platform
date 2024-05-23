import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const storage = FlutterSecureStorage();
  static const String userKey = 'user';
  static const String tokenKey = 'auth_token';

  static Future<Map<String, dynamic>?> getUser() async {
    final storedUser = await storage.read(key: userKey);
    return storedUser == null ? null : jsonDecode(storedUser);
  }

  static Future<String> getUserAccessToken() async {
    final token = await SecureStorageService.storage.read(
      key: SecureStorageService.tokenKey,
    );
    if (token == null) {
      return "";
    }
    return token;
  }

  static void saveUser(Map<String, String> user) async {
    await SecureStorageService.storage.write(
      key: SecureStorageService.userKey,
      value: jsonEncode(user),
    );
  }

  static void saveUserAccessToken(String token) async {
    await SecureStorageService.storage.write(
      key: SecureStorageService.tokenKey,
      value: token,
    );
  }

  static void deleteUser() async {
    await SecureStorageService.storage
        .delete(key: SecureStorageService.userKey);
  }

  static void deleteUserAccessToken() async {
    await SecureStorageService.storage
        .delete(key: SecureStorageService.tokenKey);
  }
}
