import 'package:flutter/material.dart';
import 'package:ecsd_mobile/constants/Theme.dart';

//widgets
import 'package:ecsd_mobile/widgets/navbars/navbar.dart';

class NotificationsSettings extends StatefulWidget {
  @override
  _NotificationsSettingsState createState() => _NotificationsSettingsState();
}

class _NotificationsSettingsState extends State<NotificationsSettings> {
  late bool switchValueOne;
  late bool switchValueTwo;
  late bool switchValueThree;
  late bool switchValueFour;

  void initState() {
    setState(() {
      switchValueOne = false;
      switchValueTwo = false;
      switchValueThree = false;
      switchValueFour = false;
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: Navbar(
        getCurrentPage: () => "Notifications Settings",
        tags: [],
        title: "Notifications Settings",
        searchController: TextEditingController(),
        searchOnChanged: () {},
      ),
      backgroundColor: ArgonColors.bgColorScreen,
      body: Container(
        child: Padding(
          padding: const EdgeInsets.only(left: 36.0, right: 36.0),
          child: Column(
            children: [
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 24.0),
                  child: Text("Recommended Settings",
                      style: TextStyle(
                          color: ArgonColors.text,
                          fontWeight: FontWeight.w600,
                          fontSize: 18)),
                ),
              ),
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text("These are the most important settings",
                      style: TextStyle(color: ArgonColors.text, fontSize: 14)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Someone mentions me",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueOne,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueOne = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Anyone follows me",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueTwo,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueTwo = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Someone comments me",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueThree,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueThree = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("A seller follows me",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueFour,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueFour = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
