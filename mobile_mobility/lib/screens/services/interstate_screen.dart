import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class InterstateScreen extends StatelessWidget {
  const InterstateScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: const Text('Interstate Travel'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.roundAnchorPoint),
                          color: Color(0xFF1B62F0), size: 16),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Origin Terminal (e.g. Lagos)'),
                          items: const [],
                          onChanged: (v) {},
                        ),
                      )
                    ],
                  ),
                  const Divider(),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.locationPin3),
                          color: Color(0xFFE11D48), size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Destination Terminal (e.g. Abuja)'),
                          items: const [],
                          onChanged: (v) {},
                        ),
                      )
                    ],
                  ),
                  const Divider(),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.calendarMark),
                          color: Color(0xFF64748B), size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                            'Tomorrow, ${DateTime.now().add(const Duration(days: 1)).day}/${DateTime.now().month}',
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B62F0),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {},
                      child: const Text('Search Departures',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold)),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 32),

            const Text('Available Departures',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            _buildDepartureCard('06:00 AM', '04:30 PM', 'Lagos (Jibowu)',
                'Abuja (Utako)', 'Executive Sprinter', '₦35,000', 4),
            _buildDepartureCard('08:30 AM', '07:00 PM', 'Lagos (Jibowu)',
                'Abuja (Utako)', 'Standard Coach', '₦28,000', 15),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 400))
        .slideY(begin: 0.05, end: 0);
  }

  Widget _buildDepartureCard(String depTime, String arrTime, String origin,
      String dest, String busType, String price, int seats) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(price,
                  style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1B62F0),
                      fontSize: 18)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(4)),
                child: Text('$seats seats left',
                    style: const TextStyle(
                        color: Color(0xFFB91C1C),
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Column(
                children: [
                  Text(depTime,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  Text(arrTime,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B))),
                ],
              ),
              const SizedBox(width: 16),
              Column(
                children: [
                  Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                          border: Border.all(
                              color: const Color(0xFF1B62F0), width: 2),
                          shape: BoxShape.circle)),
                  Container(
                      width: 2, height: 24, color: const Color(0xFFE2E8F0)),
                  Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                          color: Color(0xFFE11D48), shape: BoxShape.circle)),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(origin,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 24),
                    Text(dest,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B))),
                  ],
                ),
              )
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(fixIcon(FlexIcon.remix.transferTruckTime),
                      size: 16, color: Color(0xFF64748B)),
                  const SizedBox(width: 6),
                  Text(busType,
                      style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ],
              ),
              InkWell(
                onTap: () {},
                child: const Text('Select Seat',
                    style: TextStyle(
                        color: Color(0xFF1B62F0), fontWeight: FontWeight.bold)),
              )
            ],
          )
        ],
      ),
    );
  }
}
