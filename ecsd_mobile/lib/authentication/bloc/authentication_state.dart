part of 'authentication_bloc.dart';

class AuthenticationState extends Equatable {
  const AuthenticationState._({
    this.status = AuthenticationStatus.unknown,
    this.user = User.empty,
    this.tokens = const {},
  });

  const AuthenticationState.unknown() : this._();

  const AuthenticationState.authenticated(User user)
      : this._(status: AuthenticationStatus.authenticated, user: user);

  const AuthenticationState.tokenAvailable(Map<String, String> tokens)
      : this._(status: AuthenticationStatus.authenticated, tokens: tokens);

  const AuthenticationState.unauthenticated()
      : this._(status: AuthenticationStatus.unauthenticated);

  final AuthenticationStatus status;
  final User user;
  final Map<String, String> tokens;

  @override
  List<Object> get props => [status, user, tokens];
}
