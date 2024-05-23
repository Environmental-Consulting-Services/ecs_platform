import 'project_model.dart';
import 'company_model.dart';

class InspectionFormModel {
  String id;
  DateTime scheduled_date;
  String type;
  String status;
  List<Object> items;
  ProjectModel project;
  CompanyModel company;

  InspectionFormModel({
    required this.id,
    required this.scheduled_date,
    required this.type,
    required this.status,
    required this.items,
    required this.project,
    required this.company,
  });

  static create() {
    return InspectionFormModel(
      id: "",
      scheduled_date: DateTime.now(),
      type: "",
      status: "",
      items: [],
      project: ProjectModel.create(),
      company: CompanyModel.create(),
    );
  }

  factory InspectionFormModel.fromJson(Map<String, dynamic> json) =>
      InspectionFormModel(
        id: json["id"],
        scheduled_date: DateTime.parse(json["scheduled_date"]),
        type: json["type"],
        status: json["status"],
        items: json["items"],
        project: ProjectModel.fromJson(json["project"]),
        company: CompanyModel.fromJson(json["company"]),
      );

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "scheduled_date": scheduled_date.toIso8601String(),
      "type": type,
      "status": status,
      "items": items,
      "project": project.toJson(),
      "company": company.toJson(),
    };
  }
}
