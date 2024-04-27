class Person {
  final int id;
  String email;
  String firstName;
  String lastName;
  String cellphone;
  String project_role;

  Person({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.cellphone,
    required this.project_role,
  }) {}

  factory Person.create() {
    final person = Person(
      id: 0,
      email: "",
      firstName: "",
      lastName: "",
      cellphone: "",
      project_role: "",
    );
    return person;
  }

  String fullName() {
    return firstName + ' ' + lastName;
  }
}
