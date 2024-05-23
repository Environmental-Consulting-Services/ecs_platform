class NotesModel {
  String? id;
  String? note;
  String? user;
  String? type;
  DateTime? created_at;

  NotesModel(
      {required this.id,
      required this.note,
      required this.user,
      required this.type,
      required this.created_at});

  static create() {
    return NotesModel(
      id: "",
      note: "",
      user: "",
      type: "",
      created_at: null,
    );
  }

  factory NotesModel.fromJson(Map<String, dynamic> json) => NotesModel(
      id: json["_id"] ?? "",
      note: json["note"] ?? "",
      user: json["user"] ?? "",
      type: json["type"] ?? "",
      created_at: DateTime.tryParse(json["created_at"] ?? ""));

  Map<String, dynamic> toJson() {
    return {
      "_id": id,
      "note": note,
      "user": user,
      "type": type,
      "created_at": created_at?.toIso8601String() ?? ""
    };
  }
}
