import 'dart:convert';

import 'package:ecsd_mobile/services/helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import '../model/action_items.dart';

class ActionService {
  static const String requestPath = 'actionitems';

  static Future<ActionItemModel> loadAction(String actionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken['access_token'];

    var uri = HelperService.buildUri(requestPath + '/$actionId');
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        return ActionItemModel.fromJson(json['data']);
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<List<ActionItemModel>> loadProjectActions(
      String projectId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken['access_token'];

    var uri = HelperService.buildUri(requestPath);
    uri = uri.replace(queryParameters: {'filter[project]': projectId});
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<ActionItemModel> actions = [];
        final json = jsonDecode(response.body);
        for (var company in json['data']) {
          actions.add(ActionItemModel.fromJson(company));
        }

        return actions;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<List<ActionItemModel>> loadInspectionActions(
      String inspectionId) {
    return Future.value(
      List.generate(
        10,
        (index) => ActionItemModel.create(),
      ),
    );
  }
}
