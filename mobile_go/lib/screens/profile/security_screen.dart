import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({Key? key}) : super(key: key);

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  bool _biometricEnabled = true;
  bool _twoFactorEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Security'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('App Security',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Enable Biometric Login'),
            subtitle: const Text('Use Fingerprint or Face ID'),
            value: _biometricEnabled,
            onChanged: (val) => setState(() => _biometricEnabled = val),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Two-Factor Authentication'),
            subtitle: const Text('Require OTP on login'),
            value: _twoFactorEnabled,
            onChanged: (val) => setState(() => _twoFactorEnabled = val),
          ),
          const Divider(height: 40),
          const Text('Account',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.lock),
            title: const Text('Change Password'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text('Delete Account',
                style: TextStyle(color: Colors.red)),
            onTap: () {},
          ),
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }
}
