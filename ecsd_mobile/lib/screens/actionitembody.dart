import 'dart:async';
import 'dart:core';

import 'package:ecsd_mobile/model/person_model.dart';
import 'package:ecsd_mobile/model/user_model.dart';
import 'package:ecsd_mobile/services/action_service.dart';
import 'package:ecsd_mobile/services/person_service.dart';
import 'package:ecsd_mobile/services/project_service.dart';
import 'package:ecsd_mobile/widgets/appstate.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:observable/observable.dart';
import '../model/action_items.dart';

//widgets

class ActionItemBody extends StatefulWidget {
//final double height = window.physicalSize.height;
  final String actionItemId;
  final String projectId;
  final String inspectionId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const ActionItemBody(
      {Key? key,
      this.actionItemId = "",
      this.inspectionId = "",
      this.projectId = ""})
      : super(key: key);

  @override
  State<ActionItemBody> createState() => _ActionItemBodyState();
}

enum ColoredStatusLabel {
  inprogress("In Progress", Colors.blue),
  cantdo("Can't Do ", Colors.red),
  complete("Complete", Colors.green),
  todo("To Do", Colors.yellow);

  const ColoredStatusLabel(this.label, this.color);
  final String label;
  final Color color;
}

class PriorityItem {
  PriorityItem(this.name, this.value);
  final String name;
  final String value;
}

// homepage state
class _ActionItemBodyState extends State<ActionItemBody> {
  ObservableMap? _state;
  late StreamSubscription stateChanges;
  late Future<ActionItemModel> actionItemFuture;
  final TextEditingController colorController = TextEditingController();
  ColoredStatusLabel? selectedColor;
  final _formKey = GlobalKey<FormState>();
  final _noteFormKey = GlobalKey<FormState>();

  final dropdownState = GlobalKey<FormFieldState>();

  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _duedateController = TextEditingController();
  final _locationController = TextEditingController();
  final _assigneeController = TextEditingController();
  String selectedAssignee = "";
  ActionItemModel actionItemState = ActionItemModel.create();

  DateTime selectedDate = DateTime.now();
  late PriorityItem selectedPriority;
  late Future<List<Person>> assignees;

  final List<PriorityItem> priotityItems = [
    PriorityItem("Low", "low"),
    PriorityItem("Medium", "medium"),
    PriorityItem("High", "high"),
  ];

  // function to fetch data from api and return ActionItems list
  Future<ActionItemModel> getActionItem(String actionItemId) async {
    Future<ActionItemModel> actionItem = ActionService.loadAction(actionItemId);
    return actionItem;
  }

  // function to fetch data from api and return Assignees list
  Future<List<Person>> getAssignees(String projectId) async {
    Future<List<Person>> assignees =
        ProjectService.loadAssigneesForProject(projectId);
    return assignees;
  }

