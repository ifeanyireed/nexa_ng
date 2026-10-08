import 'package:flutter/material.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';
import '../screens/services/shuttle_route_details_screen.dart';

class RouteCard extends StatelessWidget {
  final String code;
  final String pickup;
  final String destination;
  final int stops;
  final String time;
  final String price;
  final int seatsLeft;
  final double width;

  const RouteCard({
    Key? key,
    required this.code,
    required this.pickup,
    required this.destination,
    required this.stops,
    required this.time,
    required this.price,
    required this.seatsLeft,
    this.width = double.infinity,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
            context,
            MaterialPageRoute(
                builder: (_) => const ShuttleRouteDetailsScreen()));
      },
      child: Container(
        width: width,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E7FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(code,
                      style: const TextStyle(
                          color: Color(0xFF1B62F0),
                          fontWeight: FontWeight.bold,
                          fontSize: 12)),
                ),
                Text(price,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.green)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(fixIcon(FlexIcon.remix.locationTarget2),
                    size: 16, color: const Color(0xFF1B62F0)),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(pickup,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis)),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 7.5, top: 4, bottom: 4),
              child: Container(
                  width: 1.5, height: 12, color: Colors.grey.shade300),
            ),
            Row(
              children: [
                Icon(fixIcon(FlexIcon.remix.locationPin3),
                    size: 16, color: Colors.red.shade400),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(destination,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis)),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.transferTruckTime),
                        size: 14, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text('$stops stops',
                        style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.countdownTimer),
                        size: 14, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(time,
                        style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.sofa),
                        size: 14, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text('$seatsLeft left',
                        style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
