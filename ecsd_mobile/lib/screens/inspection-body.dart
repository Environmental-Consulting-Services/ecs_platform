import 'package:ecsd_mobile/model/inspection_model.dart';
import 'package:ecsd_mobile/services/inspection_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class InspectionBody extends StatefulWidget {
  //final double height = window.physicalSize.height;
  final String inspectionId;
  final Size preferredSize = const Size.fromHeight(58.0);

  const InspectionBody({Key? key, required this.inspectionId})
      : super(key: key);

  @override
  State<InspectionBody> createState() => new _InspectionBodyState(inspectionId);
}

// homepage state
class _InspectionBodyState extends State<InspectionBody> {
  // variable to call and store future list of posts
  //String inspectionId = "0";

  _InspectionBodyState(String inspectionId);

  late Future<InspectionModel> inspectionFuture;

  // function to fetch data from api and return future list of posts
  Future<InspectionModel> getInspection(String inspectionId) async {
    Future<InspectionModel> inspection =
        InspectionService.loadInspection(inspectionId);
    return inspection;
  }

  @override
  void initState() {
    inspectionFuture = getInspection(widget.inspectionId);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // variable to call and store future inspection

    return Container(
      child: inspectionWidget(),
      /*  Container(
            padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
            child: SingleChildScrollView(
              child: getPageWidget(),
            )) */
    );
  }

  Widget inspectionWidget() {
    return Column(
      children: [
        Padding(padding: const EdgeInsets.only(top: 10.0), child: SizedBox()),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Inspections Scheduled: '),
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
