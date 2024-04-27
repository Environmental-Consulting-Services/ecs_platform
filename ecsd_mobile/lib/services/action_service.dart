import '../model/action_items.dart';

class ActionService {
  static Future<ActionItemModel> loadAction(String actionId) {
    return Future.value(ActionItemModel.create());
  }

  static Future<List<ActionItemModel>> loadProjectActions(String projectId) {
    return Future.value(
      List.generate(
        10,
        (index) => ActionItemModel.create(),
      ),
    );
  }

  static Future<List<ActionItemModel>> loadInspectionActions(
      String inspectionId) {
    return Future.value(
      List.generate(
        10,
        (index) => ActionItemModel.create(),
      ),
    );
  }
}
