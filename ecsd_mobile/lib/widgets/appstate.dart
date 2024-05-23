import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:observable/observable.dart';

class AppState extends StatelessWidget {
  final Widget child;
  final ObservableMap _state = ObservableMap();

  AppState({required this.child});

  ObservableMap get state {
    return _state;
  }

  @override
  Widget build(BuildContext context) {
    _state['serveraddress'] = "app.ecscompliance.com";
    _state['serverport'] = "app.ecscompliance.com";

    return child;
  }
}
