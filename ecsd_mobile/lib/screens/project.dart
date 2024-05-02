import 'package:ecsd_mobile/model/project_model.dart';
import 'package:ecsd_mobile/screens/actions-list.dart';
import 'package:ecsd_mobile/services/project_service.dart';
import 'package:flutter/material.dart';
import 'package:ecsd_mobile/constants/Theme.dart';
import 'package:ecsd_mobile/widgets/drawer.dart';
import 'package:ecsd_mobile/widgets/navbars/navbar.dart';

import 'inspections-list.dart';
import 'project-body.dart';

class ProjectPage extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String projectId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const ProjectPage({Key? key, this.projectId = "22"}) : super(key: key);

  @override
  State<ProjectPage> createState() => _ProjectPageState();
}

// homepage state
class _ProjectPageState extends State<ProjectPage> {
  late Future<ProjectModel> projectFuture;
  int _selectedPage = 0;
  List<Widget> pageList = [];

  // function to fetch data from api and return future list of posts
  Future<ProjectModel> getProject(String projectId) async {
    Future<ProjectModel> project = ProjectService.loadProject(projectId);
    return project;
  }

  @override
  void initState() {
    //projectFuture = getProject(widget.projectId);
    pageList.add(ProjectBody(projectId: widget.projectId));
    pageList.add(InspectionList(projectId: widget.projectId));
    pageList.add(ActionList(projectId: widget.projectId));
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future project

    return Scaffold(
      appBar: getAppBar("Project "),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedPage,
        onTap: _setSelectedPage,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.construction_rounded),
            label: 'Project',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.content_paste_search_rounded),
            label: 'Inspections',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build_rounded),
            label: 'Actions',
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
          return "Project";
        },
        tags: [],
        searchController: TextEditingController(),
        searchOnChanged: () {},
        backButton: false,
        title: "Project",
        rightOptions: false,
      ),
    );
  }
}
