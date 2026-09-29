import 'dart:ui';
import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/shipment.dart';
import '../widgets/shipment_card.dart';

class HomeScreen extends StatefulWidget {
  final Function(int pageIndex)? onNavigateToTab;
  final Function(ShipmentItem item)? onSelectShipment;

  const HomeScreen({
    super.key,
    this.onNavigateToTab,
    this.onSelectShipment,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isBalanceVisible = true;
  int _activeNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      body: Stack(
        children: [
          // Background Gradient at the top
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 380,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFFD4E6FA),
                    Color(0xFFE5F0FD),
                    Color(0xFFF6F8FB),
                  ],
                  stops: [0.0, 0.65, 1.0],
                ),
              ),
            ),
          ),

          // Main Scrollable Content
          SafeArea(
            bottom: false,
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.only(bottom: 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  // Top User Header Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildUserHeader(),
                  ),
                  const SizedBox(height: 24),

                  // Balance Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildBalanceCard(),
                  ),
                  const SizedBox(height: 22),

                  // Action Buttons: [New track] [Order us]
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: _buildActionButtons(),
                  ),
                  const SizedBox(height: 28),

                  // "Current Shipment" Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Current Shipment',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.3,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            if (widget.onNavigateToTab != null) {
                              widget.onNavigateToTab!(1); // Go to My Shipping
                            }
                          },
                          child: const Text(
                            'See all',
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Shipment Cards List
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: MockData.shipments.take(2).map((item) {
                        return ShipmentCard(
                          item: item,
                          onTap: () {
                            if (widget.onSelectShipment != null) {
                              widget.onSelectShipment!(item);
                            } else if (widget.onNavigateToTab != null) {
                              widget.onNavigateToTab!(2); // Go to Map
                            }
                          },
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Floating Frosted Bottom Navigation Bar
          Positioned(
            left: 32,
            right: 32,
            bottom: 24,
            child: _buildFloatingBottomNav(),
          ),
        ],
      ),
    );
  }

  // User Header (Avatar, Name, Location dropdown, Search, Notification)
  Widget _buildUserHeader() {
    return Row(
      children: [
        // Avatar
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFFFEF3C7),
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/sarah.png',
              fit: BoxFit.cover,
              errorBuilder: (ctx, err, stack) => Image.asset(
                'assets/images/avatar1.png',
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, stack) => const Icon(
                  Icons.person,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),

        // Name & Location
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                MockData.userName,
                style: TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.2,
                ),
              ),
              SizedBox(height: 2),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    MockData.userLocation,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  SizedBox(width: 2),
                  Icon(
                    Icons.arrow_drop_down,
                    size: 18,
                    color: Color(0xFF64748B),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Search Button
        _circleIconButton(
          icon: Icons.search,
          onTap: () {
            if (widget.onNavigateToTab != null) {
              widget.onNavigateToTab!(1);
            }
          },
        ),
        const SizedBox(width: 10),

        // Notification Button with red dot badge
        Stack(
          clipBehavior: Clip.none,
          children: [
            _circleIconButton(
              icon: Icons.notifications_none_rounded,
              onTap: () {},
            ),
            Positioned(
              top: 8,
              right: 10,
              child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: Color(0xFFEF4444),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _circleIconButton({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 20,
          color: const Color(0xFF0F172A),
        ),
      ),
    );
  }

  // Balance Card: "Your balance", "$244.00", Eye toggle, "Top up"
  Widget _buildBalanceCard() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your balance',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Text(
                  _isBalanceVisible
                      ? '\$${MockData.userBalance.toStringAsFixed(2)}'
                      : '••••••••',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _isBalanceVisible = !_isBalanceVisible;
                    });
                  },
                  child: Icon(
                    _isBalanceVisible
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    size: 20,
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ],
        ),

        // Top Up Button
        Container(
          height: 42,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.92),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF2563EB).withOpacity(0.18),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2563EB).withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'Top up',
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D64F2),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Action Buttons: [New track] [Order us]
  Widget _buildActionButtons() {
    return Row(
      children: [
        // New Track
        Expanded(
          child: GestureDetector(
            onTap: () {
              if (widget.onNavigateToTab != null) {
                widget.onNavigateToTab!(1);
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A0F172A),
                    blurRadius: 16,
                    offset: Offset(0, 6),
                  ),
                ],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.crop_free_rounded,
                    size: 22,
                    color: Color(0xFF0F172A),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'New track',
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),

        // Order Us
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0A0F172A),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.local_shipping_outlined,
                  size: 22,
                  color: Color(0xFF0F172A),
                ),
                SizedBox(width: 8),
                Text(
                  'Order us',
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // Floating Frosted Bottom Navigation Bar
  Widget _buildFloatingBottomNav() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(30),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.85),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(
              color: Colors.white.withOpacity(0.9),
              width: 1.5,
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x140F172A),
                blurRadius: 24,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navItem(
                index: 0,
                icon: Icons.home_filled,
                label: 'Home',
              ),
              _navItem(
                index: 1,
                icon: Icons.local_shipping_outlined,
                label: 'Orders',
              ),
              _navItem(
                index: 2,
                icon: Icons.person_outline,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _activeNavIndex == index;
    final color = isSelected ? const Color(0xFF0F172A) : const Color(0xFF94A3B8);

    return GestureDetector(
      onTap: () {
        setState(() {
          _activeNavIndex = index;
        });
        if (widget.onNavigateToTab != null) {
          if (index == 0) widget.onNavigateToTab!(0);
          if (index == 1) widget.onNavigateToTab!(1);
          if (index == 2) widget.onNavigateToTab!(2);
        }
      },
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 22, color: color),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
