import 'package:ecsd_mobile/model/address_model.dart';
import 'package:ecsd_mobile/model/person_model.dart';
import 'package:ecsd_mobile/model/user_model.dart';

class CompanyModel {
  String id;
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
      id: "",
      name: "",
      status: "",
      address: AddressModel.create(),
      owner: User.create(),
      primary_contact: Person.create(),
      people: [],
    );
    return company;
  }

  factory CompanyModel.fromJson(Map<String, dynamic> json) {
    final company = CompanyModel.create();

    company.id = json["id"];
    company.name = json["attributes"]["name"];
    company.status = json["attributes"]["status"];
    //company.address = AddressModel.fromJson(json["attributes"]["address"]);
    //company.owner = User.fromJson(json["attributes"]["owner"]);
    //company.primary_contact = Person.fromJson(json["attributes"]["primary_contact"]);
    //company.people = json["attributes"]["people"].map((person) => Person.fromJson(person)).toList();

    //TODO: do the json stuff here cause its final
    return company;
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "status": status,
      "address": address.toJson(),
      "owner": owner.toJson(),
      "primary_contact": primary_contact.toJson(),
      "people": people.map((person) => person.toJson()).toList(),
    };
  }
}
