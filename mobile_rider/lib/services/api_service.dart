import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/rider_models.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String get defaultBaseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8085/api/v1/logistics';
    }
    return 'http://localhost:8085/api/v1/logistics';
  }

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('api_base_url') ?? defaultBaseUrl;
  }

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('rider_jwt_token') ?? '';
    final tenantSlug = prefs.getString('rider_tenant_slug') ?? '';
    final orgId = prefs.getString('rider_org_id') ?? tenantSlug;
    final riderId = prefs.getString('rider_id') ?? '';

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant-Slug': tenantSlug,
      'X-Org-ID': orgId,
      'X-Rider-ID': riderId,
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  /// Automatically resolves all tenant organizations a courier is registered to via their phone number
  Future<Map<String, dynamic>> lookupRiderByPhone(String phone) async {
    final baseUrl = await getBaseUrl();
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/lookup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone}),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final List<dynamic> rawWorkspaces = data['workspaces'] ?? [];
        final workspaces = rawWorkspaces.map((w) => RiderWorkspace.fromJson(w)).toList();
        return {
          'success': true,
          'rider_name': data['rider_name'] ?? '',
          'workspaces': workspaces,
        };
      }
      final data = jsonDecode(res.body);
      return {'success': false, 'error': data['error'] ?? 'No registered workspaces found for this phone number'};
    } catch (e) {
      return {'success': false, 'error': 'Failed to connect to logistics service: $e'};
    }
  }

  /// Authenticates rider into their tenant organization and saves credentials
  Future<Map<String, dynamic>> loginRider({
    required String phone,
    required String pin,
    required RiderWorkspace workspace,
  }) async {
    final baseUrl = await getBaseUrl();
    final prefs = await SharedPreferences.getInstance();

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/login'),
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': workspace.tenantSlug,
          'X-Org-ID': workspace.orgId,
        },
        body: jsonEncode({
          'phone': phone,
          'pin': pin,
          'tenant_slug': workspace.tenantSlug,
        }),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['token'] ?? '';

        await prefs.setString('rider_jwt_token', token);
        await prefs.setString('rider_phone', phone);
        await prefs.setString('rider_id', workspace.riderId);
        await prefs.setString('rider_name', workspace.riderName);
        await prefs.setString('rider_tenant_slug', workspace.tenantSlug);
        await prefs.setString('rider_org_id', workspace.orgId);
        await prefs.setString('rider_tenant_name', workspace.tenantName);
        await prefs.setString('rider_primary_color', workspace.primaryColor);
        await prefs.setString('rider_plate_number', workspace.plateNumber);
        await prefs.setString('rider_vehicle_type', workspace.vehicleType);

        return {'success': true, 'token': token};
      }
      final err = jsonDecode(res.body);
      return {'success': false, 'error': err['error'] ?? 'Login failed'};
    } catch (e) {
      return {'success': false, 'error': 'Login error: $e'};
    }
  }

  /// Fetches active delivery assignment for current rider
  Future<RiderJob?> getActiveJob() async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();

    try {
      final res = await http.get(Uri.parse('$baseUrl/rider/active-job'), headers: headers);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['has_active'] == true && data['job'] != null) {
          return RiderJob.fromJson(data['job']);
        }
      }
    } catch (e) {
      // Fallback active job for demonstration
    }
    return null;
  }

  /// Fetches incoming job offers for the rider's tenant
  Future<List<RiderJob>> getJobOffers() async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();

    try {
      final res = await http.get(Uri.parse('$baseUrl/rider/offers'), headers: headers);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final List<dynamic> list = data['offers'] ?? [];
        return list.map((item) => RiderJob.fromJson(item)).toList();
      }
    } catch (e) {
      // Ignore
    }
    return [];
  }

  /// Accepts a job offer
  Future<bool> acceptJob(String jobId) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final prefs = await SharedPreferences.getInstance();
    final riderId = prefs.getString('rider_id') ?? '';

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/jobs/$jobId/accept'),
        headers: headers,
        body: jsonEncode({'rider_id': riderId}),
      );
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Confirms pickup from origin point
  Future<bool> confirmPickup(String jobId, {double lat = 0.0, double lng = 0.0}) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/jobs/$jobId/pickup'),
        headers: headers,
        body: jsonEncode({'latitude': lat, 'longitude': lng, 'notes': 'Package verified & sealed'}),
      );
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Strictly validates Proof-of-Delivery OTP to complete delivery
  Future<Map<String, dynamic>> deliverWithOtp({
    required String jobId,
    required String otp,
    double lat = 0.0,
    double lng = 0.0,
    String notes = '',
  }) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/jobs/$jobId/deliver'),
        headers: headers,
        body: jsonEncode({
          'otp': otp,
          'latitude': lat,
          'longitude': lng,
          'notes': notes,
        }),
      );

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'message': data['message']};
      }
      return {'success': false, 'error': data['error'] ?? 'Incorrect OTP code'};
    } catch (e) {
      return {'success': false, 'error': 'Failed to verify Delivery OTP: $e'};
    }
  }

  /// Ingests live rider GPS telemetry (10s on trip, 30s idle)
  Future<void> sendTelemetry({
    required double latitude,
    required double longitude,
    required double heading,
    required double speed,
    required int batteryPct,
    String? activeJobId,
  }) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final prefs = await SharedPreferences.getInstance();
    final riderId = prefs.getString('rider_id') ?? '';

    if (riderId.isEmpty) return;

    try {
      await http.post(
        Uri.parse('$baseUrl/rider/telemetry'),
        headers: headers,
        body: jsonEncode({
          'courier_id': riderId,
          'latitude': latitude,
          'longitude': longitude,
          'heading': heading,
          'speed': speed,
          'battery_pct': batteryPct,
          'active_job_id': activeJobId ?? '',
        }),
      );
    } catch (e) {
      // Silent telemetry catch
    }
  }

  /// Updates shift status (AVAILABLE, OFFLINE)
  Future<void> updateShiftStatus(String status) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final prefs = await SharedPreferences.getInstance();
    final riderId = prefs.getString('rider_id') ?? '';

    try {
      await http.patch(
        Uri.parse('$baseUrl/rider/status'),
        headers: headers,
        body: jsonEncode({'rider_id': riderId, 'status': status}),
      );
    } catch (e) {
      // Ignore
    }
  }

  /// Fetches rider profile including today's earnings and completed count
  Future<Map<String, dynamic>> getRiderProfile() async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final res = await http.get(Uri.parse('$baseUrl/rider/profile'), headers: headers);
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      // Ignore
    }
    return {'success': false};
  }

  /// Fetches full performance metrics and recent delivery history
  Future<Map<String, dynamic>> getRiderPerformance() async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final res = await http.get(Uri.parse('$baseUrl/rider/performance'), headers: headers);
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      // Ignore
    }
    return {'success': false};
  }

  /// Updates rider profile details persistently
  Future<bool> updateRiderProfile({
    required String name,
    required String phone,
    String email = '',
    String address = '',
    String emergencyContact = '',
    String plateNumber = '',
    String vehicleType = '',
  }) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    final prefs = await SharedPreferences.getInstance();
    final riderId = prefs.getString('rider_id') ?? '';

    try {
      final res = await http.put(
        Uri.parse('$baseUrl/rider/profile'),
        headers: headers,
        body: jsonEncode({
          'rider_id': riderId,
          'name': name,
          'phone': phone,
          'email': email,
          'address': address,
          'emergency_contact': emergencyContact,
          'plate_number': plateNumber,
          'vehicle_type': vehicleType,
        }),
      );
      if (res.statusCode == 200) {
        await prefs.setString('rider_name', name);
        await prefs.setString('rider_phone', phone);
        if (email.isNotEmpty) await prefs.setString('rider_email', email);
        if (address.isNotEmpty) await prefs.setString('rider_address', address);
        if (emergencyContact.isNotEmpty) await prefs.setString('rider_emergency_contact', emergencyContact);
        if (plateNumber.isNotEmpty) await prefs.setString('rider_plate_number', plateNumber);
        if (vehicleType.isNotEmpty) await prefs.setString('rider_vehicle_type', vehicleType);
        return true;
      }
    } catch (e) {
      // Ignore
    }
    return false;
  }

  /// Fetches verified payout bank accounts
  Future<List<Map<String, dynamic>>> getPayoutMethods() async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final res = await http.get(Uri.parse('$baseUrl/rider/payout-methods'), headers: headers);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final List<dynamic> list = data['accounts'] ?? [];
        return list.map((a) => Map<String, dynamic>.from(a as Map)).toList();
      }
    } catch (e) {
      // Ignore
    }
    return [];
  }

  /// Adds a new verified payout bank account
  Future<Map<String, dynamic>> addPayoutMethod({
    required String bankName,
    required String bankCode,
    required String accountNumber,
    required String accountName,
    bool isPrimary = false,
  }) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/rider/payout-methods'),
        headers: headers,
        body: jsonEncode({
          'bank_name': bankName,
          'bank_code': bankCode,
          'account_number': accountNumber,
          'account_name': accountName,
          'is_primary': isPrimary,
        }),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      // Ignore
    }
    return {'success': false, 'error': 'Failed to connect to banking network'};
  }

  /// Removes a payout bank account
  Future<bool> deletePayoutMethod(String accountId) async {
    final baseUrl = await getBaseUrl();
    final headers = await _getHeaders();
    try {
      final res = await http.delete(Uri.parse('$baseUrl/rider/payout-methods/$accountId'), headers: headers);
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
