import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/mock_data.dart';
import 'package:mobile_driver/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

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
                    backgroundImage: const NetworkImage('https://i.pravatar.cc/150?img=11'),
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
            
            _buildMenuItem(fixIcon(FlexIcon.remix.userCircleSingle), 'Account'),
            _buildMenuItem(fixIcon(FlexIcon.remix.newStickyNote), 'Rewards'),
            _buildMenuItem(fixIcon(FlexIcon.remix.carTaxi1), 'Vehicles', trailing: '${driver.activeVehiclesCount} Active Vehicles'),
            _buildMenuItem(fixIcon(FlexIcon.remix.lineArrowRoadmap), 'Routes'),
            _buildMenuItem(fixIcon(FlexIcon.remix.shield1), 'Security'),
            _buildMenuItem(fixIcon(FlexIcon.remix.customerSupport5), 'Support'),
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildMenuItem(IconData icon, String title, {String? trailing}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: Color(0xFF757575), size: 24),
          const SizedBox(width: 16),
          Text(title, style: const TextStyle(color: Colors.black87, fontSize: 16)),
          const Spacer(),
          if (trailing != null)
            Text(trailing, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
        ],
      ),
    );
  }
}
