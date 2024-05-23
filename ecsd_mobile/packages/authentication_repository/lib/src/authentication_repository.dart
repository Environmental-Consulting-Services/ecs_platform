import 'dart:async';
import 'authentication_service.dart';
import 'secure_storage_service.dart';

enum AuthenticationStatus { unknown, authenticated, unauthenticated }

class AuthenticationRepository {
  final _controller = StreamController<AuthenticationStatus>();

  Stream<AuthenticationStatus> get status async* {
    await Future<void>.delayed(const Duration(seconds: 1));
    yield AuthenticationStatus.unauthenticated;
    yield* _controller.stream;
  }

  Future<String> logIn({
    required String username,
    required String password,
  }) async {
    var authResults = await AuthenticationService.login(
      email: username,
      password: password,
    );

    if (authResults['access_token'] != null) {
      SecureStorageService.saveUserAccessToken(authResults['access_token']);
      _controller.add(AuthenticationStatus.authenticated);
    } else {
      _controller.add(AuthenticationStatus.unauthenticated);
    }

    return authResults['access_token'];
  }

  void logOut() {
    _controller.add(AuthenticationStatus.unauthenticated);
  }

  void dispose() => _controller.close();
}
