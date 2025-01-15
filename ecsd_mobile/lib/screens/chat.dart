import 'dart:async';
import 'dart:convert';

import 'package:ecsd_mobile/model/message_model.dart';
import 'package:ecsd_mobile/model/user_model.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';
import 'package:flutter/material.dart';
import 'package:ecsd_mobile/constants/Theme.dart';
import 'package:ecsd_mobile/services/message_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
//widgets
import 'package:ecsd_mobile/widgets/navbars/navbar.dart';
import 'package:intl/intl.dart';
import '../widgets/drawer.dart';

class Chat extends StatefulWidget {
  const Chat({
    Key? key,
  }) : super(key: key);

  @override
  _ChatState createState() => _ChatState();
}

class _ChatState extends State<Chat> {
  late Future<List<MessageModel>> messagesFuture;
  late Future<User?> storedUser;
  late String userId;
  late Timer messageTimer;

  @override
  void initState() {
    final storedUser = SecureStorageService.getUser();

    storedUser.then((value) {
      userId = value!['id']!;
    });
    //need to make sure a thread exists for the user. If not, create one.
    //MessageModel.

    messagesFuture = getMessages();
    messageTimer = Timer.periodic(Duration(seconds: 3), (_) => _loadMessages());
    super.initState();
  }

  @override
  void dispose() {
    messageTimer.cancel();

    super.dispose();
  }

  _loadMessages() {
    var currentLength = 0;
    messagesFuture.then((value) {
      currentLength = value.length;
    }); 

    messagesFuture = getMessages();
    messagesFuture.then((value) {
      if (currentLength != value.length) {
        setState(() {});
         _scrollDown();
      }
    });

  }

  final TextEditingController controller = new TextEditingController();
  ScrollController _scrollController = new ScrollController();

  // function to fetch data from api and return future list of posts
  Future<List<MessageModel>> getMessages() async {
    Future<List<MessageModel>> messages = MessageService.loadMessages();
    return messages;
  }

  Future<List<MessageModel>> appendMessages(
      Future<List<MessageModel>> listFuture,
      List<MessageModel> elementsToAdd) async {
    final list = await listFuture;
    setState(() {
      list.addAll(elementsToAdd);
    });
    _scrollDown();


    return list;
  }

  _sendMessage(String message) {
    MessageModel messageModel = MessageModel.create();
    messageModel.message = message;
    messageModel.from = userId;
    messageModel.to = "expert";
    MessageService.saveMessage(messageModel);

    appendMessages(messagesFuture, [messageModel]);
    setState(() {
       _scrollDown();
    });
   

  }

  void _scrollDown() {
  _scrollController.jumpTo(_scrollController.position.maxScrollExtent);

  }

  Widget build(BuildContext context) {
    var messageListFutureBuilder = new FutureBuilder(
        future: messagesFuture,
        builder: (context, snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return Text('none');
            case ConnectionState.active:
            case ConnectionState.waiting:
              return Text('Loading...');
            case ConnectionState.done:
              return createMessageList(context, snapshot);

            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                return createMessageList(context, snapshot);
              }
          }
        });

    return Scaffold(
      appBar: Navbar(
        title: "Your Field Expert",
        backButton: false,
        getCurrentPage: () => "chat",
        tags: [],
        searchController: TextEditingController(),
        searchOnChanged: () {},
        rightOptions: false,
      ),
      floatingActionButton: FloatingActionButton.small(
        onPressed: _scrollDown,
        child: Icon(Icons.arrow_downward),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endTop,
      drawer: ArgonDrawer(currentPage: "chat"),
      body: Column(
        children: [
          Container(
            height: MediaQuery.of(context).size.height * 0.75,
            padding:
                const EdgeInsets.symmetric(horizontal: 8.0, vertical: 10.0),
            child: Align(
              alignment: Alignment.topCenter,
              child: messageListFutureBuilder,
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 15.0),
            child: Container(
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    blurRadius: 3,
                    offset: Offset(0, 1), // changes position of shadow
                  ),
                ],
              ),
              child: TextField(
                textInputAction: TextInputAction.send,
                onSubmitted: (value) {
                  _sendMessage(
                    value,
                  );
                   _scrollDown();

                  controller.text = "";
                },
                controller: controller,
                style: TextStyle(color: ArgonColors.black, fontSize: 16.0),
                cursorColor: ArgonColors.black,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: ArgonColors.white,
                  hintText: 'Message',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      width: 0,
                      style: BorderStyle.none,
                    ),
                  ),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 32.0, vertical: 15.0),

                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Future<Widget> getUserIcon() async {
    var user = await SecureStorageService.getUser();
    String? userFirstname = user?['firstName'];
    String? userLasstname = user?['lastName'];
    return new Text(userFirstname![0] + userLasstname![0]);
  }

  Widget createMessageList(BuildContext context, AsyncSnapshot snapshot) {
    return ListView.builder(
      scrollDirection: Axis.vertical,
      shrinkWrap: true,
      controller: _scrollController,
      itemCount: snapshot.data!.length,
      itemBuilder: (context, index) {
        final MessageModel message = snapshot.data?[index];

        if (message.from == userId) {
          return Padding(
            padding: const EdgeInsets.only(top: 15.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Flexible(
                    child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 8.0, vertical: 15.0),
                        decoration: BoxDecoration(
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                spreadRadius: 1,
                                blurRadius: 3,
                                offset:
                                    Offset(0, 3), // changes position of shadow
                              ),
                            ],
                            color: ArgonColors.primary,
                            borderRadius:
                                BorderRadius.all(Radius.circular(8.0))),
                        child: Text(
                          message.message.replaceAll(r'\n', '\n'),
                          style: TextStyle(color: ArgonColors.white),
                        )),
                    Padding(
                      padding: const EdgeInsets.only(top: 10.0),
                      child: Text(DateFormat.jm().format(message.created_at),
                          style: TextStyle(
                              color: ArgonColors.text, fontSize: 11.0)),
                    )
                  ],
                )),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10.0),
                  child: Container(
                    height: 35,
                    width: 35,
                    child: CircleAvatar(
                      child: Container(
                        child: Text("Me"),
                      ),
                      radius: 65.0,
                    ),
                  ),
                ),
              ],
            ),
          );
        } else {
          return Padding(
            padding: const EdgeInsets.only(top: 15.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10.0),
                  child: Container(
                    height: 35,
                    width: 35,
                    child: CircleAvatar(
                      child: Icon(Icons.auto_awesome),
                      radius: 65.0,
                    ),
                  ),
                ),
                Flexible(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 8.0, vertical: 15.0),
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.1),
                                  spreadRadius: 1,
                                  blurRadius: 3,
                                  offset: Offset(
                                      0, 3), // changes position of shadow
                                ),
                              ],
                              color: ArgonColors.inputSuccess,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          child: Flexible(
                              child: Text(
                            message.message.replaceAll(r'\n', '\n'),
                            style: TextStyle(color: ArgonColors.black),
                          ))),
                      Padding(
                        padding: const EdgeInsets.only(top: 10.0),
                        child: Text(DateFormat.jm().format(message.created_at),
                            style: TextStyle(
                                color: ArgonColors.text, fontSize: 11.0)),
                      )
                    ],
                  ),
                ),
              ],
            ),
          );
        }
      },
    );
  }
}
