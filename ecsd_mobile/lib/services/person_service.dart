import 'package:ecsd_mobile/model/action_items.dart';
import 'package:ecsd_mobile/model/person_model.dart';

class PersonService {
  static Future<List<Person>> loadAssigneesForAction(
      String actionItemId) async {
    List<Person> people = [
      Person.create(),
      Person.create(),
    ];

    return people;
  }
}
