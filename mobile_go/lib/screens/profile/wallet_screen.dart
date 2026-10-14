import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Wallet'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
                color: const Color(0xFF1B62F0),
                borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Available Balance',
                    style: TextStyle(color: Colors.white70, fontSize: 16)),
                const SizedBox(height: 8),
                const Text('₦45,200.00',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                        child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF1B62F0)),
                            child: const Text('Fund Wallet'))),
                    const SizedBox(width: 12),
                    Expanded(
                        child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Colors.white),
                                foregroundColor: Colors.white),
                            child: const Text('Withdraw'))),
                  ],
                )
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Recent Transactions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildTransaction(
              'Funded Wallet', 'Oct 5, 2026', '+₦10,000', Colors.green),
          _buildTransaction(
              'Trip Payment', 'Oct 4, 2026', '-₦2,500', Colors.red),
          _buildTransaction(
              'Promo Bonus', 'Oct 1, 2026', '+₦500', Colors.green),
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildTransaction(
      String title, String date, String amount, Color color) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
          backgroundColor: Colors.white,
          child: Icon(Icons.receipt_long, color: Colors.grey.shade700)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(date),
      trailing: Text(amount,
          style: TextStyle(
              color: color, fontWeight: FontWeight.bold, fontSize: 16)),
    );
  }
}
