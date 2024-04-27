import 'package:ecsd_mobile/model/inspection_model.dart';

class InspectionService {
  static Future<List<InspectionModel>> loadInspections(String projectId) async {
    List<InspectionModel> inspections = [InspectionModel.create()];

    return inspections;
  }

  static Future<InspectionModel> loadInspection(String inspectionId) async {
    InspectionModel inspection = InspectionModel.create();

    return inspection;
  }
}
