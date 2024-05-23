import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/inspection_form_model.dart';
import 'package:ecsd_mobile/model/project_model.dart';

class InspectionTemplateModel {
  String id;
  String type;
  dynamic items;
  String status;
  String name;
  ProjectModel project;

  InspectionTemplateModel({
    required this.id,
    required this.type,
    required this.status,
    required this.name,
    required this.items,
    required this.project,
  });

  static create() {
    return InspectionTemplateModel(
      id: "",
      type: "",
      status: "",
      name: "",
      items: {},
      project: ProjectModel.create(),
    );
  }

  factory InspectionTemplateModel.fromJson(Map<String, dynamic> json) =>
      InspectionTemplateModel(
          id: json["id"],
          type: json["attributes"]["type"],
          status: json['attributes']["status"],
          name: json['attributes']["name"],
          items: json['attributes']["items"],
          project:
              ProjectModel.create() // ProjectModel.fromJson(json["project"]),
          );

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "type": type,
      "status": status,
      "name": name,
      "items": items,
      "project": project.toJson(),
    };
  }
}
