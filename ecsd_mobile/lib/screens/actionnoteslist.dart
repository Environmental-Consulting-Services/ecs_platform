import 'package:ecsd_mobile/model/notes_model.dart';
import 'package:flutter/material.dart';
import '../constants/Theme.dart';
import '../widgets/drawer.dart';
import '../widgets/navbars/navbar.dart';
import 'package:ecsd_mobile/services/action_service.dart';

class ActionItemNotesList extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String actionItemId;

  const ActionItemNotesList({Key? key, this.actionItemId = ""})
      : super(key: key);

  @override
  State<ActionItemNotesList> createState() => _ActionItemNotesListState();
}

// homepage state
class _ActionItemNotesListState extends State<ActionItemNotesList> {
  late Future<List<NotesModel>> notesFuture;

  // function to fetch data from api and return future list of posts
  Future<List<NotesModel>> getNotes(String companyId) async {
    Future<List<NotesModel>> notesList = ActionService.loadNotes(companyId);
    return notesList;
  }

  @override
  void initState() {
    notesFuture = getNotes(widget.actionItemId);
    super.initState();
  }

  void deleteNote(NotesModel note) async {
    await ActionService.deleteNote(widget.actionItemId, note).then((value) {
      notesFuture.then((noteList) {
        noteList.where((element) => element.id != note.id).toList();
        setState(() {});
      });
    });

    notesFuture.then((value) {
      value.remove(note);
      setState(() {});
    });
  }

  void addNote(String note) async {
    NotesModel newNoteModel = NotesModel.create();

    newNoteModel.note = note;

    await ActionService.saveNote(widget.actionItemId, newNoteModel)
        .then((savedNotes) {
      notesFuture = getNotes(widget.actionItemId);
      setState(() {});
    });
  }

  Widget createNotesList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      physics: AlwaysScrollableScrollPhysics(),
      scrollDirection: Axis.vertical,
      shrinkWrap: true,
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final note = snapshot.data?[index];
        return Card(
          child: Container(
            padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
            child: Column(
              children: [
                Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: ListTile(
                        title: Text(note!.note,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 22)),
                        subtitle: Text("Date:" + note.created_at.toString(),
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 10)))),
                Material(
                  type: MaterialType.transparency,
                  child: InkWell(
                    onTap: () async {
                      await showDialog<void>(
                          context: context,
                          builder: (context) => AlertDialog(
                                title: const Text('Delete Note'),
                                actions: [
                                  ElevatedButton(
                                    child: const Text('Close'),
                                    onPressed: () {
                                      Navigator.of(context, rootNavigator: true)
                                          .pop('dialog');
                                    },
                                  ),
                                  ElevatedButton(
                                      child: const Text('Delete Note'),
                                      onPressed: () => {
                                            deleteNote(note),
                                            Navigator.of(context,
                                                    rootNavigator: true)
                                                .pop('dialog')
                                          }),
                                ],
                              ));
                    },
                    child: Text("Delete Note"),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    var projectListFutureBuilder = new FutureBuilder(
        future: notesFuture,
        builder: (context, snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return Text('none');
            case ConnectionState.active:
            case ConnectionState.waiting:
              return Text('Loading...');
            case ConnectionState.done:
              if (snapshot.hasError) {
                return Text('No Notes Found');
              } else {
                return createNotesList(context, snapshot);
              }
            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                return createNotesList(context, snapshot);
              }
          }
        });

    final _noteFormKey = GlobalKey<FormState>();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(),
        Container(
          child: projectListFutureBuilder,
        ),
        Positioned(
            right: 20,
            bottom: 20,
            child: Align(
                alignment: Alignment.bottomRight,
                child: FloatingActionButton(
                  child: Icon(Icons.note_add_rounded),
                  tooltip: 'Add Note',
                  onPressed: () async {
                    await showDialog<void>(
                        context: context,
                        builder: (context) => AlertDialog(
                              title: const Text('New Note'),
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
                                  child: const Text('Add Note'),
                                  onPressed: () {
                                    if (_noteFormKey.currentState!.validate()) {
                                      _noteFormKey.currentState!.save();
                                      Navigator.of(context).pop();
                                    }
                                  },
                                ),
                              ],
                              content: Stack(
                                clipBehavior: Clip.none,
                                children: <Widget>[
                                  Form(
                                    key: _noteFormKey,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: TextFormField(
                                            autofocus: true,
                                            decoration: const InputDecoration(
                                              labelText: 'Note',
                                            ),
                                            validator: (value) {
                                              if (value == null ||
                                                  value.isEmpty) {
                                                return 'Please enter a note';
                                              }
                                              return null;
                                            },
                                            onSaved: (value) {
                                              addNote(value ?? "");
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

    /* 
    ); */
  }
}
