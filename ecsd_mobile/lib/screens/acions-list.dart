import 'package:flutter/material.dart';
import '../model/action_items.dart';
import '../services/action_service.dart';
import 'action.dart';

class ActionList extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String inspectionId;
  final String projectId;

  const ActionList({Key? key, this.inspectionId = "", this.projectId = ""})
      : super(key: key);

  @override
  State<ActionList> createState() => _ActionListState();
}

// homepage state
class _ActionListState extends State<ActionList> {
  late Future<List<ActionItemModel>> actionsFuture;

  // function to fetch data from api and return future list of posts
  Future<List<ActionItemModel>> getActions(String Id) async {
    Future<List<ActionItemModel>> actions =
        ActionService.loadProjectActions(Id);
    return actions;
  }

  @override
  void initState() {
    super.initState();
    actionsFuture = getActions(widget.projectId);
  }

  Widget createActionList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final action = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ActionWidget(
                      actionId: action!.id,
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
                        title: Text(action!.name,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 22)),
                        subtitle: Text("Status: Active",
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
    var actionListFutureBuilder = new FutureBuilder(
        future: actionsFuture,
        builder: (context, snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return Text('none');
            case ConnectionState.active:
            case ConnectionState.waiting:
              return Text('Loading...');
            case ConnectionState.done:
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                return createActionList(context, snapshot);
              }
          }
        });

    return actionListFutureBuilder;
  }
}
