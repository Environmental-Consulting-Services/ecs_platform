import 'package:authentication_repository/authentication_repository.dart';
import 'package:ecsd_mobile/screens/about.dart';
import 'package:ecsd_mobile/screens/agreement.dart';
import 'package:ecsd_mobile/screens/chat.dart';
import 'package:ecsd_mobile/screens/companies.dart';
import 'package:ecsd_mobile/screens/notifications-settings.dart';
import 'package:ecsd_mobile/screens/notifications.dart';
import 'package:ecsd_mobile/screens/privacy.dart';
import 'package:ecsd_mobile/screens/profile.dart';
import 'package:ecsd_mobile/screens/project.dart';
import 'package:ecsd_mobile/screens/projects-list.dart';
import 'package:ecsd_mobile/screens/register.dart';
import 'package:ecsd_mobile/screens/settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ecsd_mobile/authentication/authentication.dart';
import 'package:ecsd_mobile/home/home.dart';
import 'package:ecsd_mobile/login/login.dart';
import 'package:ecsd_mobile/splash/splash.dart';
import 'package:user_repository/user_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  late final AuthenticationRepository _authenticationRepository;
  late final UserRepository _userRepository;

  @override
  void initState() {
    super.initState();
    _authenticationRepository = AuthenticationRepository();
    _userRepository = UserRepository();
  }

  @override
  void dispose() {
    _authenticationRepository.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider.value(
      value: _authenticationRepository,
      child: BlocProvider(
        create: (_) => AuthenticationBloc(
          authenticationRepository: _authenticationRepository,
          userRepository: _userRepository,
        ),
        child: const AppView(),
      ),
    );
  }
}

class AppView extends StatefulWidget {
  const AppView({super.key});

  @override
  State<AppView> createState() => _AppViewState();
}

class _AppViewState extends State<AppView> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  NavigatorState get _navigator => _navigatorKey.currentState!;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ECS D Mobile',
      theme: ThemeData(fontFamily: 'OpenSans'),
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      initialRoute: "/home",
      builder: (context, child) {
        return BlocListener<AuthenticationBloc, AuthenticationState>(
          listener: (context, state) {
            switch (state.status) {
              case AuthenticationStatus.authenticated:
                _navigator.pushAndRemoveUntil<void>(
                  Companies.route(),
                  (route) => false,
                );
              case AuthenticationStatus.unauthenticated:
                _navigator.pushAndRemoveUntil<void>(
                  LoginPage.route(),
                  (route) => false,
                );
              case AuthenticationStatus.unknown:
                break;
            }
          },
          child: child,
        );
      },
      routes: <String, WidgetBuilder>{
        //"/onboarding": (BuildContext context) => new Onboarding(),
        //"/login": (BuildContext context) => new LoginScreen(),
        "/home": (BuildContext context) => new Companies(),
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
      },
      onGenerateRoute: (_) => SplashPage.route(),
    );
  }
}