  saveActionItem() async {
    actionItemState.name = _nameController.text;
    actionItemState.description = _descriptionController.text;
    actionItemState.location = _locationController.text;
    actionItemState.assignedTo = selectedAssignee;
    actionItemState.status = selectedColor!.name;
    actionItemState.due_date = selectedDate;
    ActionService.updateAction(actionItemState);
  }

/*   Future<List<Person>> getAssignee() async {
    await actionItemFuture.then((theActionItem) async {
      if (theActionItem.assignedTo == null) {
        selectedAssignee = "";
        //selectedAssignee.firstName = "unassigned";
      } else {
        selectedAssignee = await assignees.then((value) => value
            .firstWhere((element) => element.id == theActionItem.assignedTo,
                orElse: () => Person.create())
            .id);
      }
    });

    return assignees;
  }
 */
  @override
  void initState() {
    var projectId = widget.projectId;
    _state = context.findAncestorWidgetOfExactType<AppState>()?.state;
    if (_state != null) {
      projectId = _state!['projectId'];
    }

    selectedPriority = priotityItems[0];
    assignees = getAssignees(projectId).then((value) async {
      value.add(Person.create());
      return value;
    });

    actionItemFuture =
        getActionItem(widget.actionItemId).then((actionItem) async {
      _nameController.text = actionItem.name;
      _descriptionController.text = actionItem.description;
      _duedateController.text = (actionItem.due_date != null)
          ? DateFormat.yMMMEd().format(actionItem.due_date ?? DateTime.now())
          : "";
      //dropdownState.currentState?.didChange(value.assignedTo);
      selectedAssignee = actionItem.assignedTo ?? "";

      _locationController.text = actionItem.location;
      selectedColor = ColoredStatusLabel.values.firstWhere(
          (element) => element.name == actionItem.status,
          orElse: () => ColoredStatusLabel.todo);
      //selectedPriority = priotityItems.firstWhere((element) => element.value == value.priority);
      //selectedColor = ColorLabel.values.firstWhere((element) => element.label == value.status);

      actionItemState = actionItem;

      return actionItem;
    });
    super.initState();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _duedateController.dispose();
    _locationController.dispose();
    _assigneeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: <Widget>[
                    Text('AC1',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          background: Paint()
                            ..color = Colors.blue
                            ..strokeWidth = 20
                            ..strokeJoin = StrokeJoin.round
                            ..strokeCap = StrokeCap.round
                            ..style = PaintingStyle.stroke,
                          color: Colors.white,
                        )),
                    SizedBox(
                      width: 30,
                    ),
                    buildStatusSelection(context),
                  ]),
            ),
            SizedBox(
              height: 10,
            ),
            TextFormField(
              controller: _nameController,
              keyboardType: TextInputType.name,
              decoration: inputDecoration(
                  border: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.blue, width: 2.0)),
                  fillColor: Colors.blue[50],
                  filled: true,
                  prefixIcon: Icon(Icons.account_box_outlined),
                  //hintText: 'What action needs to be taken?',
                  labelText: 'Action Name'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please fill this field';
                }
                return null;
              },
            ),
            SizedBox(
              height: 10,
            ),
            TextFormField(
              controller: _descriptionController,
              keyboardType: TextInputType.multiline,
              maxLines: null,
              decoration: inputDecoration(
                  prefixIcon: Icon(Icons.email_outlined),
                  //hintText: 'Sediment Control',
                  labelText: 'Description'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please fill this field';
                }
                return null;
              },
            ),
            SizedBox(
              height: 10,
            ),
            TextFormField(
              controller: _locationController,
              keyboardType: TextInputType.text,
              maxLines: null,
              decoration: inputDecoration(
                  prefixIcon: Icon(Icons.edit_location),
                  //hintText: 'Sediment Control',
                  labelText: 'Location'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please fill this field';
                }
                return null;
              },
            ), //buildPrioritySelection(context),
            SizedBox(
              height: 10,
            ),
            buildAssigneeSelection(context),
            SizedBox(
              height: 10,
            ),
            TextFormField(
              controller: _duedateController,
              decoration: inputDecoration(
                  prefixIcon: Icon(Icons.edit_calendar),
                  //hintText: DateTime.now().toString(),
                  labelText: 'Due Date'),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please fill this field';
                }
                return null;
              },
              onTap: () {
                // Below line stops keyboard from appearing
                FocusScope.of(context).requestFocus(new FocusNode());
                _selectDate(context);
                // Show Date Picker Here
              },
            ),
            SizedBox(
              height: 20,
            ),
            ElevatedButton(
                style:
                    ElevatedButton.styleFrom(minimumSize: Size.fromHeight(50)),
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();

                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text('The Action Item is being saved.')));
                    saveActionItem().then((value) {
                      Navigator.of(context).pop();
                    });
                  } else {
                    //The form has some validation errors.
                    //Do Something...
                  }
                },
                child: Text('Save')),
            SizedBox(
              height: 10,
            ),
            ElevatedButton(
                style:
                    ElevatedButton.styleFrom(minimumSize: Size.fromHeight(50)),
                onPressed: () {
                  (_cancelDialogBuilder(context))
                      .then((value) => value ?? false)
                      .then((value) {
                    if (value) {
                      Navigator.of(context).pop();
                    }
                  });
                },
                child: Text('Cancel'))
          ],
        ),
      ),
    ));
  }

  InputDecoration inputDecoration({
    FloatingLabelBehavior? floatingLabelBehavior,
    InputBorder? enabledBorder,
    InputBorder? border,
    Color? fillColor,
    bool? filled,
    Widget? prefixIcon,
    String? hintText,
    String? labelText,
  }) =>
      InputDecoration(
          floatingLabelBehavior:
              floatingLabelBehavior ?? FloatingLabelBehavior.always,
          enabledBorder: enabledBorder ??
              OutlineInputBorder(borderSide: BorderSide(width: 2.0)),
          border: border ??
              OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black, width: 2.0)),
          prefixIcon: prefixIcon,
          hintText: hintText,
          labelText: labelText);

  Future<bool?> _cancelDialogBuilder(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Cancelation'),
          content: const Text(
            'You are about to cancel the changes to the action item. Are you sure you want to proceed?',
          ),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: const Text('Yes'),
              onPressed: () {
                Navigator.of(context).pop(true);
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: const Text('No'),
              onPressed: () {
                Navigator.of(context).pop(false);
              },
            ),
          ],
        );
      },
    );
  }

  Widget createNotesList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final action = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ActionItemBody(
                      actionItemId: action!.id,
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
                        subtitle: Text("Status:" + action!.status,
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

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
        context: context,
        //initialDate: selectedDate,
        firstDate: DateTime(2015, 8),
        lastDate: DateTime(2101));
    if (picked != null && picked != selectedDate) {
      setState(() {
        _duedateController.text = DateFormat.yMMMEd().format(picked);
        selectedDate = picked;
      });
    }
  }

  FutureBuilder<List<Person>> buildAssigneeSelection(BuildContext context) {
    return FutureBuilder(
        future: assignees,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return DropdownButtonFormField(
                key: dropdownState,
                value: selectedAssignee,
                decoration: inputDecoration(
                    prefixIcon: Icon(Icons.email_outlined),
                    //hintText: 'Sediment Control',
                    labelText: 'Assigned To'),
                items: snapshot.data!
                    .map<DropdownMenuItem<String>>(
                        (Person item) => DropdownMenuItem<String>(
                              value: item.id,
                              child: Text(item.firstName + " " + item.lastName),
                            ))
                    .toList(),
                onChanged: (value) {
                  selectedAssignee = value!;
                  setState(() {});
                });
          } else {
            return CircularProgressIndicator();
          }
        });
  }

  Widget buildPrioritySelection(BuildContext context) {
    return DropdownButtonFormField(
      decoration: inputDecoration(
          prefixIcon: Icon(Icons.priority_high),
          //hintText: 'What action needs to be taken?',
          labelText: 'Priority'),
      //isExpanded: true,
      value: selectedPriority,
      items: priotityItems
          .map<DropdownMenuItem<PriorityItem>>(
              (PriorityItem item) => DropdownMenuItem<PriorityItem>(
                    value: item,
                    child: Center(child: Text(item.name)),
                  ))
          .toList(),
      onChanged: (PriorityItem? value) =>
          setState(() => selectedPriority = value!),
    );
  }

  Widget buildStatusSelection(BuildContext context) {
    return FutureBuilder(
        future: actionItemFuture,
        builder: (context, snapshot) {
          return DropdownMenu<ColoredStatusLabel>(
            initialSelection: selectedColor,
            controller: colorController,
            // requestFocusOnTap is enabled/disabled by platforms when it is null.
            // On mobile platforms, this is false by default. Setting this to true will
            // trigger focus request on the text field and virtual keyboard will appear
            // afterward. On desktop platforms however, this defaults to true.
            requestFocusOnTap: true,
            label: const Text('Status'),
            onSelected: (ColoredStatusLabel? color) {
              setState(() {
                selectedColor = color;
              });
            },
            dropdownMenuEntries: ColoredStatusLabel.values
                .map<DropdownMenuEntry<ColoredStatusLabel>>(
                    (ColoredStatusLabel color) {
              return DropdownMenuEntry<ColoredStatusLabel>(
                value: color,
                label: color.label,
                style: MenuItemButton.styleFrom(
                  foregroundColor: color.color,
                ),
              );
            }).toList(),
          );
        });
  }
}
