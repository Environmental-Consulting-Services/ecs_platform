import 'dart:async';

import 'package:ecsd_mobile/model/project_model.dart';
import 'package:ecsd_mobile/services/inspection_service.dart';
import 'package:ecsd_mobile/widgets/appstate.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:observable/observable.dart';
import '../model/inspection_model.dart';
import 'inspection.dart';

class InspectionList extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String projectId;
  const InspectionList({Key? key, this.projectId = ""}) : super(key: key);

  @override
  State<InspectionList> createState() => _InspectionListState();
}

// homepage state
class _InspectionListState extends State<InspectionList> {
  ObservableMap? _state;
  late StreamSubscription stateChanges;
  late Future<List<InspectionModel>> inspectionsFuture;

  // function to fetch data from api and return future list of posts
  Future<List<InspectionModel>> getInspections(String projectId) async {
    Future<List<InspectionModel>> inspections =
        InspectionService.loadInspections(projectId);
    return inspections;
  }

  @override
  void initState() {
    _state = context.findAncestorWidgetOfExactType<AppState>()?.state;
    if (_state != null) {
      _state?['projectId'] = widget.projectId;
      stateChanges = _state!.changes.listen((event) => setState(() {}));
    }
    super.initState();
    inspectionsFuture = getInspections(widget.projectId);
  }

  @override
  void dispose() {
    super.dispose();
    stateChanges.cancel();
  }

  void addInspection() async {
    InspectionModel newInspection = InspectionModel.create();

    newInspection.project = widget.projectId;
    newInspection.scheduled_date = DateTime.now();
    newInspection.status = "unscheduled";

    await InspectionService.createInspection(newInspection)
        .then((createdInspection) {
      if (widget.projectId != "") {
        inspectionsFuture = getInspections(widget.projectId);
      } else {
        inspectionsFuture = getInspections("");
      }
      setState(() {});
    });
  }

  Widget createInspectionList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final inspection = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => Inspection(
                      inspectionId: inspection.id,
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
                        title: Text(
                            (inspection.scheduled_date != null)
                                ? DateFormat.yMMMd()
                                    .format(inspection.scheduled_date)
                                : "Unscheduled",
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 22)),
                        subtitle: Text("Status:" + inspection.status,
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
    var inspectionListFutureBuilder = new FutureBuilder(
        future: inspectionsFuture,
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
                return createInspectionList(context, snapshot);
              }
          }
        });

    final _inspectionFormKey = GlobalKey<FormState>();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(),
        Container(
          child: inspectionListFutureBuilder,
        ),
        Positioned(
            right: 20,
            bottom: 20,
            child: Align(
                alignment: Alignment.bottomRight,
                child: FloatingActionButton(
                  child: Icon(Icons.note_add_rounded),
                  tooltip: 'Add Inspection',
                  onPressed: () async {
                    addInspection(/* value ?? "" */);
                    /* await showDialog<void>(
                        context: context,
                        builder: (context) => AlertDialog(
                              title: const Text('New Inspection'),
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
                                  child: const Text('Add Inspection'),
                                  onPressed: () {
                                    if (_inspectionFormKey.currentState!
                                        .validate()) {
                                      _inspectionFormKey.currentState!.save();
                                      Navigator.of(context).pop();
                                    }
                                  },
                                ),
                              ],
                              content: Stack(
                                clipBehavior: Clip.none,
                                children: <Widget>[
                                  Form(
                                    key: _inspectionFormKey,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: TextFormField(
                                            autofocus: true,
                                            decoration: const InputDecoration(
                                              labelText: 'Inspection',
                                            ),
                                            validator: (value) {
                                              if (value == null ||
                                                  value.isEmpty) {
                                                return 'Please enter a name';
                                              }
                                              return null;
                                            },
                                            onSaved: (value) {
                                              addInspection(/* value ?? "" */);
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            )); */
                  },
                )))
      ],
    );

    return inspectionListFutureBuilder;
  }
}
