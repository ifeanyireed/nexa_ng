import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/icon_util.dart';
import '../models/rider_models.dart';
import '../services/api_service.dart';
import 'navigation_dropoff_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int)? onNavigateToTab;

  const DashboardScreen({super.key, this.onNavigateToTab});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _riderName = 'Rider';
  String _tenantName = 'Logistics Workspace';
  String _vehicleInfo = 'Fleet Unit';
  bool _isShiftActive = true;
  bool _isLoading = true;
  RiderJob? _activeJob;

  int _completedToday = 0;
  double _earnedToday = 0.0;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();

    final savedName = prefs.getString('rider_name');
    final savedTenant = prefs.getString('rider_tenant_name');
    final savedVehicle = prefs.getString('rider_vehicle_type');
    final savedPlate = prefs.getString('rider_plate_number');

    if (savedName != null) _riderName = savedName;
    if (savedTenant != null) _tenantName = savedTenant;
    if (savedVehicle != null && savedPlate != null) {
      _vehicleInfo = '$savedVehicle • $savedPlate';
    }

    final job = await ApiService().getActiveJob();
    final profileRes = await ApiService().getRiderProfile();

    if (!mounted) return;

    setState(() {
      _activeJob = job;
      if (profileRes['success'] == true) {
        if (profileRes['completed_today'] != null) {
          _completedToday = (profileRes['completed_today'] as num).toInt();
        }
        if (profileRes['earned_today'] != null) {
          _earnedToday = (profileRes['earned_today'] as num).toDouble();
        }
        final rider = profileRes['rider'];
        if (rider != null) {
          if (rider['name'] != null && (rider['name'] as String).isNotEmpty) {
            _riderName = rider['name'];
          }
          if (rider['vehicle_type'] != null && rider['plate_number'] != null) {
            _vehicleInfo = '${rider['vehicle_type']} • ${rider['plate_number']}';
          }
          if (rider['status'] != null) {
            _isShiftActive = rider['status'] == 'AVAILABLE' || rider['status'] == 'ON_TRIP';
          }
        }
      }
      _isLoading = false;
    });
  }

  Future<void> _toggleShift() async {
    final nextStatus = !_isShiftActive;
    setState(() => _isShiftActive = nextStatus);
    await ApiService().updateShiftStatus(nextStatus ? 'AVAILABLE' : 'OFFLINE');
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(nextStatus ? 'Shift Online • Available for Dispatch' : 'Shift Offline • Not receiving offers'),
        backgroundColor: nextStatus ? const Color(0xFF10B981) : const Color(0xFF64748B),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Rider Dashboard',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            Text(
              _tenantName,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF146EF5)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(fixIcon(FlexIcon.remix.bellNotification), color: const Color(0xFF64748B)),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // RIDER STATUS BANNER
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF146EF5).withAlpha(45),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                    const BoxShadow(
                      color: Color(0x1F000000),
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: Image.asset(
                          'assets/images/abstract-blue-2.jpg',
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned.fill(
                        child: Container(color: Colors.black.withAlpha(75)),
                      ),
                      Positioned.fill(
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xCC0B132B), Colors.transparent],
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white.withAlpha(140), width: 2),
                                    boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 8, offset: Offset(0, 2))],
                                  ),
                                  child: const ClipOval(
                                    child: Icon(Icons.person, color: Colors.white, size: 26),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _riderName,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      Text(
                                        _vehicleInfo,
                                        style: const TextStyle(
                                          color: Color(0xFFCBD5E1),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _isShiftActive ? const Color(0xFF10B981) : Colors.grey.shade600,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 6,
                                        height: 6,
                                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                      ),
                                      const SizedBox(width: 5),
                                      Text(
                                        _isShiftActive ? 'ONLINE' : 'OFFLINE',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            const Text(
                              'TOTAL EARNINGS',
                              style: TextStyle(
                                color: Color(0xFF93C5FD),
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₦${_earnedToday.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Earned today ($_completedToday completed deliveries)',
                              style: const TextStyle(
                                color: Color(0xFF93C5FD),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 16),
                            GestureDetector(
                              onTap: _toggleShift,
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: _isShiftActive ? const Color(0xFF146EF5) : Colors.grey.shade800,
                                  borderRadius: BorderRadius.circular(30),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF146EF5).withAlpha(100),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      _isShiftActive ? Icons.bolt_rounded : Icons.power_settings_new_rounded,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _isShiftActive ? 'Shift Active • Tap to Go Offline' : 'Shift Offline • Tap to Go Online',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // ACTIVE JOB SECTION
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Current Assignment',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  TextButton(
                    onPressed: () => widget.onNavigateToTab?.call(1),
                    child: const Text(
                      'View Offers',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF146EF5)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_isLoading) ...[
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                ),
              ] else if (_activeJob != null) ...[
                _buildActiveJobCard(context, _activeJob!),
              ] else ...[
                _buildNoActiveJobCard(context),
              ],
            ],
          ),
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildActiveJobCard(BuildContext context, RiderJob job) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.inventory_2_rounded, color: Color(0xFF146EF5), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.trackingNumber,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Fee: ₦${job.shippingFee.toStringAsFixed(0)} • ${job.weightKg} kg',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    job.status,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFD97706)),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.my_location_rounded, size: 16, color: Color(0xFF10B981)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Pickup', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF64748B))),
                          Text(job.pickupAddress, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F172A))),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFFEF4444)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Drop-off Destination', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF64748B))),
                          Text('${job.recipientName} - ${job.recipientAddress}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F172A))),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF146EF5),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: Icon(fixIcon(FlexIcon.remix.mapLocation), size: 18),
                      label: const Text('Navigate to Drop-off', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => NavigationDropoffScreen(
                              orderId: job.id,
                              trackingNumber: job.trackingNumber,
                              recipientName: job.recipientName,
                              recipientPhone: job.recipientPhone,
                              dropoffAddress: job.recipientAddress,
                              pickupAddress: job.pickupAddress,
                              orderDetails: 'Parcel Package • ${job.weightKg} kg',
                              deliveryFee: '₦${job.shippingFee.toStringAsFixed(2)}',
                              dropoffLat: job.dropoffLat > 0 ? job.dropoffLat : 6.4520,
                              dropoffLng: job.dropoffLng > 0 ? job.dropoffLng : 3.4735,
                            ),
                          ),
                        ).then((_) => _loadDashboardData());
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoActiveJobCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(color: Color(0xFFF8FAFC), shape: BoxShape.circle),
            child: const Icon(Icons.local_shipping_outlined, size: 36, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),
          const Text(
            'No Active Assignment',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 4),
          const Text(
            'You are currently idle. Check incoming tenant job offers to start your next delivery.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => widget.onNavigateToTab?.call(1),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF146EF5),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Browse Job Offers', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
