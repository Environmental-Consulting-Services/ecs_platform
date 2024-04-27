class ActionItemModel {
  String id;
  String name;
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
}
