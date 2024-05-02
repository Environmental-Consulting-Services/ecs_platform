import 'package:ecsd_mobile/screens/actions-list.dart';
import 'package:ecsd_mobile/screens/inspectionform.dart';
import 'package:ecsd_mobile/screens/sitemap-widget.dart';
import 'package:flutter/material.dart';
import '../constants/Theme.dart';
import '../model/inspection_model.dart';
import '../services/inspection_service.dart';
import '../widgets/drawer.dart';
import '../widgets/navbars/navbar.dart';
import 'sitemappainter-widget.dart';

class Inspection extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String inspectionId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const Inspection({Key? key, this.inspectionId = "22"}) : super(key: key);

  @override
  State<Inspection> createState() => _InspectionState();
}

// homepage state
class _InspectionState extends State<Inspection> {
  late Future<InspectionModel> inspectionFuture;
  late InspectionFormWidget inspectionFormWidget;
  late SiteMapPainter siteMapWidget;

  // function to fetch data from api and return future list of posts
  Future<InspectionModel> getInspection(String inspectionId) async {
    Future<InspectionModel> inspection =
        InspectionService.loadInspection(inspectionId);
    return inspection;
  }

  int _selectedPage = 0;
  List<Widget> pageList = [];

  getInspectionFormWidget() {
    return inspectionFormWidget;
  }

  setInspectionFormWidget(InspectionFormWidget inspectionFormWidget) {
    this.inspectionFormWidget = inspectionFormWidget;
  }

  getSiteMapWidget() {
    return siteMapWidget;
  }

  setSiteMapWidget(SiteMapPainter siteMapWidget) {
    this.siteMapWidget = siteMapWidget;
  }

  @override
  void initState() {
    this.setInspectionFormWidget(
        InspectionFormWidget(inspectionId: widget.inspectionId));
    this.setSiteMapWidget(SiteMapPainter());

    pageList.add(this.getInspectionFormWidget());
    pageList.add(this.getSiteMapWidget());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future project

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: getAppBar("Inspection"),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedPage,
        onTap: _setSelectedPage,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.content_paste_search_rounded),
            label: 'Inspection Form',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build_rounded),
            label: 'Site Map',
          ),
        ],
      ),
      backgroundColor: ArgonColors.bgColorScreen,
      drawer: ArgonDrawer(currentPage: "Project"),
      body: IndexedStack(
        index: _selectedPage,
        children: pageList,
      ),
    );
  }

  void _setSelectedPage(int index) {
    setState(() {
      _selectedPage = index;
    });
  }

  getAppBar(String s) {
    return PreferredSize(
      preferredSize: widget.preferredSize,
      child: Navbar(
        getCurrentPage: () {
          return s;
        },
        tags: [],
        searchController: TextEditingController(),
        searchOnChanged: () {},
        backButton: false,
        title: s,
        rightOptions: false,
      ),
    );
  }
}
