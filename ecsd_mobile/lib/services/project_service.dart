import 'dart:convert';
import 'package:ecsd_mobile/model/project_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import '../model/user_model.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;

class ProjectService {
  static const String projectPath = 'projects/';

  static Future<ProjectModel> loadProject(projectId) async {
    final json = null;

    /* final json = await SecureStorageService.storage.read(
      key: SecureStorageService.userKey,
    ); */

    if (json != null) {
      return ProjectModel.fromJson(jsonDecode(json));
    } else {
      ProjectModel projectModel = ProjectModel.create();
      projectModel.number = projectId.toString();
      projectModel.name = "Teste Project";
      return projectModel;
      //throw SecureStorageNotFoundException();
    }
  }

  static void saveProject(ProjectModel) async {}

  static Future<List<ProjectModel>> loadProjects(String companyId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken['access_token'];

    var requestPath = projectPath;

    var uri = HelperService.buildUri(requestPath);
    uri = uri.replace(queryParameters: {'filter[owner]': storedUser!['id']});
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<ProjectModel> companies = [];
        final json = jsonDecode(response.body);
        for (var company in json['data']) {
          companies.add(ProjectModel.fromJson(company));
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
/* 
    final response = await http.post(
      HelperService.buildUri(loginPath),
      headers: HelperService.buildHeaders(),
      /* body: jsonEncode(
        {
          "data": {
            "type": "users",
            "attributes": {
              "email": email,
              "password": password,
            }
          }
        },
      ), */
    );
 */

/* 
    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        //final json = jsonDecode(response.body);
        //final user = User.fromJson(json);

        //saveUser(user);
        final List<ProjectModel> projects = [ProjectModel.create()];

        return projects;
      case 400:
        final json = jsonDecode(response.body);
        throw handleFormErrors(json);
      case 300:
      case 500:
      default:
        throw FormGeneralException(message: 'Error contacting the server!');
    } */
  }
}
