import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class PersonalInfoScreen extends StatefulWidget {
  const PersonalInfoScreen({super.key});

  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  bool _isEditing = false;
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;
  late final TextEditingController _addressController;
  late final TextEditingController _emergencyController;
  late final TextEditingController _plateController;

  String _riderId = '';
  String _tenantName = 'Logistics Fleet';
  String _tenantSlug = '';
  String _vehicleType = 'Motorbike';

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _addressController = TextEditingController();
    _emergencyController = TextEditingController();
    _plateController = TextEditingController();
    _loadSavedData();
  }

  Future<void> _loadSavedData() async {
    final prefs = await SharedPreferences.getInstance();

    final name = prefs.getString('rider_name');
    if (name != null && name.isNotEmpty) _nameController.text = name;

    final phone = prefs.getString('rider_phone');
    if (phone != null && phone.isNotEmpty) _phoneController.text = phone;

    final email = prefs.getString('rider_email');
    if (email != null && email.isNotEmpty) _emailController.text = email;

    final address = prefs.getString('rider_address');
    if (address != null && address.isNotEmpty) _addressController.text = address;

    final emergency = prefs.getString('rider_emergency_contact');
    if (emergency != null && emergency.isNotEmpty) _emergencyController.text = emergency;

    final plate = prefs.getString('rider_plate_number');
    if (plate != null && plate.isNotEmpty) _plateController.text = plate;

    setState(() {
      _riderId = prefs.getString('rider_id') ?? '';
      _tenantName = prefs.getString('rider_tenant_name') ?? 'Logistics Fleet';
      _tenantSlug = prefs.getString('rider_tenant_slug') ?? '';
      _vehicleType = prefs.getString('rider_vehicle_type') ?? 'Motorbike';
    });

    // Also fetch live from backend profile
    final profileRes = await ApiService().getRiderProfile();
    if (profileRes['success'] == true && profileRes['rider'] != null) {
      final r = profileRes['rider'];
      if (!mounted) return;
      setState(() {
        if (r['name'] != null && (r['name'] as String).isNotEmpty) _nameController.text = r['name'];
        if (r['phone'] != null && (r['phone'] as String).isNotEmpty) _phoneController.text = r['phone'];
        if (r['email'] != null && (r['email'] as String).isNotEmpty) _emailController.text = r['email'];
        if (r['address'] != null && (r['address'] as String).isNotEmpty) _addressController.text = r['address'];
        if (r['emergency_contact'] != null && (r['emergency_contact'] as String).isNotEmpty) _emergencyController.text = r['emergency_contact'];
        if (r['plate_number'] != null && (r['plate_number'] as String).isNotEmpty) _plateController.text = r['plate_number'];
        if (r['vehicle_type'] != null && (r['vehicle_type'] as String).isNotEmpty) _vehicleType = r['vehicle_type'];
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _emergencyController.dispose();
    _plateController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final address = _addressController.text.trim();
    final emergency = _emergencyController.text.trim();
    final plate = _plateController.text.trim();

    await ApiService().updateRiderProfile(
      name: name,
      phone: phone,
      email: email,
      address: address,
      emergencyContact: emergency,
      plateNumber: plate,
      vehicleType: _vehicleType,
    );

    setState(() {
      _isEditing = false;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text('Personal information updated and persisted!'),
            ],
          ),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryBlue = Color(0xFF146EF5);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Personal Information',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: () {
              if (_isEditing) {
                _saveChanges();
              } else {
                setState(() {
                  _isEditing = true;
                });
              }
            },
            icon: Icon(_isEditing ? Icons.check : Icons.edit, size: 16, color: primaryBlue),
            label: Text(
              _isEditing ? 'Save' : 'Edit',
              style: const TextStyle(fontWeight: FontWeight.w700, color: primaryBlue),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x06000000),
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: primaryBlue.withValues(alpha: 0.2), width: 3),
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/driver.jpg',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: const Color(0xFFDBEAFE),
                              child: const Center(
                                child: Text(
                                  'JA',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: primaryBlue,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: primaryBlue,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt, size: 12, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _nameController.text,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Rider ID: $_riderId',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFBFDBFE)),
                              ),
                              child: Text(
                                _tenantName,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF1D4ED8),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.verified, size: 12, color: Color(0xFF16A34A)),
                                  SizedBox(width: 3),
                                  Text(
                                    'Verified',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF16A34A),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Personal Contact Details
            const Text(
              'Rider Details',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildStaticField(
                    label: 'Tenant Organization',
                    value: _tenantSlug.isNotEmpty ? '$_tenantName ($_tenantSlug)' : _tenantName,
                    icon: Icons.business,
                    badge: 'Dedicated Tenant',
                    badgeColor: const Color(0xFFEFF6FF),
                    badgeTextColor: const Color(0xFF1D4ED8),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Full Legal Name',
                    controller: _nameController,
                    icon: Icons.person_outline,
                    isEditing: _isEditing,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Phone Number',
                    controller: _phoneController,
                    icon: Icons.phone_outlined,
                    isEditing: _isEditing,
                    keyboardType: TextInputType.phone,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Email Address',
                    controller: _emailController,
                    icon: Icons.email_outlined,
                    isEditing: _isEditing,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Home Address',
                    controller: _addressController,
                    icon: Icons.location_on_outlined,
                    isEditing: _isEditing,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Emergency Contact',
                    controller: _emergencyController,
                    icon: Icons.contact_phone_outlined,
                    isEditing: _isEditing,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Vehicle & Assigned Gear
            const Text(
              'Vehicle & Assigned Equipment',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildStaticField(
                    label: 'Vehicle Assigned',
                    value: _vehicleType,
                    icon: _vehicleType.toLowerCase().contains('bike') || _vehicleType.toLowerCase().contains('cycle')
                        ? Icons.electric_bike
                        : Icons.local_shipping,
                    badge: 'Fleet Assigned',
                    badgeColor: const Color(0xFFDBEAFE),
                    badgeTextColor: const Color(0xFF1D4ED8),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildEditableField(
                    label: 'Plate Number',
                    controller: _plateController,
                    icon: Icons.badge_outlined,
                    isEditing: _isEditing,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildStaticField(
                    label: 'Insulated Cargo Box ID',
                    value: 'OF-BOX-1049 (Thermal)',
                    icon: Icons.inventory_2_outlined,
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  _buildStaticField(
                    label: 'Fleet Safety Inspection',
                    value: 'Passed · Valid until Dec 2026',
                    icon: Icons.health_and_safety_outlined,
                    badge: 'Inspected',
                    badgeColor: const Color(0xFFDCFCE7),
                    badgeTextColor: const Color(0xFF16A34A),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            if (_isEditing)
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryBlue,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Save Changes',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300));
  }

  Widget _buildEditableField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required bool isEditing,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: const Color(0xFF64748B)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(height: 4),
                if (isEditing)
                  TextField(
                    controller: controller,
                    keyboardType: keyboardType,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                    ),
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 4),
                      border: UnderlineInputBorder(
                        borderSide: BorderSide(color: Color(0xFF146EF5)),
                      ),
                    ),
                  )
                else
                  Text(
                    controller.text,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0F172A),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaticField({
    required String label,
    required String value,
    required IconData icon,
    String? badge,
    Color? badgeColor,
    Color? badgeTextColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: const Color(0xFF64748B)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
          ),
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: badgeColor ?? const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                badge,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: badgeTextColor ?? const Color(0xFF64748B),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
