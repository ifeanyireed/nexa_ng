import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/mock_data.dart';
import 'package:mobile_driver/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';
import 'profile/wallet_screen.dart';
import 'profile/reward_screen.dart';
import 'profile/security_screen.dart';
import 'profile/support_screen.dart';
import 'profile/account_screen.dart';
import 'profile/vehicles_screen.dart';
import 'profile/routes_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final driver = MockData.currentDriver;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
        actions: [
          IconButton(icon: Icon(fixIcon(FlexIcon.remix.tuneAdjustVolume), color: Colors.black87), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Color(0xFFE0E0E0),
                    backgroundImage: const AssetImage('assets/images/avatar1.png'),
                  ),
                  const SizedBox(height: 16),
                  Text(driver.name, style: const TextStyle(color: Colors.black87, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.orange.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(fixIcon(FlexIcon.remix.starCircle), color: Colors.orange, size: 16),
                        const SizedBox(width: 4),
                        Text('${driver.points} points', style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.userCircleSingle), 'Account'),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.wallet), 'Earnings & Wallet', destination: const WalletScreen()),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.newStickyNote), 'Rewards', destination: RewardScreen(points: driver.points)),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.carTaxi1), 'Vehicles', trailing: '${driver.activeVehiclesCount} Active Vehicles'),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.lineArrowRoadmap), 'Routes'),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.shield1), 'Security', destination: const SecurityScreen()),
            _buildMenuItem(context, fixIcon(FlexIcon.remix.customerSupport5), 'Support', destination: const SupportScreen()),
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title,
      {String? trailing, Widget? destination}) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF1B62F0), size: 24),
      title: Text(title, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.w500)),
      trailing: trailing != null
          ? Text(trailing, style: const TextStyle(color: Color(0xFF757575), fontSize: 12))
          : const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: () {
        if (destination != null) {
          Navigator.push(context, MaterialPageRoute(builder: (context) => destination));
        }
      },
    );
  }
}
