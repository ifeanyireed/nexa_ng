import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/api_service.dart';
import '../services/telemetry_service.dart';

enum DeliveryPhase {
  inTransit,
  arrived,
  completed,
}

class NavigationDropoffScreen extends StatefulWidget {
  final String orderId;
  final String recipientName;
  final String recipientPhone;
  final String dropoffAddress;
  final String pickupAddress;
  final String orderDetails;
  final String deliveryFee;
  final String trackingNumber;
  final double dropoffLat;
  final double dropoffLng;

  const NavigationDropoffScreen({
    super.key,
    required this.orderId,
    this.trackingNumber = '',
    this.recipientName = 'Recipient',
    this.recipientPhone = '',
    this.dropoffAddress = '',
    this.pickupAddress = '',
    this.orderDetails = '',
    this.deliveryFee = '₦0.00',
    this.dropoffLat = 6.4520,
    this.dropoffLng = 3.4735,
  });

  @override
  State<NavigationDropoffScreen> createState() => _NavigationDropoffScreenState();
}

class _NavigationDropoffScreenState extends State<NavigationDropoffScreen> {
  GoogleMapController? _mapController;
  MapType _currentMapType = MapType.normal;
  bool _trafficEnabled = true;
  DeliveryPhase _phase = DeliveryPhase.inTransit;

  @override
  void initState() {
    super.initState();
    TelemetryService().setTripActive(true, jobId: widget.orderId);
  }

  @override
  void dispose() {
    TelemetryService().setTripActive(false);
    super.dispose();
  }

  // Realistic Lekki Phase 1 Lagos delivery coordinates
  static const LatLng _riderPosition = LatLng(6.4425, 3.4610); // En route on Lekki-Epe expressway
  static const LatLng _dropoffPosition = LatLng(6.4520, 3.4735); // 15 Admiralty Way, Lekki
  static const LatLng _waypoint1 = LatLng(6.4460, 3.4660);
  static const LatLng _waypoint2 = LatLng(6.4495, 3.4705);

  final CameraPosition _initialCameraPosition = const CameraPosition(
    target: LatLng(6.4470, 3.4670),
    zoom: 14.8,
    tilt: 35.0,
  );

  final List<LatLng> _routePoints = const [
    _riderPosition,
    _waypoint1,
    _waypoint2,
    _dropoffPosition,
  ];

  Set<Marker> _buildMarkers() {
    final destPosition = LatLng(widget.dropoffLat, widget.dropoffLng);
    return {
      Marker(
        markerId: const MarkerId('rider_courier'),
        position: _riderPosition,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        infoWindow: const InfoWindow(
          title: 'Courier Active Delivery',
          snippet: 'Live GPS Telemetry Connected',
        ),
      ),
      Marker(
        markerId: const MarkerId('dropoff_destination'),
        position: destPosition,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(
          title: 'Drop-off: ${widget.recipientName}',
          snippet: widget.dropoffAddress,
        ),
      ),
    };
  }

  Set<Polyline> _buildPolylines() {
    return {
      // Glow background line
      Polyline(
        polylineId: const PolylineId('route_glow'),
        points: _routePoints,
        color: const Color(0xFF146EF5).withValues(alpha: 0.3),
        width: 10,
      ),
      // Main navigation active line
      Polyline(
        polylineId: const PolylineId('route_main'),
        points: _routePoints,
        color: const Color(0xFF146EF5),
        width: 5,
        jointType: JointType.round,
        startCap: Cap.roundCap,
        endCap: Cap.roundCap,
      ),
    };
  }

