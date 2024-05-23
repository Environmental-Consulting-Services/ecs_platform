class Person {
  String id;
  String email;
  String firstName;
  String lastName;
  String? phone;
  //String? project_role;

  Person({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phone,
    //required this.project_role
  });

  static create() {
    return Person(
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      //project_role: "",
    );
  }

  String fullName() {
    return firstName + ' ' + lastName;
  }

  factory Person.fromJson(Map<String, dynamic>? json) => Person(
        id: (json != null) ? json["_id"] : "",
        email: (json != null) ? json["email"] : "",
        firstName: (json != null) ? json["first_name"] : "",
        lastName: (json != null) ? json["last_name"] : "",
        phone: (json != null) ? json["phone"] : "",
        // project_role: (json != null) ? json["project_role"] : "",
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "email": email,
        "first_name": firstName,
        "last_name": lastName,
        "phone": phone,
      };
}
