import 'package:ecsd_mobile/model/notes_model.dart';

class ActionItemModel {
  String id;
  String name;
  String number;
  String project;
  String inspection;
  List<NotesModel> notes;
  String description;
  String status;
  String source;
  String control;
  String location;
  DateTime? date_initiated;
  DateTime? date_resolved;
  DateTime? due_date;
  String? assignedTo;

  ActionItemModel(
      {required this.id,
      required this.name,
      required this.number,
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
      required this.assignedTo,
      required this.due_date});

  static create() {
    return ActionItemModel(
      id: "",
      name: "",
      number: "",
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
      assignedTo: "",
      due_date: DateTime.now(),
    );
  }

  factory ActionItemModel.fromJson(Map<String, dynamic> json) =>
      ActionItemModel(
          id: json["id"],
          name: json["attributes"]["name"],
          number: json["attributes"]["number"],
          notes: [], //List<NotesModel>.from(json["attributes"]["notes"]),
          project: json["attributes"]["project"],
          inspection: json["attributes"]!["inspection"] ?? "",
          description: json["attributes"]["description"] ?? "",
          status: json["attributes"]["status"] ?? "",
          source: json["attributes"]["source"] ?? "",
          control: json["attributes"]["control"] ?? "",
          location: json["attributes"]["location"] ?? "",
          due_date: DateTime.tryParse(json["attributes"]["due_date"] ?? ""),
          assignedTo: json["attributes"]["assigned_to"],
          date_initiated:
              DateTime.tryParse(json["attributes"]["date_initiated"] ?? ""),
          date_resolved:
              DateTime.tryParse(json["attributes"]["date_resolved"] ?? ""));

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "number": number,
      "project": project,
      "inspection": inspection,
      "notes": notes,
      "description": description,
      "status": status,
      "source": source,
      "control": control,
      "location": location,
      "date_initiated": date_initiated?.toIso8601String(),
      "date_resolved": date_resolved?.toIso8601String(),
      "due_date": due_date?.toIso8601String(),
      "assigned_to": assignedTo,
    };
  }
}
