import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/icon_util.dart';
import '../services/telemetry_service.dart';
import '../services/api_service.dart';
import 'personal_info_screen.dart';
import 'payout_methods_screen.dart';
import 'notifications_settings_screen.dart';
import 'operations_support_screen.dart';
import 'login_screen.dart';

class AccountScreen extends StatefulWidget {
  final Function(int)? onNavigateToTab;

  const AccountScreen({super.key, this.onNavigateToTab});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  String _riderName = 'Rider';
  String _riderId = '';
  String _riderRating = '5.0';
  String _tenantName = 'Logistics Workspace';
  String _tenantSlug = '';
  String _vehicleType = 'Motorbike';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _riderName = prefs.getString('rider_name') ?? 'Rider';
      _riderId = prefs.getString('rider_id') ?? '';
      _riderRating = prefs.getString('rider_rating') ?? '5.0';
      _tenantName = prefs.getString('rider_tenant_name') ?? 'Logistics Workspace';
      _tenantSlug = prefs.getString('rider_tenant_slug') ?? '';
      _vehicleType = prefs.getString('rider_vehicle_type') ?? 'Motorbike';
    });

    final profileRes = await ApiService().getRiderProfile();
    if (profileRes['success'] == true && profileRes['rider'] != null) {
      final r = profileRes['rider'];
      if (!mounted) return;
      setState(() {
        if (r['name'] != null && (r['name'] as String).isNotEmpty) _riderName = r['name'];
        if (r['id'] != null) _riderId = r['id'];
        if (r['rating'] != null) _riderRating = (r['rating'] as num).toStringAsFixed(1);
        if (r['vehicle_type'] != null) _vehicleType = r['vehicle_type'];
      });
    }
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return 'RD';
    if (parts.length == 1) return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 24),
            SizedBox(width: 10),
            Text(
              'Log Out',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF0F172A)),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to log out of $_tenantName? Telemetry tracking will stop and you will need to sign in again to receive new dispatch offers.',
          style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Cancel',
              style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              TelemetryService().stop();
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('rider_token');
              await prefs.remove('rider_tenant_slug');
              await prefs.remove('rider_tenant_id');
              await prefs.remove('rider_tenant_name');
              await prefs.remove('rider_id');
              await prefs.remove('rider_name');
              await prefs.remove('rider_phone');
              await prefs.remove('rider_rating');
              await prefs.remove('rider_vehicle_type');

              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text(
              'Log Out',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
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
        title: const Text(
          'Rider Profile',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile Header
            Center(
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const PersonalInfoScreen()),
                      );
                    },
                    child: Stack(
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE2E8F0),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 4),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x0A000000),
                                blurRadius: 10,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              _getInitials(_riderName),
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF64748B)),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFF146EF5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit, size: 14, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _riderName,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Rider ID: $_riderId',
                    style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  // Dedicated Tenant Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFBFDBFE)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.business_rounded, size: 14, color: Color(0xFF1D4ED8)),
                        const SizedBox(width: 6),
                        Text(
                          _tenantName.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                            color: Color(0xFF1D4ED8),
                          ),
                        ),
                        if (_tenantSlug.isNotEmpty) ...[
                          const SizedBox(width: 4),
                          Text(
                            '($_tenantSlug)',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF3B82F6),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFBBF24), size: 16),
                      const SizedBox(width: 4),
                      Text('$_riderRating Rating', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF334155))),
                      const SizedBox(width: 12),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                      const SizedBox(width: 12),
                      Text(_vehicleType, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF64748B))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Settings List
            Material(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  _buildListTile(
                    icon: fixIcon(FlexIcon.remix.userCircleSingle),
                    title: 'Personal Information',
                    subtitle: 'Update your details and vehicle info',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const PersonalInfoScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.solid.wallet),
                    title: 'Payout Methods',
                    subtitle: 'Manage bank accounts for earnings',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const PayoutMethodsScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.remix.bellNotification),
                    title: 'Notifications',
                    subtitle: 'Job alerts and system messages',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const NotificationsSettingsScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Support List
            Material(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  _buildListTile(
                    icon: fixIcon(FlexIcon.solid.phone),
                    title: 'Operations Support',
                    subtitle: 'Contact dispatch or report issues',
                    iconColor: const Color(0xFF3B82F6),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const OperationsSupportScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.remix.logout1),
                    title: 'Log Out',
                    subtitle: 'Sign out of your rider account',
                    iconColor: const Color(0xFFEF4444),
                    titleColor: const Color(0xFFEF4444),
                    hideArrow: true,
                    onTap: () => _showLogoutDialog(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Color iconColor = const Color(0xFF64748B),
    Color titleColor = const Color(0xFF0F172A),
    bool hideArrow = false,
    VoidCallback? onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: titleColor),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            )
          : null,
      trailing: hideArrow ? null : const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
      onTap: onTap,
    );
  }
}
