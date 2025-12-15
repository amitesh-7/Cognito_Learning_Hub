// lib/services/api_service.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.apiUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to requests
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('🌐 REQUEST[${options.method}] => ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print(
            '✅ RESPONSE[${response.statusCode}] => ${response.requestOptions.path}',
          );
          return handler.next(response);
        },
        onError: (error, handler) async {
          print(
            '❌ ERROR[${error.response?.statusCode}] => ${error.requestOptions.path}',
          );

          // Handle 429 - Too Many Requests (Rate Limited by server or Cloudflare)
          if (error.response?.statusCode == 429) {
            final retryCount = error.requestOptions.extra['retryCount'] ?? 0;
            if (retryCount < 3) {
              // Wait with exponential backoff: 3s, 6s, 12s (longer for Cloudflare)
              final delay = Duration(seconds: 3 * (1 << retryCount));
              print(
                  '⏳ Rate limited. Retrying in ${delay.inSeconds}s (attempt ${retryCount + 1}/3)');
              await Future.delayed(delay);

              final opts = error.requestOptions;
              opts.extra['retryCount'] = retryCount + 1;

              try {
                final response = await _dio.fetch(opts);
                return handler.resolve(response);
              } catch (e) {
                return handler.next(error);
              }
            }
            print(
                '❌ Rate limit exceeded after 3 retries. Please wait a moment and try again.');
          }

          // Handle 401 - Token expired
          if (error.response?.statusCode == 401) {
            // Try to refresh token
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the original request
              final opts = error.requestOptions;
              final token = await _storage.read(key: 'auth_token');
              opts.headers['Authorization'] = 'Bearer $token';

              try {
                final response = await _dio.fetch(opts);
                return handler.resolve(response);
              } catch (e) {
                return handler.next(error);
              }
            }
          }

          return handler.next(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken == null) return false;

      final response = await _dio.post(
        Endpoints.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        await _storage.write(key: 'auth_token', value: response.data['token']);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Dio get dio => _dio;

  // Generic GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get(path, queryParameters: queryParameters, options: options);
  }

  // Generic POST request
  Future<Response> post(String path, {dynamic data, Options? options}) {
    return _dio.post(path, data: data, options: options);
  }

  // Generic PUT request
  Future<Response> put(String path, {dynamic data, Options? options}) {
    return _dio.put(path, data: data, options: options);
  }

  // Generic PATCH request
  Future<Response> patch(String path, {dynamic data, Options? options}) {
    return _dio.patch(path, data: data, options: options);
  }

  // Generic DELETE request
  Future<Response> delete(String path, {dynamic data, Options? options}) {
    return _dio.delete(path, data: data, options: options);
  }

  // Multipart file upload
  Future<Response> uploadFile(
    String path,
    String filePath,
    String fieldName, {
    Map<String, dynamic>? additionalData,
  }) async {
    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(filePath),
      if (additionalData != null) ...additionalData,
    });
    return _dio.post(path, data: formData);
  }

  // Save token
  Future<void> saveToken(String token, {String? refreshToken}) async {
    await _storage.write(key: 'auth_token', value: token);
    if (refreshToken != null) {
      await _storage.write(key: 'refresh_token', value: refreshToken);
    }
  }

  // Get token
  Future<String?> getToken() => _storage.read(key: 'auth_token');

  // Clear tokens
  Future<void> clearTokens() async {
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'refresh_token');
  }
}
