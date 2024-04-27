class AddressModel {
  String street_one;
  String street_two;
  String city;
  String state;
  String zip_code;

  AddressModel({
    required this.street_one,
    required this.street_two,
    required this.city,
    required this.state,
    required this.zip_code,
  });

  factory AddressModel.create() {
    final address = AddressModel(
      street_one: "",
      street_two: "",
      city: "",
      state: "",
      zip_code: "",
    );
    return address;
  }
}
