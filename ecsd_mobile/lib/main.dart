import 'dart:io';

import 'package:ecsd_mobile/widgets/appstate.dart';
import 'package:flutter/widgets.dart';
import './app.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:developer';
import 'package:permission_handler/permission_handler.dart';

Future main() async {
  await dotenv.load(
    fileName: "assets/.env",
  );

  String host = dotenv.get('authhost');
  String portString = dotenv.get('authport');

  int port = int.parse(portString);
  String scheme = dotenv.get('authscheme');
  String apiPath = dotenv.get('authpath');

  await Permission.camera.request();
  await Permission.microphone.request();

  runApp(AppState(child: App()));
}