  void _recenterCamera() {
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        const CameraPosition(
          target: LatLng(6.4470, 3.4670),
          zoom: 15.2,
          tilt: 40.0,
          bearing: 45.0,
        ),
      ),
    );
  }

  void _toggleMapType() {
    setState(() {
      _currentMapType = _currentMapType == MapType.normal ? MapType.hybrid : MapType.normal;
    });
  }

  void _showCallCustomerModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF146EF5).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.phone_in_talk_rounded, color: Color(0xFF146EF5), size: 32),
            ),
            const SizedBox(height: 16),
            Text(
              'Call ${widget.recipientName}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            Text(
              widget.recipientPhone,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF146EF5)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Customer is notified that you are en route with order items.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: Color(0xFFCBD5E1)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Dialing ${widget.recipientName} (${widget.recipientPhone})...'),
                          backgroundColor: const Color(0xFF146EF5),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    icon: const Icon(Icons.call, size: 18),
                    label: const Text('Call Now'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: const Color(0xFF146EF5),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showChatCustomerModal() {
    final textController = TextEditingController();
    final quickMessages = [
      'I am 5 minutes away from your location.',
      'I have arrived outside your gate/estate.',
      'Please confirm gate access code.',
      'Security has been notified.',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF146EF5), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Chat with ${widget.recipientName}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                ),
              ],
            ),
            const Divider(color: Color(0xFFF1F5F9)),
            const SizedBox(height: 8),
            const Text(
              'QUICK DISPATCH UPDATES',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B), letterSpacing: 0.6),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: quickMessages.map((msg) {
                return ActionChip(
                  label: Text(msg, style: const TextStyle(fontSize: 12, color: Color(0xFF1E293B))),
                  backgroundColor: const Color(0xFFF8FAFC),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  onPressed: () {
                    textController.text = msg;
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: textController,
                    decoration: InputDecoration(
                      hintText: 'Type a message to recipient...',
                      filled: true,
                      fillColor: const Color(0xFFF1F5F9),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                IconButton.filled(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Row(
                          children: [
                            Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                            SizedBox(width: 10),
                            Text('Message dispatched to customer!'),
                          ],
                        ),
                        backgroundColor: Color(0xFF16A34A),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  icon: const Icon(Icons.send_rounded, size: 20),
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFF146EF5)),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _showCompleteDeliveryDialog() {
    final pinController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.verified_rounded, color: Color(0xFF16A34A), size: 36),
            ),
            const SizedBox(height: 14),
            const Text(
              'Confirm Delivery Handover',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enter the 4-digit recipient verification PIN given to the customer to complete this order.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: 14, color: Color(0xFF146EF5)),
              decoration: InputDecoration(
                hintText: '••••',
                counterText: '',
                hintStyle: const TextStyle(fontSize: 26, letterSpacing: 14, color: Color(0xFFCBD5E1)),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF146EF5), width: 2),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.shield_outlined, size: 14, color: Color(0xFF146EF5)),
                const SizedBox(width: 4),
                Text(
                  'Enter 4-digit verification code from recipient',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () async {
                  final otp = pinController.text.trim();
                  if (otp.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Please enter the 4-digit verification code.'),
                        backgroundColor: Color(0xFFEF4444),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }

                  final res = await ApiService().deliverWithOtp(
                    jobId: widget.orderId,
                    otp: otp,
                    lat: _dropoffPosition.latitude,
                    lng: _dropoffPosition.longitude,
                  );

                  if (!ctx.mounted) return;

                  if (res['success'] == true) {
                    Navigator.pop(ctx);
                    setState(() {
                      _phase = DeliveryPhase.completed;
                    });
                    TelemetryService().setTripActive(false);
                    _showOrderSuccessSheet();
                  } else {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(
                        content: Text(res['error'] ?? 'Invalid Delivery OTP'),
                        backgroundColor: const Color(0xFFEF4444),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF16A34A),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text(
                  'Confirm & Release Earnings',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showOrderSuccessSheet() {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 48),
            ),
            const SizedBox(height: 18),
            const Text(
              'Delivery Completed!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 6),
            Text(
              'Order ${widget.orderId} successfully delivered to ${widget.recipientName}.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Rider Delivery Payout', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1E3A8A))),
                  Text(
                    '+${widget.deliveryFee}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF146EF5)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context); // Return to Dashboard
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF146EF5),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text(
                  'Back to Rider Dashboard',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // 1. Full-screen Google Map
          Positioned.fill(
            child: GoogleMap(
              initialCameraPosition: _initialCameraPosition,
              mapType: _currentMapType,
              trafficEnabled: _trafficEnabled,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              compassEnabled: true,
              markers: _buildMarkers(),
              polylines: _buildPolylines(),
              onMapCreated: (controller) {
                _mapController = controller;
              },
            ),
          ),

          // 2. Top Floating Navigation HUD (Turn-by-turn guidance)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Column(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Maneuver icon
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFF146EF5),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.turn_right_rounded,
                            color: Colors.white,
                            size: 30,
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'In 250m, Turn Right',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              SizedBox(height: 3),
                              Text(
                                'Admiralty Way • Lekki Phase 1',
                                style: TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Exit back button
                        Material(
                          color: Colors.white.withValues(alpha: 0.1),
                          shape: const CircleBorder(),
                          child: InkWell(
                            customBorder: const CircleBorder(),
                            onTap: () => Navigator.pop(context),
                            child: const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Icon(Icons.close_rounded, color: Colors.white, size: 20),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Route metrics badge
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.timer_rounded, size: 16, color: Color(0xFF146EF5)),
                            const SizedBox(width: 5),
                            const Text(
                              '6 mins',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(width: 10),
                            Container(width: 3, height: 3, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                            const SizedBox(width: 10),
                            const Icon(Icons.alt_route_rounded, size: 16, color: Color(0xFF10B981)),
                            const SizedBox(width: 5),
                            const Text(
                              '1.8 km',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(width: 10),
                            Container(width: 3, height: 3, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                            const SizedBox(width: 10),
                            const Text(
                              '32 km/h',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 3. Floating Side Map Controls
          Positioned(
            right: 16,
            bottom: 270,
            child: Column(
              children: [
                _buildFloatingTool(
                  icon: Icons.my_location_rounded,
                  tooltip: 'Recenter',
                  onTap: _recenterCamera,
                ),
                const SizedBox(height: 10),
                _buildFloatingTool(
                  icon: _currentMapType == MapType.normal ? Icons.layers_outlined : Icons.layers_rounded,
                  tooltip: 'Map Layer',
                  onTap: _toggleMapType,
                ),
                const SizedBox(height: 10),
                _buildFloatingTool(
                  icon: Icons.traffic_rounded,
                  color: _trafficEnabled ? const Color(0xFF10B981) : const Color(0xFF64748B),
                  tooltip: 'Traffic',
                  onTap: () {
                    setState(() => _trafficEnabled = !_trafficEnabled);
                  },
                ),
              ],
            ),
          ),

          // 4. Bottom Order Summary & Action Card
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x1F000000),
                    blurRadius: 24,
                    offset: Offset(0, -6),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Order status header
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _phase == DeliveryPhase.inTransit
                                ? const Color(0xFFFEF3C7)
                                : const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _phase == DeliveryPhase.inTransit ? 'IN TRANSIT TO DROPOFF' : 'ARRIVED AT DESTINATION',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: _phase == DeliveryPhase.inTransit
                                  ? const Color(0xFFD97706)
                                  : const Color(0xFF16A34A),
                            ),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          widget.orderId,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Recipient info row with contact shortcuts
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: const Color(0xFFDBEAFE),
                          child: Text(
                            widget.recipientName.isNotEmpty ? widget.recipientName[0] : 'C',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF1D4ED8)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.recipientName,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.orderDetails,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        // Call button
                        IconButton.filledTonal(
                          onPressed: _showCallCustomerModal,
                          icon: const Icon(Icons.phone_rounded, size: 20),
                          style: IconButton.styleFrom(
                            backgroundColor: const Color(0xFFEFF6FF),
                            foregroundColor: const Color(0xFF146EF5),
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Message button
                        IconButton.filledTonal(
                          onPressed: _showChatCustomerModal,
                          icon: const Icon(Icons.chat_bubble_rounded, size: 20),
                          style: IconButton.styleFrom(
                            backgroundColor: const Color(0xFFEFF6FF),
                            foregroundColor: const Color(0xFF146EF5),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 12),

                    // Destination Address
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.location_on_rounded, color: Color(0xFFEF4444), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Drop-off Destination',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.dropoffAddress,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Main Action Buttons
                    if (_phase == DeliveryPhase.inTransit) ...[
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            setState(() {
                              _phase = DeliveryPhase.arrived;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Arrived at drop-off! Notification sent to customer.'),
                                backgroundColor: Color(0xFF10B981),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          icon: const Icon(Icons.pin_drop_rounded, size: 20),
                          label: const Text(
                            'I Have Arrived at Drop-off',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF146EF5),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                    ] else ...[
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: _showCompleteDeliveryDialog,
                          icon: const Icon(Icons.verified_rounded, size: 20),
                          label: const Text(
                            'Complete Delivery (Verify OTP / Handover)',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF16A34A),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingTool({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
    Color color = const Color(0xFF0F172A),
  }) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      elevation: 4,
      shadowColor: Colors.black.withValues(alpha: 0.15),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Icon(icon, color: color, size: 22),
        ),
      ),
    );
  }
}
