import 'package:ecsd_mobile/model/inspection_form_model.dart';
import 'package:ecsd_mobile/model/inspection_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class InspectionService {
  static const String requestPath = 'inspections/';

  static Future<List<InspectionModel>> loadInspections(String projectId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath);
    uri = uri.replace(queryParameters: {'filter[project]': projectId});
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<InspectionModel> inspections = [];
        final json = jsonDecode(response.body);
        for (var inspection in json['data']) {
          inspections.add(InspectionModel.fromJson(inspection));
        }

        return inspections;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<InspectionModel> loadInspection(String inspectionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + '/$inspectionId');
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        return InspectionModel.fromJson(json['data']);
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<bool> createInspection(InspectionModel inspection) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath);
    final response = await http.post(
      uri,
      headers: HelperService.buildHeaders(
        accessToken: accessToken,
      ),
      body: jsonEncode({
        "data": {
          "type": "inspections",
          "attributes": inspection.toJson(),
        },
      }),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        return true;

      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<String> updateInspection(InspectionModel inspectionData) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + inspectionData.id);

    final inspectionDataToSend = {
      "data": {
        "type": "inspections",
        "id": inspectionData.id,
        "attributes": {
          "status": inspectionData.status,
          "formdata": inspectionData.formdata,
        },
      },
    };

    final response = await http.patch(
      uri,
      headers: HelperService.buildHeaders(
        accessToken: accessToken,
      ),
      body: jsonEncode(inspectionDataToSend),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        //final json = jsonDecode(response.body);
        return '{"status": "success" }';
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }
}
