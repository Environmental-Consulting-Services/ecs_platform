class PermitModel {
  String id;
  String name;
  String number;
  String status;
  String type;

  PermitModel({
    required this.id,
    required this.name,
    required this.number,
    required this.status,
    required this.type,
  }) {}

  factory PermitModel.create() {
    final permit = PermitModel(
      id: "",
      name: "",
      number: "",
      status: "",
      type: "",
    );
    return permit;
  }
}
