class MessageModel {
  String id;
  String to;
  String from;
  String message;
  bool delivered;
  bool read;
  DateTime updated_at;
  DateTime created_at;

  MessageModel({
    required this.id,
    required this.to,
    required this.from,
    required this.message,
    required this.delivered,
    required this.read,
    required this.updated_at,
    required this.created_at,
  }) {}

  factory MessageModel.create() {
    final message = MessageModel(
      id: "",
      to: "",
      from: "",
      message: "",
      delivered: false,
      read: false,
      updated_at: DateTime.now(),
      created_at: DateTime.now(),
    );
    return message;
  }

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final message = MessageModel.create();

    message.id = json['id'];
    message.to = json['attributes']['to'];
    message.from = json['attributes']['from'];
    message.message = json['attributes']['message'];
    message.updated_at = DateTime.parse(json['attributes']['updated_at']);
    message.created_at = DateTime.parse(json['attributes']['created_at']);
    message.delivered = json['attributes']['delivered'];
    message.read = json['attributes']['read'];
    return message;
  }
}
