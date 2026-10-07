import 'package:flutter/material.dart';
import 'package:mobile_fleet/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({Key? key}) : super(key: key);

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  bool isSubscribed = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Let\'s plan your trip', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: const BackButton(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stop Selection
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
                      Icon(fixIcon(FlexIcon.remix.roundAnchorPoint), size: 16, color: Colors.green.shade600),
                      const SizedBox(width: 12),
                      const Expanded(child: Text('Ogidan Bus Stop', style: TextStyle(fontWeight: FontWeight.w600))),
                      Icon(fixIcon(FlexIcon.remix.deleteTag), size: 16, color: Colors.grey),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 7),
                    child: Align(alignment: Alignment.centerLeft, child: Container(width: 2, height: 20, color: Colors.grey.shade300)),
                  ),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.locationPin3), size: 16, color: Colors.blue.shade600),
                      const SizedBox(width: 12),
                      const Expanded(child: Text('Sandfill Bus Stop', style: TextStyle(fontWeight: FontWeight.w600))),
                      Icon(fixIcon(FlexIcon.remix.deleteTag), size: 16, color: Colors.grey),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Departure date', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(fixIcon(FlexIcon.remix.blankCalendar), size: 16, color: Colors.grey),
                            SizedBox(width: 8),
                            Text('Fri, 25 Sep', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Available time', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(fixIcon(FlexIcon.remix.countdownTimer), size: 16, color: Colors.grey),
                            SizedBox(width: 8),
                            Text('05:40 AM', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                            Spacer(),
                            Icon(Icons.keyboard_arrow_down, size: 16, color: Colors.grey),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Available vehicles', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Icon(fixIcon(FlexIcon.remix.alignTop1), color: Colors.grey),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.green.shade600, width: 1.5),
                borderRadius: BorderRadius.circular(12),
                color: Colors.green.shade50,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Toyota Coaster • AAA-17JL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(fixIcon(FlexIcon.remix.sofa), size: 12, color: Colors.grey),
                          SizedBox(width: 4),
                          Text('26 seats', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      )
                    ],
                  ),
                  Row(
                    children: [
                      const Text('₦3,010.00', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(width: 8),
                      Icon(fixIcon(FlexIcon.remix.autoCorrectionCheck), color: Colors.green.shade600, size: 20),
                    ],
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Subscribe to route', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    SizedBox(height: 4),
                    Text('Toggle ON the "Subscribe to route" button', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                Switch(
                  value: isSubscribed,
                  onChanged: (val) {
                    setState(() {
                      isSubscribed = val;
                    });
                  },
                  activeColor: Colors.green,
                )
              ],
            ),
            
            if (isSubscribed) ...[
              const SizedBox(height: 20),
              const Text('Trip Days', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildDayBadge('Sunday', false),
                  _buildDayBadge('Monday', true),
                  _buildDayBadge('Tuesday', true),
                  _buildDayBadge('Wednesday', false),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  _buildDayBadge('Thursday', true),
                  const SizedBox(width: 12),
                  _buildDayBadge('Friday', true),
                  const SizedBox(width: 12),
                  _buildDayBadge('Saturday', false),
                ],
              ),
              const SizedBox(height: 20),
              const Text('Trip Duration (In weeks)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Expires: after 3 weeks', style: TextStyle(fontWeight: FontWeight.w500)),
                    Text('Update', style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1B62F0),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {},
              child: const Text('Book Trip', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDayBadge(String day, bool selected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? Colors.green.shade50 : Colors.transparent,
        border: Border.all(color: selected ? Colors.green : Colors.grey.shade300),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        day,
        style: TextStyle(
          color: selected ? Colors.green.shade700 : Colors.grey,
          fontSize: 11,
          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }
}
