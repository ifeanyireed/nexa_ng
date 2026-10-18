import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../main.dart';
import '../models/rider_models.dart';
import '../services/api_service.dart';
import '../services/telemetry_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController(text: '+2348033344455');
  final _pinController = TextEditingController(text: '1234');

  bool _isResolvingPhone = false;
  bool _isLoggingIn = false;
  String? _errorMessage;

  List<RiderWorkspace> _resolvedWorkspaces = [];
  RiderWorkspace? _selectedWorkspace;

  @override
  void initState() {
    super.initState();
    _loadSavedPhone();
  }

  Future<void> _loadSavedPhone() async {
    final prefs = await SharedPreferences.getInstance();
    final savedPhone = prefs.getString('rider_phone');
    if (savedPhone != null && savedPhone.isNotEmpty) {
      _phoneController.text = savedPhone;
    }
    if (_phoneController.text.isNotEmpty) {
      _resolvePhone();
    }
  }

  Future<void> _resolvePhone() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 8) return;

    setState(() {
      _isResolvingPhone = true;
      _errorMessage = null;
    });

    final res = await ApiService().lookupRiderByPhone(phone);

    if (!mounted) return;

    setState(() {
      _isResolvingPhone = false;
      if (res['success'] == true) {
        _resolvedWorkspaces = res['workspaces'] as List<RiderWorkspace>;

        if (_resolvedWorkspaces.isNotEmpty) {
          // 1. Phone number automatically resolves their tenant organization
          _selectedWorkspace = _resolvedWorkspaces.first;
        } else {
          _errorMessage = 'No fleet workspace found for this phone number.';
        }
      } else {
        _errorMessage = res['error'] ?? 'Could not resolve fleet organization.';
      }
    });
  }

  Future<void> _login() async {
    if (_selectedWorkspace == null) {
      await _resolvePhone();
      if (_selectedWorkspace == null) return;
    }

    final pin = _pinController.text.trim();
    if (pin.isEmpty) {
      setState(() => _errorMessage = 'Please enter your 4-digit security PIN');
      return;
    }

    setState(() {
      _isLoggingIn = true;
      _errorMessage = null;
    });

    final res = await ApiService().loginRider(
      phone: _phoneController.text.trim(),
      pin: pin,
      workspace: _selectedWorkspace!,
    );

    if (!mounted) return;

    setState(() => _isLoggingIn = false);

    if (res['success'] == true) {
      // Start background GPS telemetry (30s idle cadence until assignment starts)
      TelemetryService().start(isTripActive: false);

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const MainAppNavigationScaffold()),
      );
    } else {
      setState(() {
        _errorMessage = res['error'] ?? 'Authentication failed. Please verify your PIN.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = _selectedWorkspace != null
        ? Color(int.parse(_selectedWorkspace!.primaryColor.replaceFirst('#', '0xFF')))
        : const Color(0xFF146EF5);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo & App Name
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: primaryColor.withAlpha(25),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(Icons.two_wheeler_rounded, color: primaryColor, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ofia Rider',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        'Courier Logistics Network',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 36),

              const Text(
                'Courier Sign In',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 6),
              Text(
                'Enter your phone number to automatically connect to your fleet workspace.',
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600, height: 1.4),
              ),
              const SizedBox(height: 28),

              // Phone Number Field
              Text(
                'PHONE NUMBER',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey.shade600, letterSpacing: 0.5),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                onChanged: (val) {
                  if (val.length >= 10) {
                    _resolvePhone();
                  }
                },
                decoration: InputDecoration(
                  hintText: '+234 803 334 4455',
                  prefixIcon: const Icon(Icons.phone_iphone_rounded, size: 20),
                  suffixIcon: _isResolvingPhone
                      ? const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                        )
                      : IconButton(
                          icon: const Icon(Icons.arrow_forward_rounded, size: 20),
                          onPressed: _resolvePhone,
                        ),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: primaryColor, width: 1.5),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // AUTO-RESOLVED TENANT WORKSPACE CARD
              if (_selectedWorkspace != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: primaryColor.withAlpha(15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: primaryColor.withAlpha(60)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.verified_rounded, color: primaryColor, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _selectedWorkspace!.tenantName,
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: primaryColor),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: primaryColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'CONNECTED',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text(
                            'Rider: ${_selectedWorkspace!.riderName}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                          ),
                          const Spacer(),
                          Text(
                            '${_selectedWorkspace!.vehicleType} • ${_selectedWorkspace!.plateNumber}',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 250.ms).slideY(begin: 0.1, end: 0),
                const SizedBox(height: 20),
              ],

              // MULTI-WORKSPACE SELECTOR (IF COURIER BELONGS TO MULTIPLE TENANTS)
              if (_resolvedWorkspaces.length > 1) ...[
                Text(
                  'SELECT WORKSPACE SHIFT',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey.shade600, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _resolvedWorkspaces.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final ws = _resolvedWorkspaces[index];
                      final isSelected = ws.tenantSlug == _selectedWorkspace?.tenantSlug;
                      return ChoiceChip(
                        label: Text(ws.tenantName),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) setState(() => _selectedWorkspace = ws);
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // PIN Code Field
              Text(
                'SECURITY PIN',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey.shade600, letterSpacing: 0.5),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                maxLength: 4,
                decoration: InputDecoration(
                  hintText: '••••',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  counterText: '',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: primaryColor, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Default security PIN: 1234',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(fontSize: 12, color: Color(0xFFB91C1C), fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 32),

              // Sign In Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoggingIn ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isLoggingIn
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Text(
                          'Start Shift',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: 0.3),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
