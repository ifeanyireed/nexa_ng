import 'package:flutter/material.dart';
import '../models/transport_models.dart';
import 'package:mobile_fleet/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class AccountScreen extends StatelessWidget {
  final UserProfile user;
  const AccountScreen({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Center(
              child: Text(
                'English v',
                style: TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.grey.shade200,
                    child: Icon(fixIcon(FlexIcon.remix.userCircleSingle), size: 40, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${user.firstName} ${user.lastName}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 20),
                  // Turn vehicle into earnings banner
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.orange.shade100),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.directions_car, color: Colors.orange),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Turn your vehicle into earnings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Text('List your vehicle on Shuttlers and start making money', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        Icon(Icons.chevron_right, size: 16, color: Colors.orange),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            _buildSection(context, [
              _buildListTile(fixIcon(FlexIcon.remix.starCircle), 'Reward', trailingText: '${user.rewardPoints} pts >', iconColor: Colors.green),
              _buildListTile(fixIcon(FlexIcon.remix.wallet), 'Wallet', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.creditCard4), 'Cards', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.newStickyNote), 'Promotions', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.locationPin3), 'Saved Locations', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.starCircle), 'Favourite routes', trailingText: '>'),
            ]),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('HELP', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
              ),
            ),
            _buildSection(context, [
              _buildListTile(fixIcon(FlexIcon.remix.customerSupport5), 'Support', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.lineArrowRoadmap), 'Suggest route', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.warningDiamond), 'Emergency Contact', trailingText: '>'),
            ]),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('SETTINGS', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
              ),
            ),
            _buildSection(context, [
              _buildListTile(fixIcon(FlexIcon.remix.shield1), 'Security', trailingText: '>'),
              _buildListTile(fixIcon(FlexIcon.remix.logout1), 'Logout', trailingText: '>', isDestructive: true),
            ]),
            const SizedBox(height: 24),
            const Text('What\'s new on v2.10.7 ?', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, List<Widget> children) {
    return Container(
      color: Colors.white,
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, {String? trailingText, Color? iconColor, bool isDestructive = false}) {
    return ListTile(
      leading: Icon(icon, color: isDestructive ? Colors.red : (iconColor ?? const Color(0xFF1B62F0))),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w500, color: isDestructive ? Colors.red : Colors.black)),
      trailing: trailingText != null 
          ? Text(trailingText, style: TextStyle(color: isDestructive ? Colors.red : Colors.grey.shade400, fontSize: 16)) 
          : null,
      onTap: () {},
    );
  }
}
