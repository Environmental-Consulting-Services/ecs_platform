import 'package:ecsd_mobile/model/inspection_form_model.dart';
import 'package:ecsd_mobile/model/inspection_model.dart';
import 'package:ecsd_mobile/model/inspectiontemplate_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class InspectionTemplateService {
  static const String requestPath = 'inspectiontemplates/';

  static Future<List<InspectionTemplateModel>> loadInspectionTemplates(
      String projectId) async {
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
        final List<InspectionTemplateModel> inspectionTemplates = [];
        final json = jsonDecode(response.body);
        for (var inspectionTemplate in json['data']) {
          inspectionTemplates
              .add(InspectionTemplateModel.fromJson(inspectionTemplate));
        }

        return inspectionTemplates;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<InspectionTemplateModel> loadInspectionTemplateForInspection(
      String inspectionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    String inspectionrequestPath = 'inspections/';

    var uri = HelperService.buildUri(
        inspectionrequestPath + '$inspectionId/inspectiontemplate');
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        return InspectionTemplateModel.fromJson(json['data']);
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
