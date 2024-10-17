import 'dart:convert';

import 'package:ecsd_mobile/model/notes_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:http/http.dart' as http;
import '../model/action_items.dart';

class ActionService {
  static const String requestPath = 'actionitems/';

  static Future<ActionItemModel> loadAction(String actionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

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

  static Future<bool> createAction(ActionItemModel action) async {
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
          "type": "actionitems",
          "attributes": action.toJson(),
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

  static Future<List<ActionItemModel>> loadInspectionActions(
      String inspectionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath);
    uri = uri.replace(queryParameters: {'filter[inspection]': inspectionId});
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

  static void updateAction(ActionItemModel action) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + action.id);
    //uri = uri.replace(queryParameters: {'filter[owner]': storedUser!['id']});

    final actionMap = <String, dynamic>{};
    final datamap = <String, dynamic>{};
    final attributesmap = <String, dynamic>{};
    actionMap['data'] = datamap;
    datamap['type'] = "actionitems";
    datamap["id"] = action.id;
    datamap['attributes'] = attributesmap;
    attributesmap["id"] = action.id;
    attributesmap["name"] = action.name;
    attributesmap["project"] = action.project;
    attributesmap["inspection"] = action;
    attributesmap["notes"] = "";
    attributesmap["description"] = action.description;
    attributesmap["status"] = action.status;
    attributesmap["source"] = action.source;
    attributesmap["control"] = action.control;
    attributesmap["location"] = action.location;
    attributesmap["assigned_to"] = action.assignedTo;
    attributesmap["date_initiated"] = action.date_initiated;
    attributesmap["date_resolved"] = action.date_resolved;

    var object = {
      "data": {
        "id": action.id,
        "type": "actionitems",
        "attributes": {
          "name": action.name,
          "project": action.project,
          "inspection": action.inspection,
          "notes": action.notes,
          "description": action.description,
          "status": action.status,
          "source": action.source,
          "control": action.control,
          "assigned_to": action.assignedTo,
          "location": action.location,
          "date_initiated": action.date_initiated.toString(),
          "date_resolved": action.date_resolved.toString(),
          "due_date": action.due_date.toString(),
        }
      }
    };

    /*  companyToSave = {   
        data: {
              type: "companies",
              attributes: {
                  
              }
          } */
    //};

    final response = await http.patch(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ),
        body: jsonEncode(object));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        break;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }

  static Future<List<NotesModel>> loadNotes(String actionId) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + '$actionId' + "/notes");
    final response = await http.get(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        final json = jsonDecode(response.body);

        List<NotesModel> notesList = [];

        var jsonData = json['data'];
        jsonData.forEach((element) {
          notesList.add(NotesModel.fromJson(element['attributes']));
        });

        return notesList;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error loading data!');
    }
  }

  static Future<bool> saveNote(String actionItemId, NotesModel note) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    var uri = HelperService.buildUri(requestPath + '$actionItemId' + "/notes");
    final response = await http.post(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ),
        body: jsonEncode(
          {
            "data": {
              "type": "actionitemnotes",
              "attributes": {
                "note": note.note,
              },
            },
          },
        ));

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

  static Future<bool> deleteNote(String actionItemId, NotesModel note) async {
    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    if (note.id == null) {
      throw Exception('Note does not have an id');
    }

    var uri = HelperService.buildUri(
        requestPath + '$actionItemId' + "/notes/" + note.id!);

    final response = await http.delete(uri,
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

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
}
