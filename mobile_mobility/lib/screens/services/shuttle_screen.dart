import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../widgets/route_card.dart';

class ShuttleScreen extends StatelessWidget {
  const ShuttleScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Available Shuttles',
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Suggested Routes',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          const RouteCard(
            code: 'SGT4',
            pickup: 'Sangotedo Bus Stop',
            destination: 'Marina (Eko Electricity)',
            stops: 29,
            time: '05:40 AM',
            price: '₦3,010.00',
            seatsLeft: 12,
          )
              .animate()
              .fadeIn(duration: 800.ms, delay: 0.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          const RouteCard(
            code: 'LEK1',
            pickup: 'Lekki Phase 1',
            destination: 'Victoria Island',
            stops: 14,
            time: '06:15 AM',
            price: '₦2,500.00',
            seatsLeft: 5,
          )
              .animate()
              .fadeIn(duration: 800.ms, delay: 150.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          const RouteCard(
            code: 'IKE2',
            pickup: 'Ikeja City Mall',
            destination: 'Yaba Tech',
            stops: 21,
            time: '06:30 AM',
            price: '₦1,800.00',
            seatsLeft: 8,
          )
              .animate()
              .fadeIn(duration: 800.ms, delay: 300.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),
          const RouteCard(
            code: 'AJA3',
            pickup: 'Ajah Jubilee Bridge',
            destination: 'Obalende',
            stops: 35,
            time: '07:00 AM',
            price: '₦2,200.00',
            seatsLeft: 20,
          )
              .animate()
              .fadeIn(duration: 800.ms, delay: 450.ms)
              .slideY(begin: 0.1, end: 0),
        ],
      ),
    ).animate().fadeIn(duration: 800.ms).slideX(begin: 0.05, end: 0);
  }
}
