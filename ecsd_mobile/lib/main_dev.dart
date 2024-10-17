import 'package:ecsd_mobile/widgets/appstate.dart';
import 'package:flutter/widgets.dart';
import './app.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future main() async {
  await dotenv.load(fileName: "assets/.env.dev");
  runApp(AppState(child: App()));
}
