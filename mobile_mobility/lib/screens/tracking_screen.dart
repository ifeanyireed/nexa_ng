import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/transport_mock_data.dart';
import '../models/transport_models.dart';
import '../widgets/map_painter.dart';
import 'package:flexicon/flexicon.dart';
import '../utils/icon_util.dart';

class TrackingScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final Trip? trip;

  const TrackingScreen({
    super.key,
    this.onBack,
    this.trip,
  });

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  late Trip _activeTrip;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _activeTrip = widget.trip ?? TransportMockData.activeTrip!;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8EDF2),
      body: Stack(
        children: [
          // 1. Vector Map Canvas
          Positioned.fill(
            child: CustomPaint(
              painter: VectorMapPainter(),
            ),
          ),

          // 2. Interactive Courier Map Pins positioned on the map
          Positioned.fill(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final w = constraints.maxWidth;
                final h = constraints.maxHeight;

                return Stack(
                  children: [
                    Positioned(
                      left: 0.5 * w - 23,
                      top: 0.45 * h - 50,
                      child: CourierPinWidget(
                        imageAsset: 'assets/images/driver.jpg',
                        isSelected: true,
                        onTap: () {},
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          // 3. Top Floating App Bar + Search Bar
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 12),

                // Top Bar with Back, Title, Options
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _circleButton(
                        icon: Icons.arrow_back,
                        onTap: () {
                          if (widget.onBack != null) {
                            widget.onBack!();
                          } else {
                            Navigator.of(context).maybePop();
                          }
                        },
                      ),
                      const Text(
                        'My Shipping',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.3,
                        ),
                      ),
                      _circleButton(
                        icon: fixIcon(FlexIcon.remix.watchSquareMenu),
                        onTap: () {},
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Floating Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.95),
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x120F172A),
                          blurRadius: 18,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(fixIcon(FlexIcon.remix.magnifyingGlass),
                          size: 22,
                          color: Color(0xFF94A3B8),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: const InputDecoration(
                              hintText: 'Search your percel',
                              hintStyle: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 14,
                                fontWeight: FontWeight.w400,
                              ),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 4. Bottom Floating Driver Card (Bottom Sheet replica)
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(36),
                  topRight: Radius.circular(36),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x180F172A),
                    blurRadius: 28,
                    offset: Offset(0, -6),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Drag Handle Pill
                  Container(
                    width: 44,
                    height: 4.5,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Driver Details Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Driver Photo
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: const Color(0xFFE2E8F0),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.asset(
                            'assets/images/driver.jpg',
                            fit: BoxFit.cover,
                            errorBuilder: (ctx, err, stack) => Icon(fixIcon(FlexIcon.remix.userFullBody),
                              size: 32,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),

                      // Name, Plate, Rating
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _activeTrip.driverName ?? 'Unknown Driver',
                              style: const TextStyle(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0F172A),
                                letterSpacing: -0.2,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Plate: ${_activeTrip.vehiclePlate ?? 'N/A'}',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w400,
                                color: Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(fixIcon(FlexIcon.remix.starCircle), size: 17, color: const Color(0xFFF59E0B)),
                                const SizedBox(width: 4),
                                const Text(
                                  '4.9 Rating',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Call Button (Black Circle)
                      GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Calling ${_activeTrip.driverName}...'),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                        },
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: Color(0xFF181C26),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0x20000000),
                                blurRadius: 12,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Icon(
                              fixIcon(FlexIcon.remix.phone),
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // "View Current location" Button
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Tracking ${_activeTrip.driverName} en route to ${_activeTrip.destination} (ETA 12 mins)',
                          ),
                          backgroundColor: const Color(0xFF181C26),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      height: 54,
                      decoration: BoxDecoration(
                        color: const Color(0xFF181C26),
                        borderRadius: BorderRadius.circular(27),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x22000000),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'View Current location',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _circleButton({required IconData icon, required VoidCallback onTap}) {
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
              color: Colors.black.withOpacity(0.06),
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
}
