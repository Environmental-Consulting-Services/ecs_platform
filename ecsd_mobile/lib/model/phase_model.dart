import 'package:ecsd_mobile/model/site_map.dart';

class PhaseModel {
  String id;
  String type;
  List<SiteMap> site_map;
  DateTime start_date;
  DateTime end_date;
  String inspection_frequency;

  PhaseModel({
    required this.id,
    required this.type,
    required this.site_map,
    required this.start_date,
    required this.end_date,
    required this.inspection_frequency,
  });

  factory PhaseModel.create() {
    final phase = PhaseModel(
      id: "",
      type: "",
      site_map: [],
      start_date: DateTime.now(),
      end_date: DateTime.now(),
      inspection_frequency: "",
    );
    return phase;
  }
}
