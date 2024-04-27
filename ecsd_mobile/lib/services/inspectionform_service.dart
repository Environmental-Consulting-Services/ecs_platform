import '../model/inspection_form_model.dart';

class InspectionFormService {
  static Future<List<InspectionFormModel>> loadInspectionFormss(
      String inspectionFormId) async {
    List<InspectionFormModel> inspections = [InspectionFormModel.create()];

    return inspections;
  }

  static Future<InspectionFormModel> loadInspectionForm(
      String inspectionFormId) async {
    InspectionFormModel inspection = InspectionFormModel.create();

    return inspection;
  }
}
