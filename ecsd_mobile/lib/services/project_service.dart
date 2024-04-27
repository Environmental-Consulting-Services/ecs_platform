import 'dart:convert';
import 'package:ecsd_mobile/model/project_model.dart';
import '../model/user_model.dart';
import 'secure_storage_service.dart';

class ProjectService {
  static const String loginPath = 'login/';
  static const String registerPath = 'register/';
  static const String refreshPath = 'token/refresh/';
  static const String verifyPath = 'token/verify/';

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

  static void saveProject(User user) async {
    await SecureStorageService.storage.write(
      key: SecureStorageService.userKey,
      value: user.toJson(),
    );
  }

  static Future<List<ProjectModel>> loadProjects(String companyId) async {
    //test
    List<ProjectModel> projects = [];
    for (int i = 0; i < 10; i++) {
      final project = ProjectModel.create();
      project.number = (i * 13).toString();
      project.name = "Project Name $i";
      projects.add(project);
    }
    return projects;
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
