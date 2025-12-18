// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';

// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

// Auth notifier
class AuthNotifier extends Notifier<AuthState> {
  late final AuthService _authService;

  @override
  AuthState build() {
    _authService = ref.read(authServiceProvider);
    _init();
    return const AuthState(isLoading: true);
  }

  Future<void> _init() async {
    try {
      final user = await _authService.getCurrentUser();
      state = AuthState(user: user, isLoading: false);

      // Initialize socket if user is already logged in
      if (user != null) {
        final token = await _authService.getToken();
        if (token != null) {
          print('🔐 Initializing socket with saved token');
          SocketService().initialize(token);
        }
      }
    } catch (e) {
      state = const AuthState(isLoading: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _authService.login(email, password);

    if (result.success) {
      state = AuthState(user: result.user, isLoading: false);

      // Initialize socket service with auth token
      if (result.token != null) {
        print('🔐 Initializing socket with auth token');
        SocketService().initialize(result.token!);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  Future<bool> register(
    String name,
    String email,
    String password,
    String role,
  ) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _authService.register(name, email, password, role);

    if (result.success) {
      state = AuthState(user: result.user, isLoading: false);

      // Initialize socket service with auth token
      if (result.token != null) {
        print('🔐 Initializing socket with auth token after registration');
        SocketService().initialize(result.token!);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _authService.signInWithGoogle();

    if (result.success) {
      state = AuthState(user: result.user, isLoading: false);

      // Initialize socket service with auth token
      if (result.token != null) {
        print('🔐 Initializing socket with auth token after Google sign-in');
        SocketService().initialize(result.token!);
      }

      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    final updatedUser = await _authService.updateProfile(data);
    if (updatedUser != null) {
      state = state.copyWith(user: updatedUser);
    }
  }

  Future<void> refreshUser() async {
    try {
      final user = await _authService.getCurrentUser();
      state = state.copyWith(user: user);
    } catch (e) {
      // Keep existing state on error
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

// Providers
final authServiceProvider = Provider((ref) => AuthService());

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});

// Convenience providers
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final isTeacherProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.isTeacher ?? false;
});
