import 'package:flutter/material.dart';

import 'package:ecsd_mobile/constants/Theme.dart';

//widgets
import 'package:ecsd_mobile/widgets/navbars/navbar.dart';
import 'package:ecsd_mobile/widgets/table-cell.dart';

import 'package:ecsd_mobile/widgets/drawer.dart';

import 'package:ecsd_mobile/screens/notifications-settings.dart';
import 'package:ecsd_mobile/screens/privacy.dart';
import 'package:ecsd_mobile/screens/about.dart';
import 'package:ecsd_mobile/screens/agreement.dart';

class Settings extends StatefulWidget {
  @override
  _SettingsState createState() => _SettingsState();
}

class _SettingsState extends State<Settings> {
  late bool switchValueOne;
  late bool switchValueTwo;

  void initState() {
    setState(() {
      switchValueOne = false;
      switchValueTwo = false;
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: Navbar(
          getCurrentPage: () => "Settings",
          tags: [],
          title: "Settings",
          searchController: TextEditingController(),
          searchOnChanged: () {},
        ),
        drawer: ArgonDrawer(currentPage: "Settings"),
        body: Container(
            child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              children: [
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
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
                        style:
                            TextStyle(color: ArgonColors.text, fontSize: 14)),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Use FaceID to signin",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueOne,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueOne = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Auto-Lock security",
                        style: TextStyle(color: ArgonColors.text)),
                    Switch.adaptive(
                      value: switchValueTwo,
                      onChanged: (bool newValue) =>
                          setState(() => switchValueTwo = newValue),
                      activeColor: ArgonColors.primary,
                    )
                  ],
                ),
                TableCellSettings(
                    title: "Notifications",
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => NotificationsSettings()));
                    }),
                SizedBox(height: 36.0),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text("Payment Settings",
                        style: TextStyle(
                            color: ArgonColors.text,
                            fontWeight: FontWeight.w600,
                            fontSize: 18)),
                  ),
                ),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text("These are also important settings",
                        style: TextStyle(color: ArgonColors.text)),
                  ),
                ),
                TableCellSettings(
                    title: "Manage Payment Options",
                    onTap: () {
                      // Add your onTap logic here
                    }),
                TableCellSettings(
                    title: "Manage Gift Cards",
                    onTap: () {
                      // Add your onTap logic here
                    }),
                SizedBox(
                  height: 36.0,
                ),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text("Privacy Settings",
                        style: TextStyle(
                            color: ArgonColors.text,
                            fontWeight: FontWeight.w600,
                            fontSize: 18)),
                  ),
                ),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text("Third most important settings",
                        style: TextStyle(color: ArgonColors.text)),
                  ),
                ),
                TableCellSettings(
                    title: "User Agreement",
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => UserAgreement()));
                    }),
                TableCellSettings(
                    title: "Privacy",
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) => Privacy()));
                    }),
                TableCellSettings(
                    title: "About",
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) => About()));
                    }),
              ],
            ),
          ),
        )));
  }
}
