import 'package:ecsd_mobile/model/project_model.dart';
import 'package:ecsd_mobile/services/project_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class ProjectBody extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String projectId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const ProjectBody({Key? key, required this.projectId}) : super(key: key);

  @override
  State<ProjectBody> createState() => new _ProjectBodyState(projectId);
}

// homepage state
class _ProjectBodyState extends State<ProjectBody> {
  _ProjectBodyState(String projectId);

  late Future<ProjectModel> projectFuture;

  // function to fetch data from api and return future list of posts
  Future<ProjectModel> getProject(String projectId) async {
    Future<ProjectModel> project = ProjectService.loadProject(projectId);
    return project;
  }

  @override
  void initState() {
    projectFuture = getProject(widget.projectId);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future project
    return Container(
      child: projectWidget(),
    );
  }

  Widget projectWidget() {
    return Column(
      children: [
        Padding(
            padding: const EdgeInsets.only(top: 20, left: 20.0, right: 20.0),
            child: SizedBox()),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Padding(
                padding:
                    const EdgeInsets.only(top: 20, left: 20.0, right: 20.0),
                child: SizedBox()),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Inspections Scheduled: '),
                  SizedBox(height: 10),
                  Text('Action Items:')
                ],
              ),
            ),
            Flexible(
              fit: FlexFit.tight,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '102',
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.fade,
                  ),
                  SizedBox(height: 10),
                  Text(
                    '3',
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.fade,
                  ),
                ],
              ),
            ),
          ],
        )
      ],
    );
  }
}
