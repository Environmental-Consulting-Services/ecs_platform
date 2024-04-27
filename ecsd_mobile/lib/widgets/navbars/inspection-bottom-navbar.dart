import 'package:ecsd_mobile/screens/sitemap-widget.dart';
import 'package:flutter/material.dart';
import 'package:ecsd_mobile/constants/Theme.dart';

class InspectionBottomNavBar extends StatefulWidget
    implements PreferredSizeWidget {
  final List<List<String>> items;

  InspectionBottomNavBar({
    this.items = const [
      ["", ""],
      ["", ""]
    ],
  });

  final double _prefferedHeight = 100.0;

  @override
  _BottomNavBarState createState() => _BottomNavBarState();

  @override
  Size get preferredSize => Size.fromHeight(_prefferedHeight);
}

class _BottomNavBarState extends State<InspectionBottomNavBar> {
  late String activeTag;

  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        height: widget.preferredSize.height,
        decoration: BoxDecoration(
            //color: widget.transparent ? Colors.transparent : ArgonColors.white,
            boxShadow: [
              BoxShadow(
                  color: ArgonColors.initial,
                  spreadRadius: -10,
                  blurRadius: 12,
                  offset: Offset(0, 5))
            ]),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(left: 16.0, right: 16.0),
            child: Flex(direction: Axis.horizontal, children: [
              Column(
                children: [
                  SizedBox(
                    height: 10.0,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      //This is the Bottom Menu Bar Inspections Button
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => Container()));
                        },
                        child: Row(
                          children: [
                            Icon(Icons.construction_rounded,
                                color: ArgonColors.initial, size: 22.0),
                            SizedBox(width: 5),
                            Text("Inspection",
                                style: TextStyle(
                                    color: ArgonColors.initial,
                                    fontSize: 16.0)),
                          ],
                        ),
                      ),
                      SizedBox(width: 15),
                      Container(
                        color: ArgonColors.initial,
                        height: 25,
                        width: 1,
                      ),
                      SizedBox(width: 15),
                      //This is the Bottom Menu Bar Inspections Button
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => SiteMapWidget()));
                        },
                        child: Row(
                          children: [
                            Icon(Icons.content_paste_search_rounded,
                                color: ArgonColors.initial, size: 22.0),
                            SizedBox(width: 5),
                            Text("Site Map",
                                style: TextStyle(
                                    color: ArgonColors.initial,
                                    fontSize: 16.0)),
                            SizedBox(width: 5),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ]),
          ),
        ));
  }
}
