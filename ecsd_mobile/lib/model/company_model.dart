import 'package:ecsd_mobile/model/address_model.dart';
import 'package:ecsd_mobile/model/person_model.dart';
import 'package:ecsd_mobile/model/user_model.dart';

class CompanyModel {
  final int id;
  String name;
  String status;
  AddressModel address;
  User owner;
  Person primary_contact;
  List<Person> people;

  CompanyModel({
    required this.id,
    required this.name,
    required this.status,
    required this.address,
    required this.owner,
    required this.primary_contact,
    required this.people,
  }) {}

  factory CompanyModel.create() {
    final company = CompanyModel(
      id: 0,
      name: "",
      status: "",
      address: AddressModel.create(),
      owner: User.create(),
      primary_contact: Person.create(),
      people: [],
    );
    return company;
  }
}
