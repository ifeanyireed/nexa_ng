import 'package:flutter/material.dart';
import '../models/transport_models.dart';

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
                    child: const Icon(Icons.person, size: 40, color: Colors.grey),
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
                        const Icon(Icons.directions_car, color: Colors.orange),
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
                        const Icon(Icons.arrow_forward, size: 16, color: Colors.orange),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            _buildSection(context, [
              _buildListTile(Icons.stars, 'Reward', trailingText: '${user.rewardPoints} pts >', iconColor: Colors.green),
              _buildListTile(Icons.account_balance_wallet, 'Wallet', trailingText: '>'),
              _buildListTile(Icons.credit_card, 'Cards', trailingText: '>'),
              _buildListTile(Icons.card_giftcard, 'Promotions', trailingText: '>'),
              _buildListTile(Icons.location_on, 'Saved Locations', trailingText: '>'),
              _buildListTile(Icons.star, 'Favourite routes', trailingText: '>'),
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
              _buildListTile(Icons.headset_mic, 'Support', trailingText: '>'),
              _buildListTile(Icons.alt_route, 'Suggest route', trailingText: '>'),
              _buildListTile(Icons.emergency, 'Emergency Contact', trailingText: '>'),
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
              _buildListTile(Icons.security, 'Security', trailingText: '>'),
              _buildListTile(Icons.logout, 'Logout', trailingText: '>', isDestructive: true),
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
