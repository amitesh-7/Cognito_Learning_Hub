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
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

  // Email/Password Login
  Future<AuthResult> login(String email, String password) async {
    try {
      print('🔐 Attempting login for: $email');
      print('🌐 API URL: ${ApiConfig.apiUrl}');

      final response = await _api.post(
        Endpoints.login,
        data: {'email': email, 'password': password},
      );

      print('📥 Login response: ${response.data}');

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
        print('❌ No token in response. Data structure: $responseData');
        return AuthResult(
            success: false, error: 'No token received from server');
      }

      await _api.saveToken(token, refreshToken: refreshToken);

      final user = User.fromJson(userData);
      print('✅ Login successful for: ${user.email}');
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      print('❌ Login error: $e');
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
      print('📝 Attempting registration for: $email');

      final response = await _api.post(
        Endpoints.register,
        data: {
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        },
      );

      print('📥 Register response: ${response.data}');

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
      print('✅ Registration successful for: ${user.email}');
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      print('❌ Registration error: $e');
      return AuthResult(success: false, error: _getErrorMessage(e));
    }
  }

  // Google Sign In
  Future<AuthResult> signInWithGoogle() async {
    try {
      print('🔐 Starting Google Sign In...');

      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return AuthResult(success: false, error: 'Google sign in cancelled');
      }

      final googleAuth = await googleUser.authentication;
      print('📱 Got Google auth, sending to backend...');

      // Backend expects 'credential' with the idToken
      final response = await _api.post(
        Endpoints.googleAuth,
        data: {
          'credential': googleAuth.idToken,
        },
      );

      print('📥 Google auth response: ${response.data}');

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
      print('✅ Google sign in successful for: ${user.email}');
      return AuthResult(success: true, user: user, token: token);
    } catch (e) {
      print('❌ Google sign in error: $e');
      return AuthResult(success: false, error: _getErrorMessage(e));
    }
  }

  // Check if user is logged in
  Future<User?> getCurrentUser() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      print('🔍 Checking current user, token exists: ${token != null}');

      if (token == null) return null;

      // Check if token is expired
      if (JwtDecoder.isExpired(token)) {
        print('⏰ Token expired, clearing...');
        await _api.clearTokens();
        return null;
      }

      // Get fresh user data from server using /api/auth/me endpoint
      print('📡 Fetching user profile...');
      final response = await _api.get('/api/auth/me');

      // Handle nested data structure
      final responseData = response.data;
      final data = responseData['data'] ?? responseData;
      final userData = data['user'] ?? responseData['user'] ?? data;

      final user = User.fromJson(userData);
      print('✅ Got user: ${user.email}');
      return user;
    } catch (e) {
      print('❌ getCurrentUser error: $e');
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
