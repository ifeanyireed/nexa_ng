import 'package:flutter/material.dart';
import '../models/shipment.dart';
import 'isometric_box.dart';
import 'shipment_progress.dart';

class ShipmentCard extends StatelessWidget {
  final ShipmentItem item;
  final VoidCallback? onTap;

  const ShipmentCard({
    super.key,
    required this.item,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: const Color(0xFFF1F5F9),
            width: 1.2,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0C0F172A),
              blurRadius: 20,
              offset: Offset(0, 8),
              spreadRadius: -2,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Thumbnail + ID/Title + Status Badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Thumbnail
                _buildProductThumbnail(item.itemIconType),
                const SizedBox(width: 14),
                // Titles
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ID: ${item.id}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.title,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                // Status Badge
                _buildStatusBadge(item.status),
              ],
            ),

            const SizedBox(height: 18),

            // Progress Timeline
            ShipmentProgressTracker(currentStep: item.currentStep),

            const SizedBox(height: 16),

            // Bottom Section: Origin, Destination and 3D Box
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Origin
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.departureDate,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      item.sender,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 24),
                // Destination
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.estimatedDate,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.destination,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                ),
                // 3D Isometric Shipping Box
                const SizedBox(
                  width: 64,
                  height: 60,
                  child: IsometricPackageBox(width: 64, height: 60),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductThumbnail(String type) {
    Widget content;
    Color bgColor = const Color(0xFFF1F5F9);

    switch (type) {
      case 'mac':
        content = Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: const Color(0xFFDDE3EA),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFFB0BAC5), width: 1),
          ),
          child: Center(
            child: Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
        break;
      case 'chair':
        content = const Icon(
          Icons.chair,
          color: Color(0xFFDC2626),
          size: 26,
        );
        break;
      case 'headphone':
        content = const Icon(
          Icons.headphones,
          color: Color(0xFF64748B),
          size: 26,
        );
        break;
      default:
        content = const Icon(
          Icons.inventory_2_outlined,
          color: Color(0xFF2563EB),
          size: 24,
        );
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(child: content),
    );
  }

  Widget _buildStatusBadge(ShipmentStatus status) {
    Color bg;
    Color textColor;

    switch (status) {
      case ShipmentStatus.transit:
        bg = const Color(0xFFF1F5F9);
        textColor = const Color(0xFF334155);
        break;
      case ShipmentStatus.process:
        bg = const Color(0xFFEFF6FF);
        textColor = const Color(0xFF2563EB);
        break;
      case ShipmentStatus.delivered:
        bg = const Color(0xFFECFDF5);
        textColor = const Color(0xFF16A34A);
        break;
      case ShipmentStatus.pending:
        bg = const Color(0xFFFFFBEB);
        textColor = const Color(0xFFD97706);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}
