import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/transport_models.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';
import 'profile/reward_screen.dart';
import 'profile/wallet_screen.dart';
import 'profile/cards_screen.dart';
import 'profile/promotions_screen.dart';
import 'profile/saved_locations_screen.dart';
import 'profile/favourite_routes_screen.dart';
import 'profile/support_screen.dart';
import 'profile/suggest_route_screen.dart';
import 'profile/emergency_contact_screen.dart';
import 'profile/security_screen.dart';

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
                  const CircleAvatar(
                    radius: 40,
                    backgroundImage: AssetImage('assets/images/avatar1.png'),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${user.firstName} ${user.lastName}',
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
            const SizedBox(height: 8),
            _buildSection(context, [
              _buildListTile(
                  context, fixIcon(FlexIcon.remix.starCircle), 'Reward',
                  destination: RewardScreen(points: user.rewardPoints),
                  trailingText: '${user.rewardPoints} pts >',
                  iconColor: Colors.green),
              _buildListTile(context, fixIcon(FlexIcon.remix.wallet), 'Wallet',
                  destination: const WalletScreen(), trailingText: '>'),
              _buildListTile(
                  context, fixIcon(FlexIcon.remix.creditCard4), 'Cards',
                  destination: const CardsScreen(), trailingText: '>'),
              _buildListTile(
                  context, fixIcon(FlexIcon.remix.newStickyNote), 'Promotions',
                  destination: const PromotionsScreen(), trailingText: '>'),
              _buildListTile(context, fixIcon(FlexIcon.remix.locationPin3),
                  'Saved Locations',
                  destination: const SavedLocationsScreen(), trailingText: '>'),
              _buildListTile(context, fixIcon(FlexIcon.remix.starCircle),
                  'Favourite routes',
                  destination: const FavouriteRoutesScreen(),
                  trailingText: '>'),
            ]),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('HELP',
                    style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        fontWeight: FontWeight.bold)),
              ),
            ),
            _buildSection(context, [
              _buildListTile(
                  context, fixIcon(FlexIcon.remix.customerSupport5), 'Support',
                  destination: const SupportScreen(), trailingText: '>'),
              _buildListTile(context, fixIcon(FlexIcon.remix.lineArrowRoadmap),
                  'Suggest route',
                  destination: const SuggestRouteScreen(), trailingText: '>'),
              _buildListTile(context, fixIcon(FlexIcon.remix.warningDiamond),
                  'Emergency Contact',
                  destination: const EmergencyContactScreen(),
                  trailingText: '>'),
            ]),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('SETTINGS',
                    style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        fontWeight: FontWeight.bold)),
              ),
            ),
            _buildSection(context, [
              _buildListTile(
                  context, fixIcon(FlexIcon.remix.shield1), 'Security',
                  destination: const SecurityScreen(), trailingText: '>'),
              _buildListTile(context, fixIcon(FlexIcon.remix.logout1), 'Logout',
                  trailingText: '>', isDestructive: true),
            ]),
            const SizedBox(height: 24),
            const Text('What\'s new on v2.10.7 ?',
                style: TextStyle(
                    color: Colors.green, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 400))
        .slideY(begin: 0.05, end: 0);
  }

  Widget _buildSection(BuildContext context, List<Widget> children) {
    return Material(
      color: Colors.white,
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildListTile(BuildContext context, IconData icon, String title,
      {String? trailingText,
      Color? iconColor,
      bool isDestructive = false,
      Widget? destination}) {
    return ListTile(
      leading: Icon(icon,
          color: isDestructive
              ? Colors.red
              : (iconColor ?? const Color(0xFF1B62F0))),
      title: Text(title,
          style: TextStyle(
              fontWeight: FontWeight.w500,
              color: isDestructive ? Colors.red : Colors.black)),
      trailing: trailingText != null
          ? Text(trailingText,
              style: TextStyle(
                  color: isDestructive ? Colors.red : Colors.grey.shade400,
                  fontSize: 16))
          : null,
      onTap: () {
        if (destination != null) {
          Navigator.push(
              context, MaterialPageRoute(builder: (context) => destination));
        }
      },
    );
  }
}
