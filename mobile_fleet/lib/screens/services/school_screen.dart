import 'package:flutter/material.dart';

class SchoolScreen extends StatelessWidget {
  const SchoolScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Parent Portal'), backgroundColor: Colors.white, foregroundColor: Colors.black, elevation: 0),
      backgroundColor: const Color(0xFFF8FAFC),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Your Children', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          _buildChildCard('Chisom Okafor', 'Grade 4 - Greenoak International', true, 'Arrived at School', '07:45 AM'),
          _buildChildCard('David Okafor', 'Grade 2 - Greenoak International', false, 'Bus is 5 mins away', 'Pickup: 02:30 PM'),
          
          const SizedBox(height: 32),
          const Text('Recent Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          _buildNotification('Chisom has arrived at school.', '07:45 AM', Icons.check_circle, Colors.green),
          _buildNotification('Chisom boarded the bus.', '07:15 AM', Icons.directions_bus, const Color(0xFF1B62F0)),
          _buildNotification('Bus is approaching pickup point.', '07:10 AM', Icons.location_on, const Color(0xFFF59E0B)),
        ],
      ),
    );
  }

  Widget _buildChildCard(String name, String school, bool isMorningCompleted, String status, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: const Color(0xFFE0E7FF),
                child: Text(name[0], style: const TextStyle(color: Color(0xFF4338CA), fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(school, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Morning Trip', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(isMorningCompleted ? Icons.check_circle : Icons.radio_button_unchecked, 
                           color: isMorningCompleted ? Colors.green : Colors.grey, size: 16),
                      const SizedBox(width: 6),
                      Text(isMorningCompleted ? 'Completed' : 'Pending', style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  )
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Live Status', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(status, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1B62F0))),
                ],
              )
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF1B62F0),
                side: const BorderSide(color: Color(0xFF1B62F0)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {},
              icon: const Icon(Icons.map, size: 18),
              label: const Text('Track Bus'),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNotification(String message, String time, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(message, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(time, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              ],
            ),
          )
        ],
      ),
    );
  }
}
