import 'package:ecsd_mobile/screens/project.dart';
import 'package:flutter/material.dart';
import '../constants/Theme.dart';
import '../model/project_model.dart';
import '../services/project_service.dart';
import '../widgets/drawer.dart';
import '../widgets/navbars/navbar.dart';

class ProjectList extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String companyId;

  const ProjectList({Key? key, this.companyId = ""}) : super(key: key);

  @override
  State<ProjectList> createState() => _ProjectListState();
}

// homepage state
class _ProjectListState extends State<ProjectList> {
  late Future<List<ProjectModel>> projectsFuture;

  // function to fetch data from api and return future list of posts
  Future<List<ProjectModel>> getProjects(String companyId) async {
    Future<List<ProjectModel>> project = ProjectService.loadProjects(companyId);
    return project;
  }

  @override
  void initState() {
    projectsFuture = getProjects(widget.companyId);
    super.initState();
  }

  Widget createProjectList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      scrollDirection: Axis.vertical,
      shrinkWrap: true,
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final project = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ProjectPage(
                      projectId: project!.number,
                    )));
          },
          child: Card(
            child: Container(
              padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
              child: Column(
                children: [
                  Padding(
                      padding: const EdgeInsets.only(top: 16.0),
                      child: ListTile(
                        title: Text(project!.name,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 22)),
                        subtitle: Text("Status: Active",
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 10)),
                        trailing: Text("Phase: Inital",
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 10)),
                      )),
                  Container(
                    height: 2.0,
                    color: const Color.fromARGB(255, 9, 9, 9),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    var projectListFutureBuilder = new FutureBuilder(
        future: projectsFuture,
        builder: (context, snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return Text('none');
            case ConnectionState.active:
            case ConnectionState.waiting:
              return Text('Loading...');
            case ConnectionState.done:
              return createProjectList(context, snapshot);

            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                return createProjectList(context, snapshot);
              }
          }
        });

    return Scaffold(
      //resizeToAvoidBottomInset: false,
      appBar: Navbar(
        getCurrentPage: () => "Projects",
        tags: [],
        title: "Projects",
        searchController: TextEditingController(),
        searchOnChanged: () {},
        /* categoryOne: "Inspections",
            categoryTwo: "Action Items", */
      ),
      /* bottomNavigationBar: SizedBox(
              height: 69,
              child: BottomNavBar(
                getCurrentPage: () => "Home",
                tags: [],
                title: "Home",
                searchController: TextEditingController(),
                searchOnChanged: () {},
                categoryOne: "Inspections",
                categoryTwo: "Action Items",
              )), */
      backgroundColor: ArgonColors.bgColorScreen,
      // key: _scaffoldKey,
      drawer: ArgonDrawer(currentPage: "Projects"),
      body: Container(
        padding: EdgeInsets.only(left: 24.0, right: 24.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 10.0),
                child: SizedBox(),
              ),
              projectListFutureBuilder,
            ],
          ),
        ),
      ),
    );
  }
}
