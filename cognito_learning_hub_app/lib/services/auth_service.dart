// lib/services/auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../models/user.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  final _api = ApiService();
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    // IMPORTANT: Use Web Client ID here (NOT Android Client ID)
    // Backend verifies idToken using this same Web Client ID
    serverClientId:
        '899719437468-o81tag3bm1h3470d98dtb5btfi906jki.apps.googleusercontent.com',
  );

  // Email/Password Login
  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _api.post(
        Endpoints.login,
        data: {'email': email, 'password': password},
      );

      // Response structure: { success, message, data: { user, accessToken, refreshToken } }
      final responseData = response.data;
      final data = responseData['data'] ??
          responseData; // Handle nested or flat structure

      final token = data['accessToken'] ??
          data['token'] ??
          responseData['accessToken'] ??
          responseData['token'];
      final refreshToken = data['refreshToken'] ?? responseData['refreshToken'];
      final userData = data['user'] ?? responseData['user'];

      if (token == null) {
        return AuthResult(
            success: false, error: 'No token received from server');
      }

      await _api.saveToken(token, refreshToken: refreshToken);

      final user = User.fromJson(userData);
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      return AuthResult(success: false, error: _getErrorMessage(e));
    }
  }

  // Email/Password Register
  Future<AuthResult> register(
    String name,
    String email,
    String password,
    String role,
  ) async {
    try {
      final response = await _api.post(
        Endpoints.register,
        data: {
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        },
      );

      // Response structure: { success, message, data: { user, accessToken, refreshToken } }
      final responseData = response.data;
      final data = responseData['data'] ?? responseData;

      final token = data['accessToken'] ??
          data['token'] ??
          responseData['accessToken'] ??
          responseData['token'];
      final refreshToken = data['refreshToken'] ?? responseData['refreshToken'];
      final userData = data['user'] ?? responseData['user'];

      if (token == null) {
        return AuthResult(
            success: false, error: 'No token received from server');
      }

      await _api.saveToken(token, refreshToken: refreshToken);

      final user = User.fromJson(userData);
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      return AuthResult(success: false, error: _getErrorMessage(e));
    }
  }

  // Google Sign In
  Future<AuthResult> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return AuthResult(success: false, error: 'Google sign in cancelled');
      }

      final googleAuth = await googleUser.authentication;

      // Debug logging
      print('🔐 Google Auth - Email: ${googleUser.email}');
      print('🔐 Google Auth - Display Name: ${googleUser.displayName}');
      print('🔐 Google Auth - ID: ${googleUser.id}');
      print(
          '🔐 Google Auth - idToken available: ${googleAuth.idToken != null}');
      print(
          '🔐 Google Auth - accessToken available: ${googleAuth.accessToken != null}');

      if (googleAuth.idToken == null || googleAuth.idToken!.isEmpty) {
        // Without serverClientId, we won't get idToken - that's expected
        return AuthResult(
            success: false,
            error:
                'Google Sign-In successful but backend authentication not configured.\n\n'
                'See GOOGLE_SIGNIN_SETUP.md for instructions.');
      }

      // Backend expects 'credential' with the idToken
      final response = await _api.post(
        Endpoints.googleAuth,
        data: {
          'credential': googleAuth.idToken,
        },
      );

      // Response structure: { success, message, data: { user, accessToken, refreshToken } }
      final responseData = response.data;
      final data = responseData['data'] ?? responseData;

      final token = data['accessToken'] ??
          data['token'] ??
          responseData['accessToken'] ??
          responseData['token'];
      final refreshToken = data['refreshToken'] ?? responseData['refreshToken'];
      final userData = data['user'] ?? responseData['user'];

      if (token == null) {
        return AuthResult(
            success: false, error: 'No token received from server');
      }

      await _api.saveToken(token, refreshToken: refreshToken);

      final user = User.fromJson(userData);
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      return AuthResult(success: false, error: _getErrorMessage(e));
    }
  }

  // Check if user is logged in
  Future<User?> getCurrentUser() async {
    try {
      final token = await _storage.read(key: 'auth_token');

      if (token == null) return null;

      // Check if token is expired
      if (JwtDecoder.isExpired(token)) {
        await _api.clearTokens();
        return null;
      }

      // Get fresh user data from server using /api/auth/me endpoint
      final response = await _api.get('/api/auth/me');

      // Handle nested data structure
      final responseData = response.data;
      final data = responseData['data'] ?? responseData;
      final userData = data['user'] ?? responseData['user'] ?? data;

      final user = User.fromJson(userData);
      return user;
    } catch (e) {
      // If we get a 500 error or any auth error, clear the invalid token
      if (e.toString().contains('500') ||
          e.toString().contains('401') ||
          e.toString().contains('403')) {
        await _api.clearTokens();
      }
      return null;
    }
  }

  // Logout
  Future<void> logout() async {
    await _api.clearTokens();
    await _googleSignIn.signOut();
  }

  // Get stored token
  Future<String?> getToken() => _storage.read(key: 'auth_token');

  // Update profile
  Future<User?> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _api.patch(Endpoints.profile, data: data);
      return User.fromJson(response.data['user']);
    } catch (e) {
      return null;
    }
  }

  String _getErrorMessage(dynamic error) {
    print('🔍 Parsing error: $error');
    print('🔍 Error type: ${error.runtimeType}');

    try {
      // Check if it's a DioException
      if (error.toString().contains('DioException')) {
        final dioError = error;
        final response = dioError.response;

        print('🔍 Response status: ${response?.statusCode}');
        print('🔍 Response data: ${response?.data}');

        if (response?.data != null) {
          // Try to get message from response
          if (response.data is Map) {
            if (response.data['message'] != null) {
              return response.data['message'];
            }
            if (response.data['error'] != null) {
              return response.data['error'];
            }
          }
          if (response.data is String) {
            return response.data;
          }
        }

        // Return status-based message
        switch (response?.statusCode) {
          case 400:
            return 'Invalid request. Please check your input.';
          case 401:
            return 'Invalid email or password.';
          case 403:
            return 'Access denied.';
          case 404:
            return 'Service not found. Please try again later.';
          case 500:
            return 'Server error. Please try again later.';
          case 503:
            return 'Service unavailable. Please try again later.';
          default:
            return 'Connection failed (${response?.statusCode}). Please check your internet.';
        }
      }
    } catch (e) {
      print('🔍 Error parsing failed: $e');
    }

    // Check for network errors
    if (error.toString().contains('SocketException') ||
        error.toString().contains('Connection refused')) {
      return 'Cannot connect to server. Please check your internet connection.';
    }

    return 'An error occurred. Please try again.';
  }
}

class AuthResult {
  final bool success;
  final User? user;
  final String? token;
  final String? error;

  AuthResult({required this.success, this.user, this.token, this.error});
}
