import 'package:ecsd_mobile/model/action_items.dart';
import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/inspection_template.dart';
import 'package:ecsd_mobile/model/living_narrative.dart';
import 'package:ecsd_mobile/model/project_model.dart';

class InspectionModel {
  String id;
  DateTime scheduled_date;
  String type;
  String status;
  InspectionTemplateModel template;
  ActionItemModel actions;
  LivingNarrative living_narratives;
  ProjectModel project;
  CompanyModel company;

  InspectionModel({
    required this.id,
    required this.scheduled_date,
    required this.type,
    required this.status,
    required this.template,
    required this.actions,
    required this.living_narratives,
    required this.project,
    required this.company,
  }) {}

  factory InspectionModel.create() {
    final inspection = InspectionModel(
      id: "",
      scheduled_date: DateTime.now(),
      type: "",
      status: "",
      template: InspectionTemplateModel.create(),
      actions: ActionItemModel.create(),
      living_narratives: LivingNarrative.create(),
      project: ProjectModel.create(),
      company: CompanyModel.create(),
    );
    return inspection;
  }

  factory InspectionModel.fromJson(Map<String, dynamic> json) {
    final inspection =
        InspectionModel.create(); //TODO: do the json stuff here cause its final
    return inspection;
  }
}
