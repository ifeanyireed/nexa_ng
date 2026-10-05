import 'package:flutter/material.dart';
import '../models/shipment.dart';
import '../data/mock_data.dart';
import '../widgets/shipment_card.dart';
import 'create_pickup_screen.dart';
import 'shipping_screen.dart';
import 'tracking_screen.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

class LogisticsScreen extends StatefulWidget {
  final Function(int pageIndex)? onNavigateToTab;

  const LogisticsScreen({
    super.key,
    this.onNavigateToTab,
  });

  @override
  State<LogisticsScreen> createState() => _LogisticsScreenState();
}

class _LogisticsScreenState extends State<LogisticsScreen> {
  void _openCreateShipment() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CreatePickupRequestScreen(
          onBack: () => Navigator.of(context).pop(),
        ),
      ),
    ).then((_) {
      if (mounted) setState(() {});
    });
  }

  void _openAllShipments() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ShippingScreen(
          onBack: () => Navigator.of(context).pop(),
          onSelectShipment: (item) {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => TrackingScreen(initialShipment: item),
              ),
            );
          },
        ),
      ),
    );
  }

  void _openTracking(ShipmentItem item) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TrackingScreen(initialShipment: item),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeShipments = MockData.shipments.where((s) => s.status != ShipmentStatus.delivered).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Ofia Logistics & Dispatch',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // HERO DISPATCH CTA BANNER
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B62F0), Color(0xFF0D47A1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1B62F0).withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'INDEPENDENT COURIER DISPATCH',
                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Book a Pickup & Express Delivery',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Send personal packages, business documents, or merchant returns across the city with real-time GPS tracking.',
                    style: TextStyle(color: Color(0xFFDBEAFE), fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1B62F0),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      icon: Icon(fixIcon(FlexIcon.remix.mapLocation), size: 18),
                      label: const Text('Create Pickup Request', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      onPressed: _openCreateShipment,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ACTIVE DELIVERIES
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text(
                      'Active Shipments',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${activeShipments.length}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF1B62F0)),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: _openAllShipments,
                  child: const Text(
                    'View History →',
                    style: TextStyle(fontSize: 12, color: Color(0xFF1B62F0), fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...activeShipments.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ShipmentCard(
                    item: s,
                    onTap: () => _openTracking(s),
                  ),
                )),

            const SizedBox(height: 16),

            // AVAILABLE RIDERS NEAR YOU
            const Text(
              'Riders Available in Your Zone',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 110,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: MockData.couriers.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final courier = MockData.couriers[index];
                  return Container(
                    width: 220,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundImage: AssetImage(courier.avatarAsset),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                courier.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                courier.vehicle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(fixIcon(FlexIcon.remix.starCircle), size: 13, color: Color(0xFFF59E0B)),
                                  const SizedBox(width: 2),
                                  Text(
                                    '${courier.rating}',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                                  ),
                                  const Spacer(),
                                  const Text(
                                    'Online',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF16A34A)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
