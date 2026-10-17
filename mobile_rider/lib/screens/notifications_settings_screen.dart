import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  State<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends State<NotificationsSettingsScreen> {
  // Job & Dispatch alerts
  bool _newJobDispatches = true;
  bool _surgeIncentives = true;
  bool _orderUpdates = true;
  bool _zoneHeatmap = false;

  // Wallet & Safety
  bool _payoutAlerts = true;
  bool _safetyWeatherAlerts = true;
  bool _performanceReports = true;

  // Delivery Channels
  bool _pushNotifications = true;
  bool _smsDispatch = true;
  bool _emailDigest = false;

  // Audio & Haptics
  bool _loudAlerts = true;
  bool _vibrationFeedback = true;

  bool _hasUnsavedChanges = false;

  void _onToggleChanged() {
    setState(() {
      _hasUnsavedChanges = true;
    });
  }

  void _savePreferences() {
    setState(() {
      _hasUnsavedChanges = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Text(
              'Notification preferences saved successfully!',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF16A34A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _resetToDefaults() {
    setState(() {
      _newJobDispatches = true;
      _surgeIncentives = true;
      _orderUpdates = true;
      _zoneHeatmap = false;
      _payoutAlerts = true;
      _safetyWeatherAlerts = true;
      _performanceReports = true;
      _pushNotifications = true;
      _smsDispatch = true;
      _emailDigest = false;
      _loudAlerts = true;
      _vibrationFeedback = true;
      _hasUnsavedChanges = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Text('Reset to system recommended settings'),
          ],
        ),
        backgroundColor: const Color(0xFF334155),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        actions: [
          TextButton(
            onPressed: _resetToDefaults,
            child: const Text(
              'Reset',
              style: TextStyle(
                color: Color(0xFF146EF5),
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF146EF5), Color(0xFF0B4CB4)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF146EF5).withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.notifications_active_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Real-Time Dispatch Priority',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Keep high-priority job alerts active to avoid missing lucrative pickup requests.',
                          style: TextStyle(
                            color: Color(0xFFE0E7FF),
                            fontSize: 12,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 1: Job & Trip Alerts
            _buildSectionHeader('JOB & TRIP DISPATCHES'),
            const SizedBox(height: 8),
            _buildCardGroup(
              children: [
                _buildSwitchTile(
                  icon: Icons.flash_on_rounded,
                  iconColor: const Color(0xFFF59E0B),
                  title: 'New Job Dispatches',
                  subtitle: 'Instant alerts when orders are ready for pickup in your area',
                  value: _newJobDispatches,
                  onChanged: (val) {
                    setState(() => _newJobDispatches = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.trending_up_rounded,
                  iconColor: const Color(0xFF10B981),
                  title: 'Surge Incentives & Bonuses',
                  subtitle: 'Get notified when peak multipliers or bonus zones activate',
                  value: _surgeIncentives,
                  onChanged: (val) {
                    setState(() => _surgeIncentives = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.alt_route_rounded,
                  iconColor: const Color(0xFF146EF5),
                  title: 'Route & Order Updates',
                  subtitle: 'Customer notes, delivery address modifications, and cancellations',
                  value: _orderUpdates,
                  onChanged: (val) {
                    setState(() => _orderUpdates = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.map_rounded,
                  iconColor: const Color(0xFF8B5CF6),
                  title: 'Demand Heatmap Spikes',
                  subtitle: 'Broadcast alerts when high-density order clusters emerge',
                  value: _zoneHeatmap,
                  onChanged: (val) {
                    setState(() => _zoneHeatmap = val);
                    _onToggleChanged();
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Section 2: Wallet & Safety
            _buildSectionHeader('SECURITY, SAFETY & WALLET'),
            const SizedBox(height: 8),
            _buildCardGroup(
              children: [
                _buildSwitchTile(
                  icon: Icons.account_balance_wallet_rounded,
                  iconColor: const Color(0xFF10B981),
                  title: 'Payout & Wallet Confirmations',
                  subtitle: 'Instant receipt when earnings transfer directly to your bank',
                  value: _payoutAlerts,
                  onChanged: (val) {
                    setState(() => _payoutAlerts = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.shield_rounded,
                  iconColor: const Color(0xFFEF4444),
                  title: 'Safety & Severe Weather Advisories',
                  subtitle: 'Heavy rain, road closures, or flood alerts from Operations Hub',
                  value: _safetyWeatherAlerts,
                  onChanged: (val) {
                    setState(() => _safetyWeatherAlerts = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.bar_chart_rounded,
                  iconColor: const Color(0xFF6366F1),
                  title: 'Weekly Performance Score',
                  subtitle: 'Weekly summary of ratings, customer compliments, and tips',
                  value: _performanceReports,
                  onChanged: (val) {
                    setState(() => _performanceReports = val);
                    _onToggleChanged();
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Section 3: Notification Channels
            _buildSectionHeader('DELIVERY CHANNELS'),
            const SizedBox(height: 8),
            _buildCardGroup(
              children: [
                _buildSwitchTile(
                  icon: Icons.phone_android_rounded,
                  iconColor: const Color(0xFF146EF5),
                  title: 'Push Notifications',
                  subtitle: 'Floating heads-up banners on phone home and lock screen',
                  value: _pushNotifications,
                  onChanged: (val) {
                    setState(() => _pushNotifications = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.sms_rounded,
                  iconColor: const Color(0xFF0EA5E9),
                  title: 'SMS Dispatch Alerts',
                  subtitle: 'Fallback text messages when cellular internet is weak or offline',
                  value: _smsDispatch,
                  onChanged: (val) {
                    setState(() => _smsDispatch = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.email_rounded,
                  iconColor: const Color(0xFF64748B),
                  title: 'Email Statements',
                  subtitle: 'Monthly statements and tax invoices to registered rider email',
                  value: _emailDigest,
                  onChanged: (val) {
                    setState(() => _emailDigest = val);
                    _onToggleChanged();
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Section 4: Sound & Vibration
            _buildSectionHeader('SOUND & HAPTICS'),
            const SizedBox(height: 8),
            _buildCardGroup(
              children: [
                _buildSwitchTile(
                  icon: Icons.volume_up_rounded,
                  iconColor: const Color(0xFFF97316),
                  title: 'High-Priority Loud Siren',
                  subtitle: 'Sound distinct chime even when device is on silent/do-not-disturb',
                  value: _loudAlerts,
                  onChanged: (val) {
                    setState(() => _loudAlerts = val);
                    _onToggleChanged();
                  },
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildSwitchTile(
                  icon: Icons.vibration_rounded,
                  iconColor: const Color(0xFF64748B),
                  title: 'Vibration Feedback',
                  subtitle: 'Tactile buzz on incoming dispatches and turnaround deadlines',
                  value: _vibrationFeedback,
                  onChanged: (val) {
                    setState(() => _vibrationFeedback = val);
                    _onToggleChanged();
                  },
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Save changes button (active if modified)
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _hasUnsavedChanges ? _savePreferences : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF146EF5),
                  disabledBackgroundColor: const Color(0xFFE2E8F0),
                  foregroundColor: Colors.white,
                  disabledForegroundColor: const Color(0xFF94A3B8),
                  elevation: _hasUnsavedChanges ? 2 : 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _hasUnsavedChanges ? Icons.save_rounded : Icons.check_circle_outline_rounded,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _hasUnsavedChanges ? 'Save Preferences' : 'Settings Up to Date',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300)).slideY(begin: 0.04, end: 0);
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Color(0xFF64748B),
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _buildCardGroup({required List<Widget> children}) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Switch.adaptive(
            value: value,
            activeTrackColor: const Color(0xFF146EF5),
            activeThumbColor: Colors.white,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
