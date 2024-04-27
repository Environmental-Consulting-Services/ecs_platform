class SiteMap {
  DateTime upate_date;
  String map;

  SiteMap({
    required this.upate_date,
    required this.map,
  });

  factory SiteMap.create() {
    final siteMap = SiteMap(
      upate_date: DateTime.now(),
      map: "",
    );
    return siteMap;
  }

  factory SiteMap.fromJson(Map<String, dynamic> json) {
    final siteMap = SiteMap(
      upate_date: DateTime.parse(json['upate_date']),
      map: json['map'],
    );
    return siteMap;
  }
}
