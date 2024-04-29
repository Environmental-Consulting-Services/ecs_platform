import 'package:ecsd_mobile/screens/profile.dart';
import 'package:ecsd_mobile/screens/projects-list.dart';
import 'package:ecsd_mobile/screens/register.dart';
import 'package:ecsd_mobile/screens/settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/auth/auth_bloc.dart';
import 'package:ecsd_mobile/screens/agreement.dart';
import 'package:ecsd_mobile/screens/chat.dart';
import 'package:ecsd_mobile/screens/home.dart';
import 'package:ecsd_mobile/screens/login/login_screen.dart';
import 'package:ecsd_mobile/screens/notifications.dart';
import 'screens/about.dart';
import 'screens/project.dart';
import 'screens/notifications-settings.dart';
import 'screens/privacy.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
        create: (context) => AuthBloc(),
        child: MaterialApp(
            title: 'ECS D Mobile',
            theme: ThemeData(fontFamily: 'OpenSans'),
            initialRoute: "/home",
            debugShowCheckedModeBanner: false,
            routes: <String, WidgetBuilder>{
              //"/onboarding": (BuildContext context) => new Onboarding(),
              "/login": (BuildContext context) => new LoginScreen(),
              "/home": (BuildContext context) => new Home(),
              "/profile": (BuildContext context) => new Profile(),
              "/settings": (BuildContext context) => new Settings(),
              "/chat": (BuildContext context) => new Chat(),
              "/account": (BuildContext context) => new Register(),
              "/notifications": (BuildContext context) => new Notifications(),
              "/projects": (BuildContext context) => new ProjectList(),
              "/about": (BuildContext context) => new About(),
              "/agreement": (BuildContext context) => new UserAgreement(),
              "/notificationsettings": (BuildContext context) =>
                  new NotificationsSettings(),
              "/privacy": (BuildContext context) => new Privacy(),
              "/project": (BuildContext context) => new ProjectPage(),
            }));
  }
}
