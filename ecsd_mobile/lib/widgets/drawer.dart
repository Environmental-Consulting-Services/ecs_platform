import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:ecsd_mobile/constants/Theme.dart';

import 'package:ecsd_mobile/widgets/drawer-tile.dart';

class ArgonDrawer extends StatelessWidget {
  final String currentPage;

  ArgonDrawer({required this.currentPage});

  _launchURL() async {
    const url = 'http://app.ecscompliance.com';
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
        child: Container(
      color: ArgonColors.white,
      child: Column(children: [
        //Header
        /* GestureDetector(
          onTap: () {
            Navigator.of(context).pushNamedAndRemoveUntil(
                '/home', (Route<dynamic> route) => false);
          },
          child:  */
        Container(
          height: MediaQuery.of(context).size.height * 0.1,
          width: MediaQuery.of(context).size.width * 0.85,
          child: SafeArea(
            bottom: false,
            child: Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: const EdgeInsets.only(left: 32),
                child: Image.asset("assets/img/logocircuitdrop.png"),
              ),
            ),
          ),
        ),
        /*  ), */

        Expanded(
          flex: 2,
          child: ListView(
            padding: EdgeInsets.only(top: 24, left: 16, right: 16),
            children: [
              DrawerTile(
                  icon: Icons.home,
                  onTap: () {
                    if (currentPage != "Home") {
                      Navigator.of(context).pushNamedAndRemoveUntil(
                          '/home', (Route<dynamic> route) => false);
                    } else {
                      Navigator.of(context).pop();
                    }
                  },
                  iconColor: ArgonColors.primary,
                  title: "Home",
                  isSelected: currentPage == "Home" ? true : false),
              DrawerTile(
                  icon: Icons.settings_input_component,
                  onTap: () {
                    if (currentPage != "projects")
                      Navigator.pushReplacementNamed(context, '/projects');
                  },
                  iconColor: ArgonColors.error,
                  title: "Projects",
                  isSelected: currentPage == "Projects" ? true : false),
              DrawerTile(
                  icon: Icons.apps,
                  onTap: () {
                    if (currentPage != "Field Expert")
                      Navigator.pushReplacementNamed(context, '/chat');
                  },
                  iconColor: ArgonColors.primary,
                  title: "Field Expert",
                  isSelected: currentPage == "Field Expert" ? true : false),
            ],
          ),
        ),
        Expanded(
          flex: 1,
          child: Container(
              padding: EdgeInsets.only(left: 8, right: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Divider(height: 4, thickness: 0, color: ArgonColors.muted),
                  DrawerTile(
                      icon: Icons.settings,
                      onTap: () {
                        if (currentPage != "Settings")
                          Navigator.pushReplacementNamed(context, '/settings');
                      },
                      iconColor: ArgonColors.success,
                      title: "Settings",
                      isSelected: currentPage == "Settings" ? true : false),
                  DrawerTile(
                      icon: Icons.settings,
                      onTap: () {
                        if (currentPage != "Privacy")
                          Navigator.pushReplacementNamed(context, '/privacy');
                      },
                      iconColor: ArgonColors.success,
                      title: "Privacy",
                      isSelected: currentPage == "Privacy" ? true : false),
                  Padding(
                    padding:
                        const EdgeInsets.only(top: 16.0, left: 16, bottom: 8),
                    child: Text("Documentation",
                        style: TextStyle(
                          color: Color.fromRGBO(0, 0, 0, 0.5),
                          fontSize: 15,
                        )),
                  ),
                  DrawerTile(
                      icon: Icons.airplanemode_active,
                      onTap: _launchURL,
                      iconColor: ArgonColors.muted,
                      title: "Getting Started",
                      isSelected:
                          currentPage == "Getting started" ? true : false),
                ],
              )),
        ),
      ]),
    ));
  }
}
