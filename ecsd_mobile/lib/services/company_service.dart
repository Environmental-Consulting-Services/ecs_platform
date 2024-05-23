import 'dart:convert';
import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import '../model/user_model.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'dart:convert';
import 'package:ecsd_mobile/model/message_model.dart';
import 'chat_helper_service.dart';
import 'package:http/http.dart' as http;

class CompanyService {
  static const String companyPath = 'companies/';

  static Future<CompanyModel> loadCompany(companyId) async {
    final json = null;

    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final response = await http.get(
        HelperService.buildUri(companyPath + companyId.toString()),
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        return CompanyModel.fromJson(jsonDecode(response.body));
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }

  static void saveCompany(User user) async {
    await SecureStorageService.storage.write(
      key: SecureStorageService.userKey,
      value: user.toJson(),
    );
  }

  static Future<List<CompanyModel>> loadCompanies() async {
    //final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final response = await http.get(HelperService.buildUri(companyPath),
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<CompanyModel> companies = [];
        final json = jsonDecode(response.body);
        for (var company in json['data']) {
          companies.add(CompanyModel.fromJson(company));
        }

        return companies;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }
}
