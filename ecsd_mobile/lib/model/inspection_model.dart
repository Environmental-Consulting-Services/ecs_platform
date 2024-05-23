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
  ProjectModel? project;
  CompanyModel? company;
  dynamic formdata;
  DateTime? conducted_on;
  DateTime? completed_on;

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
        scheduled_date: null,
        type: "",
        status: "",
        template: null,
        actions: null,
        living_narratives: null,
        project: null,
        company: null,
        formdata: {},
        conducted_on: null,
        completed_on: null,
        created_at: null,
        updated_at: null);
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
        project:
            ProjectModel.create(), //ProjectModel.fromJson(json['project']),
        company:
            CompanyModel.create(), //CompanyModel.fromJson(json['company']),
        formdata: json['attributes']['formdata'],
        conducted_on:
            DateTime.tryParse(json['attributes']['conducted_on'] ?? ""),
        completed_on:
            DateTime.tryParse(json['attributes']['completed_on'] ?? ""),
        created_at: DateTime.tryParse(json['attributes']['created_at'] ?? ""),
        updated_at: DateTime.tryParse(json['attributes']['updated_at'] ?? ""));
  }
}
