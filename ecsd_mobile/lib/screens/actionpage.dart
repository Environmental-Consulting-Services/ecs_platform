import 'dart:core';

import 'package:ecsd_mobile/constants/Theme.dart';
import 'package:ecsd_mobile/screens/actionitembody.dart';
import 'package:ecsd_mobile/screens/actionnoteslist.dart';
import 'package:ecsd_mobile/widgets/drawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

//widgets

class ActionPage extends StatefulWidget {
//final double height = window.physicalSize.height;
  final String actionItemId;
  final String projectId;
  final String inspectionId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const ActionPage(
      {Key? key,
      this.actionItemId = "",
      this.inspectionId = "",
      this.projectId = ""})
      : super(key: key);

  @override
  State<ActionPage> createState() => _ActionPageState();
}

// homepage state
class _ActionPageState extends State<ActionPage> {
  int _selectedPage = 0;
  List<Widget> pageList = [];

  @override
  void initState() {
    //projectFuture = getProject(widget.projectId);
    pageList.add(ActionItemBody(
        projectId: widget.projectId, actionItemId: widget.actionItemId));
    pageList.add(ActionItemNotesList(actionItemId: widget.actionItemId));
    //pageList.add(ActionList(projectId: widget.projectId));
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _setSelectedPage(int index) {
    setState(() {
      _selectedPage = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: widget.preferredSize,
        child: SafeArea(
          child: Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 1.0),
                  child: ListTile(
                    title: Text('Action Item Details',
                        style: TextStyle(
                            color: Colors.black,
                            fontSize: 22,
                            fontWeight: FontWeight.bold)),
                  ),
                ),
                /* Text('AC1. ',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        background: Paint()
                          ..color = Colors.blue
                          ..strokeWidth = 20
                          ..strokeJoin = StrokeJoin.round
                          ..strokeCap = StrokeCap.round
                          ..style = PaintingStyle.stroke,
                        color: Colors.white,
                      )) */
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedPage,
        onTap: _setSelectedPage,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.construction_rounded),
            label: 'Details',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.content_paste_search_rounded),
            label: 'Notes',
          ),
        ],
      ),
      drawer: ArgonDrawer(currentPage: "Project"),
      body: IndexedStack(
        index: _selectedPage,
        children: pageList,
      ),
      backgroundColor: ArgonColors.bgColorScreen,
    );
  }
}
