import 'package:ecsd_mobile/model/phase_model.dart';
import 'package:ecsd_mobile/model/source__control.dart';

import 'person_model.dart';

class LivingNarrative {
  String id;
  String description;
  String narrative;
  List<PhaseModel> phases;
  List<Person> people;
  String distrurbance_area;
  List<String> areas_of_inspection;
  List<Source_Control> source_controls;

  LivingNarrative({
    required this.id,
    required this.description,
    required this.narrative,
    required this.phases,
    required this.people,
    required this.distrurbance_area,
    required this.areas_of_inspection,
    required this.source_controls,
  });

  static create() {
    final livingNarrative = LivingNarrative(
      id: "",
      description: "",
      narrative: "",
      phases: [],
      people: [],
      distrurbance_area: "",
      areas_of_inspection: [],
      source_controls: [],
    );
    return livingNarrative;
  }
}
