import 'dart:convert';
import 'package:ecsd_mobile/model/message_model.dart';
import 'chat_helper_service.dart';
import 'package:http/http.dart' as http;

import 'package:authentication_repository/src/secure_storage_service.dart';

class MessageService {
  static const String messagePath = 'messages/';

  static Future<MessageModel> loadMessage(messageId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    try {
      final response = await http.get(
        ChatHelperService.buildUri(messagePath + messageId),
        headers: ChatHelperService.buildHeaders(
          accessToken: accessToken,
        ),
      );

      final statusType = (response.statusCode / 100).floor() * 100;
      switch (statusType) {
        case 200:
          return MessageModel.fromJson(jsonDecode(response.body));
        case 400:
          final json = jsonDecode(response.body);
          throw Exception(json);
        case 300:
        case 500:
        default:
          throw Exception('Error contacting the server!');
      }
    } catch (e) {
      throw Exception('Error contacting the server!');
    }
  }

  static void saveMessage(MessageModel message) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final response = await http.post(
      ChatHelperService.buildUri(messagePath + message.id),
      headers: ChatHelperService.buildHeaders(
        accessToken: accessToken,
      ),
      body: jsonEncode(
        {
          "data": {
            "type": "messages",
            "attributes": {
              "id": message.id,
              "to": message.to,
              "from": message.from,
              "message": message.message,
              "delivered": message.delivered,
              "read": message.read,
            }
          }
        },
      ),
    );
  }

  static Future<List<MessageModel>> loadMessages() async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    try {
      final response = await http.get(ChatHelperService.buildUri(messagePath),
          headers: ChatHelperService.buildHeaders(
            accessToken: accessToken,
          ));

      final statusType = (response.statusCode / 100).floor() * 100;
      switch (statusType) {
        case 200:
          final List<MessageModel> messages = [];
          final json = jsonDecode(response.body);
          for (var message in json['data']) {
            messages.add(MessageModel.fromJson(message));
          }

          return messages;
        case 400:
          final json = jsonDecode(response.body);
          throw Exception(json);
        case 300:
        case 500:
        default:
          throw Exception('Error contacting the server!');
      }
    } catch (e) {
      throw Exception('Error contacting the server!');
    }
  }
}
