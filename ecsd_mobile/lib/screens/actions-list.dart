import 'package:ecsd_mobile/screens/actionpage.dart';
import 'package:flutter/material.dart';
import '../model/action_items.dart';
import '../services/action_service.dart';
import 'actionitembody.dart';

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
  Future<List<ActionItemModel>> getProjectActions(String Id) async {
    Future<List<ActionItemModel>> actions =
        ActionService.loadProjectActions(Id);
    return actions;
  }

  Future<List<ActionItemModel>> getInspectionActions(String Id) async {
    Future<List<ActionItemModel>> actions =
        ActionService.loadInspectionActions(Id);
    return actions;
  }

  @override
  void initState() {
    super.initState();

    if (widget.inspectionId != "") {
      actionsFuture = getInspectionActions(widget.inspectionId);
    } else {
      actionsFuture = getProjectActions(widget.projectId);
    }
  }

  void addAction(String note) async {
    ActionItemModel newActionItem = ActionItemModel.create();
    newActionItem.project = widget.projectId;
    newActionItem.inspection = widget.inspectionId;
    newActionItem.name = note;
    newActionItem.status = "todo";
    DateTime dueDate = DateTime.now();
    dueDate = dueDate.add(new Duration(days: 1));
    newActionItem.due_date = dueDate;

    await ActionService.createAction(newActionItem).then((savedNotes) {
      if (widget.inspectionId != "") {
        actionsFuture = getInspectionActions(widget.inspectionId);
      } else {
        actionsFuture = getProjectActions(widget.projectId);
      }
      setState(() {});
    });
  }

  Widget createActionList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final action = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ActionPage(
                      actionItemId: action!.id,
                      projectId: widget.projectId,
                      inspectionId: widget.inspectionId,
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
                        subtitle: Text("Status:  " + action!.status,
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

    //return actionListFutureBuilder;

    final _actionFormKey = GlobalKey<FormState>();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(),
        Container(
          child: actionListFutureBuilder,
        ),
        Positioned(
            right: 20,
            bottom: 20,
            child: Align(
                alignment: Alignment.bottomRight,
                child: FloatingActionButton(
                  child: Icon(Icons.note_add_rounded),
                  tooltip: 'Add Action',
                  onPressed: () async {
                    await showDialog<void>(
                        context: context,
                        builder: (context) => AlertDialog(
                              title: const Text('New Action Item'),
                              insetPadding: EdgeInsets.all(10),
                              actions: [
                                ElevatedButton(
                                  child: const Text('Close'),
                                  onPressed: () {
                                    Navigator.of(context, rootNavigator: true)
                                        .pop('dialog');
                                  },
                                ),
                                ElevatedButton(
                                  child: const Text('Add Action Item'),
                                  onPressed: () {
                                    if (_actionFormKey.currentState!
                                        .validate()) {
                                      _actionFormKey.currentState!.save();
                                      Navigator.of(context).pop();
                                    }
                                  },
                                ),
                              ],
                              content: Stack(
                                clipBehavior: Clip.none,
                                children: <Widget>[
                                  Form(
                                    key: _actionFormKey,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: TextFormField(
                                            autofocus: true,
                                            decoration: const InputDecoration(
                                              labelText: 'Action Item',
                                            ),
                                            validator: (value) {
                                              if (value == null ||
                                                  value.isEmpty) {
                                                return 'Please enter a Title for the Action';
                                              }
                                              return null;
                                            },
                                            onSaved: (value) {
                                              addAction(value ?? "");
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ));
                  },
                )))
      ],
    );
  }
}
