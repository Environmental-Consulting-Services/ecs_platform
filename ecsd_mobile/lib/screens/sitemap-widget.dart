import 'package:flutter/material.dart';
import 'package:image_annotation/image_annotation.dart';

class SiteMapWidget extends StatefulWidget {
  @override
  _SiteMapWidgetState createState() => _SiteMapWidgetState();
}

enum AnnotationOption { line, rectangle, oval, text }

class _SiteMapWidgetState extends State<SiteMapWidget> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
  }

  AnnotationOption selectedOption = AnnotationOption.line; // Default option.

  String chooseAnnotationType(AnnotationOption option) {
    switch (option) {
      case AnnotationOption.line:
        return 'line';
      case AnnotationOption.rectangle:
        return 'rectangle';
      case AnnotationOption.oval:
        return 'oval';
      case AnnotationOption.text:
        return 'text';
    }
  }

  void _handleDrawerOptionTap(AnnotationOption option) {
    setState(() {
      selectedOption = option;
    });
    _scaffoldKey.currentState?.openEndDrawer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      /* appBar: AppBar(
        title: const Text('Site Map Updates'),
        centerTitle: true,
      ), */
      endDrawer: Drawer(
        child: ListView(
          children: <Widget>[
            const DrawerHeader(
              margin: EdgeInsets.zero,
              padding: EdgeInsets.zero,
              child: UserAccountsDrawerHeader(
                decoration: BoxDecoration(color: Colors.green),
                accountName: Text('Site Map Elements'),
                accountEmail: Text('choose one option'),
              ),
            ),
            ListTile(
              title: Text('Line'),
              onTap: () => _handleDrawerOptionTap(AnnotationOption.line),
              selected: selectedOption == AnnotationOption.line,
            ),
            ListTile(
              title: Text('Rectangular'),
              onTap: () => _handleDrawerOptionTap(AnnotationOption.rectangle),
              selected: selectedOption == AnnotationOption.rectangle,
            ),
            ListTile(
              title: Text('Oval'),
              onTap: () => _handleDrawerOptionTap(AnnotationOption.oval),
              selected: selectedOption == AnnotationOption.oval,
            ),
            ListTile(
              title: Text('Text'),
              onTap: () => _handleDrawerOptionTap(AnnotationOption.text),
              selected: selectedOption == AnnotationOption.text,
            ),
          ],
        ),
      ),
      body: Center(
        child: ImageAnnotation(
          imagePath: 'assets/img/sitemap.png',
          annotationType: chooseAnnotationType(selectedOption),
        ),
      ),
    );
  }
}
