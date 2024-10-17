import 'package:ecsd_mobile/model/action_items.dart';
import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/inspectiontemplate_model.dart';
import 'package:ecsd_mobile/model/living_narrative.dart';
import 'package:ecsd_mobile/model/project_model.dart';

class InspectionModel {
  String id;
  DateTime? scheduled_date;
  String type;
  String status;
  InspectionTemplateModel? template;
  ActionItemModel? actions;
  LivingNarrative? living_narratives;
  String project;
  String company;
  dynamic formdata;
  DateTime? conducted_on;
  DateTime? completed_on;
  DateTime? created_at;
  DateTime? updated_at;

  InspectionModel(
      {required this.id,
      required this.scheduled_date,
      required this.type,
      required this.status,
      required this.template,
      required this.actions,
      required this.living_narratives,
      required this.project,
      required this.company,
      required this.formdata,
      required conducted_on,
      required completed_on,
      required created_at,
      required updated_at}) {}

  factory InspectionModel.create() {
    final inspection = InspectionModel(
        id: "",
        scheduled_date: DateTime.now(),
        type: "",
        status: "",
        template: null,
        actions: null,
        living_narratives: null,
        project: "",
        company: "",
        formdata: {},
        conducted_on: DateTime.now(),
        completed_on: DateTime.now(),
        created_at: DateTime.now(),
        updated_at: DateTime.now());
    return inspection;
  }

  factory InspectionModel.fromJson(Map<String, dynamic> json) {
    return InspectionModel(
        id: json['id'],
        scheduled_date:
            DateTime.tryParse(json['attributes']['scheduled_date'] ?? ""),
        type: "", //json['type'],
        status: json['attributes']['status'],
        template: InspectionTemplateModel
            .create(), //InspectionTemplateModel.fromJson(json['template']),
        actions: ActionItemModel
            .create(), //ActionItemModel.fromJson(json['actions']),
        living_narratives: LivingNarrative
            .create(), //LivingNarrative.fromJson(json['living_narratives']),
        project: json['attributes']
            ['project'], //ProjectModel.fromJson(json['project']),
        company: json['attributes']['company'] == null
            ? ""
            : json['attributes']
                ['company'], //CompanyModel.fromJson(json['company']),
        formdata: json['attributes']['formdata'],
        conducted_on:
            DateTime.tryParse(json['attributes']['conducted_on'] ?? ""),
        completed_on:
            DateTime.tryParse(json['attributes']['completed_on'] ?? ""),
        created_at: DateTime.tryParse(json['attributes']['created_at'] ?? ""),
        updated_at: DateTime.tryParse(json['attributes']['updated_at'] ?? ""));
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "project": project,
      "scheduled_date": scheduled_date?.toIso8601String(),
      "type": "", //json['type'],
      "status": status,
      "template": template,
      "actions": actions,
      "living_narratives": living_narratives,
      "company": company,
      "formdata": formdata,
      "conducted_on": conducted_on?.toIso8601String(),
      "completed_on": completed_on?.toIso8601String(),
      "created_at": created_at?.toIso8601String(),
      "updated_at": updated_at?.toIso8601String(),
    };
  }
}
