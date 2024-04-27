class Source_Control {
  String source_description;
  String source_type;
  String source_status;
  List<List<String>> controls;
  DateTime created_atl;
  DateTime updated_at;

  Source_Control({
    required this.source_description,
    required this.source_type,
    required this.source_status,
    required this.controls,
    required this.created_atl,
    required this.updated_at,
  });

  factory Source_Control.create() {
    final sourceControl = Source_Control(
      source_description: "",
      source_type: "",
      source_status: "",
      controls: [[]],
      created_atl: DateTime.now(),
      updated_at: DateTime.now(),
    );
    return sourceControl;
  }

  factory Source_Control.fromJson(Map<String, dynamic> json) {
    final sourceControl = Source_Control(
      source_description: json['source_description'],
      source_type: json['source_type'],
      source_status: json['source_status'],
      controls: json['controls'],
      created_atl: DateTime.parse(json['created_atl']),
      updated_at: DateTime.parse(json['updated_at']),
    );
    return sourceControl;
  }
}
