import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/inspection_form_model.dart';
import 'package:ecsd_mobile/model/project_model.dart';

class InspectionTemplateModel {
  String id;
  String type;
  InspectionFormModel form;
  ProjectModel project;
  CompanyModel company;

  InspectionTemplateModel({
    required this.id,
    required this.type,
    required this.form,
    required this.project,
    required this.company,
  });

  static create() {
    return InspectionTemplateModel(
      id: "",
      type: "",
      form: InspectionFormModel.create(),
      project: ProjectModel.create(),
      company: CompanyModel.create(),
    );
  }
}
