class ActionItemModel {
  String id;
  String name;
  String project;
  String inspection;
  List<String> notes;
  String description;
  String status;
  String source;
  String control;
  String location;
  DateTime date_initiated;
  DateTime date_resolved;

  ActionItemModel({
    required this.id,
    required this.name,
    required this.project,
    required this.inspection,
    required this.notes,
    required this.description,
    required this.status,
    required this.source,
    required this.control,
    required this.location,
    required this.date_initiated,
    required this.date_resolved,
  }) {}

  static create() {
    return ActionItemModel(
      id: "",
      name: "",
      project: "",
      inspection: "",
      notes: [],
      description: "",
      status: "",
      source: "",
      control: "",
      location: "",
      date_initiated: DateTime.now(),
      date_resolved: DateTime.now(),
    );
  }

  factory ActionItemModel.fromJson(Map<String, dynamic> json) {
    final actionItem = ActionItemModel.create();

    try {
      actionItem.id = json["id"];
      actionItem.name = json["attributes"]["name"];
      actionItem.notes = List<String>.from(json["attributes"]["notes"]);
      actionItem.project = json["attributes"]["project"];
      actionItem.inspection = json["attributes"]!["inspection"] ?? "";
      actionItem.description = json["attributes"]["description"] ?? "";
      actionItem.status = json["attributes"]["status"] ?? "";
      actionItem.source = json["attributes"]["source"] ?? "";
      actionItem.control = json["attributes"]["control"] ?? "";
      actionItem.location = json["attributes"]["location"] ?? "";
      actionItem.date_initiated =
          json["attributes"]["date_initiated"] ?? DateTime.now();
      actionItem.date_resolved =
          json["attributes"]["date_resolved"] ?? DateTime.now();
    } catch (e) {
      print("Error parsing ActionItemModel: $e");
    }
    return actionItem;
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "project": project,
      "inspection": inspection,
      "notes": notes,
      "description": description,
      "status": status,
      "source": source,
      "control": control,
      "location": location,
      "date_initiated": date_initiated,
      "date_resolved": date_resolved,
    };
  }
}
