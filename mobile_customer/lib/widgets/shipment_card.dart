import 'package:flutter/material.dart';
import '../models/shipment.dart';
import 'isometric_box.dart';
import 'shipment_progress.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

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
    String imageUrl;
    
    switch (type) {
      case 'mac':
        imageUrl = 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=200&auto=format&fit=crop';
        break;
      case 'chair':
        imageUrl = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=200&auto=format&fit=crop';
        break;
      case 'headphone':
        imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop';
        break;
      default:
        imageUrl = 'https://images.unsplash.com/photo-1606836591695-4d58436f5407?q=80&w=200&auto=format&fit=crop';
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(14),
        image: DecorationImage(
          image: NetworkImage(imageUrl),
          fit: BoxFit.cover,
        ),
      ),
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
