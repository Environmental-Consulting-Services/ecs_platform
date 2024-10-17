import 'package:ecsd_mobile/model/address_model.dart';
import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/permit_model.dart';
import 'package:ecsd_mobile/model/person_model.dart';
import 'package:ecsd_mobile/model/user_model.dart';
import 'package:ecsd_mobile/screens/search.dart';

class ProjectModel {
  String number;
  String id;
  String name;
  CompanyModel company;
  AddressModel address;
  String status;
  List<Person> people;
  String type;
  User owner;
  User primary_contact;
  DateTime start_date;
  DateTime end_date;
  List<PermitModel> permits;

  ProjectModel({
    required this.number,
    required this.id,
    required this.name,
    required this.company,
    required this.address,
    required this.status,
    required this.people,
    required this.type,
    required this.owner,
    required this.primary_contact,
    required this.start_date,
    required this.end_date,
    required this.permits,
  }) {}

  factory ProjectModel.create() {
    final project = ProjectModel(
      id: "",
      number: "",
      name: "",
      company: CompanyModel.create(),
      address: AddressModel.create(),
      status: "",
      people: [],
      type: "",
      owner: User.create(),
      primary_contact: User.create(),
      start_date: DateTime.now(),
      end_date: DateTime.now(),
      permits: [],
    );
    return project;
  }

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    final project = ProjectModel.create();

    project.id = json["id"];
    project.number = json["attributes"]["number"];
    project.name = json["attributes"]["name"];
    //project.company = json["attributes"]["company"];
    //project.address = json["attributes"]["address"];
    project.status = json["attributes"]["status"];
    //project.people = json["attributes"]["people"];
    //project.type = json["attributes"]["type"];
    //project.owner = User.fromAPIJson(json["attributes"]["owner"]);
    //project.primary_contact = json["attributes"]["primary_contact"];
    //project.start_date = json["attributes"]["start_date"];
    //project.end_date = json["attributes"]["end_date"];
    //project.permits = json["attributes"]["permits"];

    return project;
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "number": number,
      "name": name,
      "company": company.toJson(),
      "address": address.toJson(),
      "status": status,
      "people": people,
      "type": type,
      "owner": owner.toJson(),
      "primary_contact": primary_contact.toJson(),
      "start_date": start_date.toIso8601String(),
      "end_date": end_date.toIso8601String(),
      "permits": permits,
    };
  }
}
