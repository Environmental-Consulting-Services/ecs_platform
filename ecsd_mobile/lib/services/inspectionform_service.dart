import '../model/inspection_form_model.dart';
import '../services/helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class InspectionFormService {
  static const String requestPath = 'inspectionforms/';

  static Future<List<InspectionFormModel>> loadInspectionFormss(
      String inspectionFormId) async {
    List<InspectionFormModel> inspections = [InspectionFormModel.create()];

    return inspections;
  }

  static Future<InspectionFormModel> loadInspectionForm(
      String inspectionFormId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + '$inspectionFormId');
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);
        return InspectionFormModel.fromJson(json['data']);
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
