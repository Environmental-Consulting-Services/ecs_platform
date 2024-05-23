import 'dart:convert';
import 'package:ecsd_mobile/model/person_model.dart';
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
    var accessToken = storedToken;

    var requestPath = projectPath;

    var uri = HelperService.buildUri(requestPath);
    uri = uri.replace(queryParameters: {'filter[owner]': storedUser!['id']});

    if (companyId.isNotEmpty) {
      uri = uri.replace(queryParameters: {'filter[company]': companyId});
    }
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<ProjectModel> projects = [];
        final json = jsonDecode(response.body);
        for (var project in json['data']) {
          projects.add(ProjectModel.fromJson(project));
        }

        return projects;
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

  static Future<List<Person>> loadAssigneesForProject(String projectId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(projectPath + projectId + "/people/");
    uri = uri.replace(queryParameters: {
      'filter[project]': projectId,
      'fields[projects]': 'people'
    });

    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final List<Person> assignees = [];
        final json = jsonDecode(response.body);
        var peopleData = json["data"];
        peopleData.forEach((person) {
          assignees.add(Person.fromJson(person["attributes"]));
        });

        return assignees;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }

    /*    List<Person> people = [
      Person.create(),
      Person.create(),
    ]; */
  }

  static Future<String> getSiteMapIdForProject(String projectId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(projectPath + projectId);
    uri = uri.replace(queryParameters: {
      'filter[project]': projectId,
      'fields[projects]': 'site_maps'
    });

    try {
      final response = await http.get(uri,
          headers: HelperService.buildHeaders(
            accessToken: accessToken,
          ));

      final statusType = (response.statusCode / 100).floor() * 100;
      switch (statusType) {
        case 200:
          String siteMapId = "";
          final json = jsonDecode(response.body);
          if (json["data"]["attributes"]["site_maps"] != null) {
            if (json["data"]["attributes"]["site_maps"][0] != null) {
              siteMapId =
                  json["data"]["attributes"]["site_maps"][0]["site_map"];
            }
          }
          return siteMapId;
        case 400:
          final json = jsonDecode(response.body);
          throw Exception(json);
        case 300:
        case 500:
        default:
          throw Exception('Error contacting the server!');
      }
    } catch (e) {
      return "";
    }
    /*    List<Person> people = [
      Person.create(),
      Person.create(),
    ]; */
  }

  static Future<String> setSiteMapIdForProject(
      String projectId, String siteMapId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(projectPath + projectId + "/sitemaps");
    /* uri = uri.replace(queryParameters: {
      'filter[project]': projectId,
      'fields[projects]': 'site_maps'
    }); */

    final projectData = {
      "data": {
        "type": "project",
        "id": projectId,
        "attributes": {
          "site_maps": [
            {"site_map": siteMapId}
          ],
        },
      },
    };

    final response = await http.patch(
      uri,
      headers: HelperService.buildHeaders(
        accessToken: accessToken,
      ),
      body: jsonEncode(projectData),
    );

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        return '{"status": "success" }';
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }

    /*    List<Person> people = [
      Person.create(),
      Person.create(),
    ]; */
  }
}
