import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class TelemetryService {
  static final TelemetryService _instance = TelemetryService._internal();
  factory TelemetryService() => _instance;
  TelemetryService._internal();

  Timer? _telemetryTimer;
  bool _isTripActive = false;
  String? _activeJobId;
  bool _isRunning = false;

  bool get isRunning => _isRunning;
  bool get isTripActive => _isTripActive;

  /// Starts the GPS telemetry loop with 10s active / 30s idle cadences
  void start({bool isTripActive = false, String? activeJobId}) {
    _isTripActive = isTripActive;
    _activeJobId = activeJobId;
    _isRunning = true;
    _scheduleNextPing();
  }

  /// Updates current trip status dynamically (e.g. rider accepts job -> active)
  void setTripActive(bool active, {String? jobId}) {
    _isTripActive = active;
    _activeJobId = jobId;
    if (_isRunning) {
      _scheduleNextPing();
    }
  }

  /// Stops telemetry streaming
  void stop() {
    _telemetryTimer?.cancel();
    _telemetryTimer = null;
    _isRunning = false;
  }

  void _scheduleNextPing() {
    _telemetryTimer?.cancel();
    // 10s on active trips, 30s when idle / waiting as specified by user
    final interval = _isTripActive ? const Duration(seconds: 10) : const Duration(seconds: 30);

    _telemetryTimer = Timer.periodic(interval, (timer) async {
      await _broadcastCurrentLocation();
    });

    // Also fire immediate ping on status transition
    _broadcastCurrentLocation();
  }

  Future<void> _broadcastCurrentLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      await ApiService().sendTelemetry(
        latitude: position.latitude,
        longitude: position.longitude,
        heading: position.heading,
        speed: position.speed * 3.6, // convert m/s to km/h
        batteryPct: 90, // default battery status
        activeJobId: _activeJobId,
      );
    } catch (e) {
      // Fallback: ping simulated Lekki/VI coordinate in case of desktop or simulator without GPS
      await ApiService().sendTelemetry(
        latitude: 6.4698,
        longitude: 3.5852,
        heading: 90.0,
        speed: _isTripActive ? 28.5 : 0.0,
        batteryPct: 88,
        activeJobId: _activeJobId,
      );
    }
  }
}
