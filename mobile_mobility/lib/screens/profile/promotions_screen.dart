import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class PromotionsScreen extends StatelessWidget {
  const PromotionsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Promotions'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildPromoCard(
              'WELCOME20', '20% off your next 3 rides', 'Expires in 5 days'),
          _buildPromoCard(
              'WEEKEND', 'Flat ₦500 off weekend rides', 'Valid Sat-Sun'),
          const SizedBox(height: 20),
          Row(
            children: [
              const Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Enter promo code',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B62F0),
                    padding: const EdgeInsets.symmetric(
                        vertical: 16, horizontal: 24)),
                child:
                    const Text('Apply', style: TextStyle(color: Colors.white)),
              ),
            ],
          )
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildPromoCard(String code, String desc, String expiry) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(code,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B62F0))),
              const Icon(Icons.local_offer, color: Colors.orange),
            ],
          ),
          const SizedBox(height: 8),
          Text(desc, style: const TextStyle(fontSize: 16)),
          const SizedBox(height: 8),
          Text(expiry,
              style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
