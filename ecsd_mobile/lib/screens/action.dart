import 'package:ecsd_mobile/services/action_service.dart';
import 'package:flutter/material.dart';

import '../model/action_items.dart';

//widgets

class ActionWidget extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String actionId;

  const ActionWidget({Key? key, this.actionId = "22"}) : super(key: key);

  @override
  State<ActionWidget> createState() => _ActionWidgetState();
}

// homepage state
class _ActionWidgetState extends State<ActionWidget> {
  // variable to call and store future list of posts
  //String actionId = "0";

  late Future<ActionItemModel> actionFuture;

  // = getAction();

  // function to fetch data from api and return future list of posts
  Future<ActionItemModel> getAction(String actionId) async {
    Future<ActionItemModel> action = ActionService.loadAction(actionId);
    return action;
  }

  @override
  void initState() {
    super.initState();
    actionFuture = getAction(widget.actionId);
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future action
    return Container(
        padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
        child: SingleChildScrollView(
          child: Column(
            children: [
              Padding(
                  padding: const EdgeInsets.only(top: 10.0), child: SizedBox()),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Actions Scheduled: '),
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
                          '100',
                          maxLines: 1,
                          softWrap: false,
                          overflow: TextOverflow.fade,
                        ),
                        Text(
                          '2',
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
          ),
        ));
  }
}
