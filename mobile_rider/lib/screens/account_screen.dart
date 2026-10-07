import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import '../utils/icon_util.dart';

class AccountScreen extends StatelessWidget {
  final Function(int)? onNavigateToTab;

  const AccountScreen({super.key, this.onNavigateToTab});

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
                  Stack(
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
                        child: const Center(
                          child: Text(
                            'JA',
                            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF64748B)),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Color(0xFF16A34A),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit, size: 14, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'John Adebayo',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Rider ID: OF-RID-8842',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFBBF24), size: 16),
                      const SizedBox(width: 4),
                      const Text('4.8 Rating', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF334155))),
                      const SizedBox(width: 12),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                      const SizedBox(width: 12),
                      const Text('128 Deliveries', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF64748B))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Verified Agent',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF15803D)),
                    ),
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
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.solid.wallet),
                    title: 'Payout Methods',
                    subtitle: 'Manage bank accounts for earnings',
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.remix.bellNotification),
                    title: 'Notifications',
                    subtitle: 'Job alerts and system messages',
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
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildListTile(
                    icon: fixIcon(FlexIcon.remix.logout1),
                    title: 'Log Out',
                    subtitle: 'Sign out of your rider account',
                    iconColor: const Color(0xFFEF4444),
                    titleColor: const Color(0xFFEF4444),
                    hideArrow: true,
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
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.1),
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
      onTap: () {},
    );
  }
}
