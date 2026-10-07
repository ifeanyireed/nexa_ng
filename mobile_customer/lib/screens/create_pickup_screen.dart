import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/shipment.dart';
import '../data/mock_data.dart';
import 'tracking_screen.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

class CreatePickupRequestScreen extends StatefulWidget {
  final VoidCallback? onBack;

  const CreatePickupRequestScreen({
    super.key,
    this.onBack,
  });

  @override
  State<CreatePickupRequestScreen> createState() =>
      _CreatePickupRequestScreenState();
}

class _CreatePickupRequestScreenState extends State<CreatePickupRequestScreen> {
  // Route details
  final TextEditingController _senderNameController =
      TextEditingController(text: 'Sarah Johnson');
  final TextEditingController _senderPhoneController =
      TextEditingController(text: '+234 803 123 4567');
  final TextEditingController _pickupAddressController =
      TextEditingController(text: '14B Admiralty Way, Lekki Phase 1, Lagos');
  final TextEditingController _pickupNotesController =
      TextEditingController(text: 'Ring bell at gate, parcel at reception');

  final TextEditingController _recipientNameController =
      TextEditingController(text: 'Dr. Babatunde Alabi');
  final TextEditingController _recipientPhoneController =
      TextEditingController(text: '+234 812 345 6789');
  final TextEditingController _deliveryAddressController =
      TextEditingController(text: '42 Isaac John Street, GRA, Ikeja, Lagos');
  final TextEditingController _deliveryNotesController =
      TextEditingController(text: 'Call recipient upon arrival');

  final TextEditingController _parcelDescController =
      TextEditingController(text: 'Contractual documents and company seal');

  // Parcel configuration
  String _selectedCategory = 'Documents';
  String _selectedWeight = 'light'; // light, medium, heavy, bulky
  String _selectedVehicle = 'bike'; // bike, van
  String _selectedSpeed = 'instant'; // instant, scheduled
  String _selectedPayment = 'wallet'; // wallet, card, recipient
  bool _isProcessing = false;

  final List<Map<String, dynamic>> _categories = [
    {'label': 'Documents', 'icon': fixIcon(FlexIcon.remix.textFile)},
    {'label': 'Food & Snacks', 'icon': fixIcon(FlexIcon.remix.forkKnife)},
    {'label': 'Gadgets & Tech', 'icon': fixIcon(FlexIcon.remix.laptop)},
    {'label': 'Fashion Goods', 'icon': fixIcon(FlexIcon.remix.shirt)},
    {'label': 'Fragile Items', 'icon': fixIcon(FlexIcon.remix.warningDiamond)},
    {'label': 'Carton / Box', 'icon': fixIcon(FlexIcon.remix.archiveBox)},
  ];

  @override
  void dispose() {
    _senderNameController.dispose();
    _senderPhoneController.dispose();
    _pickupAddressController.dispose();
    _pickupNotesController.dispose();
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _deliveryAddressController.dispose();
    _deliveryNotesController.dispose();
    _parcelDescController.dispose();
    super.dispose();
  }

  // Quote computation
  int get _baseFare => 1500;
  int get _distanceFare => 1650; // Estimated 18.2 km between Lekki & Ikeja
  int get _weightSurcharge {
    switch (_selectedWeight) {
      case 'medium':
        return 700;
      case 'heavy':
        return 1800;
      case 'bulky':
        return 4200;
      default:
        return 0;
    }
  }

  int get _speedSurcharge => _selectedSpeed == 'instant' ? 500 : 0;
  int get _vehicleSurcharge => _selectedVehicle == 'van' ? 2500 : 0;
  int get _insuranceFee => 150;

  int get _totalFare =>
      _baseFare +
      _distanceFare +
      _weightSurcharge +
      _speedSurcharge +
      _vehicleSurcharge +
      _insuranceFee;

  void _submitPickupRequest() {
    if (_pickupAddressController.text.trim().isEmpty ||
        _deliveryAddressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter pickup and delivery addresses'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return _buildRiderMatchingDialog(dialogContext);
      },
    );
  }

  Widget _buildRiderMatchingDialog(BuildContext dialogContext) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: FutureBuilder(
          future: Future.delayed(const Duration(seconds: 2)),
          builder: (context, snapshot) {
            final isFound = snapshot.connectionState == ConnectionState.done;

            if (!isFound) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 10),
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 90,
                        height: 90,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFF1B62F0)),
                          backgroundColor:
                              const Color(0xFF1B62F0).withOpacity(0.12),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: const BoxDecoration(
                          color: Color(0xFFEFF6FF),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(fixIcon(FlexIcon.remix.satelliteDish),
                            size: 34, color: Color(0xFF1B62F0)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Matching Nearest Courier',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Scanning 8 active riders in Lekki Phase 1 zone...',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                ],
              );
            }

            final matchedCourier = MockData.couriers.first;
            final newTrackingId =
                'OF-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFFECFDF5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(fixIcon(FlexIcon.remix.checkSquare),
                      size: 40, color: Color(0xFF059669)),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Courier Assigned!',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tracking Ref: $newTrackingId',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1B62F0)),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: const Color(0xFFCBD5E1),
                        backgroundImage:
                            AssetImage(matchedCourier.avatarAsset),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              matchedCourier.name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  color: Color(0xFF0F172A)),
                            ),
                            Text(
                              matchedCourier.vehicle,
                              style: const TextStyle(
                                  fontSize: 11, color: Color(0xFF64748B)),
                            ),
                            Row(
                              children: [
                                Icon(fixIcon(FlexIcon.remix.starCircle),
                                    size: 13, color: Color(0xFFF59E0B)),
                                const SizedBox(width: 2),
                                Text(
                                  '${matchedCourier.rating} • Arriving in 4 mins',
                                  style: const TextStyle(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF059669)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1B62F0),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    onPressed: () {
                      Navigator.of(dialogContext).pop();
                      setState(() => _isProcessing = false);

                      // Create and register new ShipmentItem
                      final newShipment = ShipmentItem(
                        id: newTrackingId,
                        title: _parcelDescController.text.trim().isNotEmpty
                            ? _parcelDescController.text.trim()
                            : 'Express Parcel',
                        category: _selectedCategory,
                        status: ShipmentStatus.transit,
                        departureDate: 'Today',
                        sender: _senderNameController.text.trim(),
                        estimatedDate: 'Today, within 45 mins',
                        destination: _deliveryAddressController.text.trim(),
                        currentStep: 1,
                        itemIconType: 'mac',
                      );

                      MockData.addShipment(newShipment);

                      // Navigate to Live Tracking
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) => TrackingScreen(
                            initialShipment: newShipment,
                          ),
                        ),
                      );
                    },
                    child: const Text('Track Live Courier',
                        style: TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        leading: IconButton(
          icon: Icon(Icons.arrow_back,
              size: 18, color: Color(0xFF0F172A)),
          onPressed: () {
            if (widget.onBack != null) {
              widget.onBack!();
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create Pickup Request',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A)),
            ),
            Text(
              'Blueprint §6.4 Independent Courier Dispatch',
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                Icon(fixIcon(FlexIcon.remix.flash3), size: 14, color: const Color(0xFF059669)),
                const SizedBox(width: 4),
                const Text(
                  'Live Dispatch',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF059669)),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. ROUTE TIMELINE (PICKUP & DESTINATION)
            _buildSectionHeader('1. Route & Contacts', fixIcon(FlexIcon.remix.lineArrowRoadmap)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // PICKUP SECTION
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: const BoxDecoration(
                              color: Color(0xFFEFF6FF),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(fixIcon(FlexIcon.remix.graphDot),
                                size: 10, color: Color(0xFF1B62F0)),
                          ),
                          Container(
                            width: 2,
                            height: 130,
                            color: const Color(0xFFE2E8F0),
                          ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'PICKUP LOCATION (SENDER)',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF1B62F0),
                                  letterSpacing: 0.5),
                            ),
                            const SizedBox(height: 6),
                            _buildInputField(
                              controller: _pickupAddressController,
                              hint: 'Enter pickup street address',
                              icon: fixIcon(FlexIcon.remix.locationPin3),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildInputField(
                                    controller: _senderNameController,
                                    hint: 'Sender name',
                                    icon: fixIcon(FlexIcon.remix.userCircleSingle),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: _buildInputField(
                                    controller: _senderPhoneController,
                                    hint: 'Sender phone',
                                    icon: fixIcon(FlexIcon.remix.phone),
                                    keyboardType: TextInputType.phone,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            _buildInputField(
                              controller: _pickupNotesController,
                              hint: 'Floor, apartment or gate code notes',
                              icon: fixIcon(FlexIcon.remix.newStickyNote),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // DROP-OFF SECTION
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: const BoxDecoration(
                          color: Color(0xFFECFDF5),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(fixIcon(FlexIcon.remix.locationPin3),
                            size: 16, color: Color(0xFF059669)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'DELIVERY DESTINATION (RECIPIENT)',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF059669),
                                  letterSpacing: 0.5),
                            ),
                            const SizedBox(height: 6),
                            _buildInputField(
                              controller: _deliveryAddressController,
                              hint: 'Enter destination street address',
                              icon: fixIcon(FlexIcon.remix.locationPin3),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildInputField(
                                    controller: _recipientNameController,
                                    hint: 'Recipient name',
                                    icon: fixIcon(FlexIcon.remix.userCircleSingle),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: _buildInputField(
                                    controller: _recipientPhoneController,
                                    hint: 'Recipient phone',
                                    icon: fixIcon(FlexIcon.remix.phone),
                                    keyboardType: TextInputType.phone,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            _buildInputField(
                              controller: _deliveryNotesController,
                              hint: 'Drop-off instructions for courier',
                              icon: fixIcon(FlexIcon.remix.chatBubbleTextSquare),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 2. PARCEL SPECIFICATIONS
            _buildSectionHeader('2. Parcel Attributes & Category',
                fixIcon(FlexIcon.remix.archiveBox)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select Item Category',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _categories.map((cat) {
                      final isSelected = _selectedCategory == cat['label'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedCategory = cat['label']);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF1B62F0)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                cat['icon'],
                                size: 14,
                                color: isSelected
                                    ? Colors.white
                                    : const Color(0xFF475569),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                cat['label'],
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: isSelected
                                      ? FontWeight.w700
                                      : FontWeight.w600,
                                  color: isSelected
                                      ? Colors.white
                                      : const Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Parcel Description',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  _buildInputField(
                    controller: _parcelDescController,
                    hint: 'Brief description of contents',
                    icon: fixIcon(FlexIcon.remix.pencilSquare),
                  ),
                  const SizedBox(height: 18),

                  // WEIGHT TIER CARDS
                  const Text(
                    'Estimated Size & Weight',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildWeightCard(
                        id: 'light',
                        title: 'Small',
                        sub: '< 1 kg',
                        icon: fixIcon(FlexIcon.remix.inboxOpen),
                      ),
                      const SizedBox(width: 8),
                      _buildWeightCard(
                        id: 'medium',
                        title: 'Medium',
                        sub: '1 - 5 kg',
                        icon: fixIcon(FlexIcon.remix.bag),
                      ),
                      const SizedBox(width: 8),
                      _buildWeightCard(
                        id: 'heavy',
                        title: 'Heavy',
                        sub: '5 - 15 kg',
                        icon: fixIcon(FlexIcon.remix.archiveBox),
                      ),
                      const SizedBox(width: 8),
                      _buildWeightCard(
                        id: 'bulky',
                        title: 'Bulky',
                        sub: '15+ kg',
                        icon: fixIcon(FlexIcon.remix.inbox),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 3. VEHICLE & DISPATCH SPEED
            _buildSectionHeader(
                '3. Vehicle & Delivery Speed', fixIcon(FlexIcon.remix.bicycleBike)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  // VEHICLE SELECTOR
                  Row(
                    children: [
                      Expanded(
                        child: _buildChoiceCard(
                          isSelected: _selectedVehicle == 'bike',
                          title: 'Express Motorbike',
                          subtitle: 'Fast city lane-splitting • Up to 10kg',
                          icon: fixIcon(FlexIcon.remix.bicycleBike),
                          onTap: () => setState(() => _selectedVehicle = 'bike'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildChoiceCard(
                          isSelected: _selectedVehicle == 'van',
                          title: 'Cargo Delivery Van',
                          subtitle: 'Weather-safe, large boxes (+₦2,500)',
                          icon: fixIcon(FlexIcon.remix.transferTruckTime),
                          onTap: () => setState(() => _selectedVehicle = 'van'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // SPEED SELECTOR
                  Row(
                    children: [
                      Expanded(
                        child: _buildChoiceCard(
                          isSelected: _selectedSpeed == 'instant',
                          title: 'Instant Dispatch',
                          subtitle: 'Rider matched in ~3m (+₦500)',
                          icon: fixIcon(FlexIcon.remix.flash3),
                          accentColor: const Color(0xFF1B62F0),
                          onTap: () => setState(() => _selectedSpeed = 'instant'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildChoiceCard(
                          isSelected: _selectedSpeed == 'scheduled',
                          title: 'Standard Today',
                          subtitle: 'Delivered before 6:00 PM',
                          icon: fixIcon(FlexIcon.remix.countdownTimer),
                          accentColor: const Color(0xFF059669),
                          onTap: () =>
                              setState(() => _selectedSpeed = 'scheduled'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 4. REAL-TIME LOGISTICS QUOTE & SUMMARY
            _buildSectionHeader('4. Logistics Fare Breakdown', fixIcon(FlexIcon.remix.receipt)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withOpacity(0.18),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildQuoteLine('Base Pickup Fare', '₦${_baseFare.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  _buildQuoteLine('Estimated Distance (18.2 km)', '₦${_distanceFare.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  if (_weightSurcharge > 0)
                    _buildQuoteLine('Weight Surcharge (${_selectedWeight.toUpperCase()})', '₦${_weightSurcharge.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  if (_speedSurcharge > 0)
                    _buildQuoteLine('Instant Express Guarantee', '₦${_speedSurcharge.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  if (_vehicleSurcharge > 0)
                    _buildQuoteLine('Dedicated Cargo Van Fee', '₦${_vehicleSurcharge.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  _buildQuoteLine('Digital Waybill & In-Transit Insurance', '₦${_insuranceFee.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'),
                  const Divider(color: Colors.white24, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Total Logistics Fee',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700)),
                          Text('All taxes, fuel & live GPS included',
                              style: TextStyle(
                                  color: Color(0xFF94A3B8), fontSize: 10.5)),
                        ],
                      ),
                      Text(
                        '₦${_totalFare.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 5. PAYMENT METHOD
            _buildSectionHeader('5. Payment Method', fixIcon(FlexIcon.remix.nonCommercialDollars)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildPaymentOption(
                    id: 'wallet',
                    title: 'Ofia Digital Wallet (₦244,000)',
                    sub: 'Instant one-tap payment deduction',
                    icon: fixIcon(FlexIcon.remix.wallet),
                  ),
                  const SizedBox(height: 8),
                  _buildPaymentOption(
                    id: 'card',
                    title: 'Debit Card / Paystack',
                    sub: 'Mastercard, Visa, Verve or USSD transfer',
                    icon: fixIcon(FlexIcon.remix.creditCard4),
                  ),
                  const SizedBox(height: 8),
                  _buildPaymentOption(
                    id: 'recipient',
                    title: 'Recipient Pays on Delivery',
                    sub: 'Recipient pays courier via Cash or POS terminal',
                    icon: fixIcon(FlexIcon.remix.userCollaborateGroup),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),

      // BOTTOM CONFIRMATION DOCK
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ESTIMATED FARE',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF64748B))),
                Text(
                  '₦${_totalFare.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                  style: const TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A)),
                ),
              ],
            ),
            const SizedBox(width: 18),
            Expanded(
              child: SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B62F0),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : Icon(fixIcon(FlexIcon.remix.flash3), size: 18),
                  label: Text(
                    _isProcessing ? 'Assigning...' : 'Request Dispatch Rider',
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                  onPressed: _isProcessing ? null : _submitPickupRequest,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF1B62F0)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0F172A)),
        ),
      ],
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF94A3B8)),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              keyboardType: keyboardType,
              style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0F172A)),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFF94A3B8)),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeightCard({
    required String id,
    required String title,
    required String sub,
    required IconData icon,
  }) {
    final isSelected = _selectedWeight == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedWeight = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFF1B62F0)
                  : const Color(0xFFE2E8F0),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  size: 20,
                  color: isSelected
                      ? const Color(0xFF1B62F0)
                      : const Color(0xFF64748B)),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: isSelected
                      ? const Color(0xFF1B62F0)
                      : const Color(0xFF1E293B),
                ),
              ),
              Text(
                sub,
                style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChoiceCard({
    required bool isSelected,
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    Color accentColor = const Color(0xFF1B62F0),
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? accentColor.withOpacity(0.06) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? accentColor : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? accentColor : const Color(0xFFE2E8F0),
                shape: BoxShape.circle,
              ),
              child: Icon(icon,
                  size: 16, color: isSelected ? Colors.white : const Color(0xFF475569)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? accentColor : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                        fontSize: 10, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuoteLine(String label, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          Text(amount,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String id,
    required String title,
    required String sub,
    required IconData icon,
  }) {
    final isSelected = _selectedPayment == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = id),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF1B62F0)
                : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                size: 20,
                color: isSelected
                    ? const Color(0xFF1B62F0)
                    : const Color(0xFF64748B)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: isSelected
                          ? const Color(0xFF1B62F0)
                          : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(sub,
                      style: const TextStyle(
                          fontSize: 10.5, color: Color(0xFF64748B))),
                ],
              ),
            ),
            Icon(
              isSelected
                  ? fixIcon(FlexIcon.remix.autoCorrectionCheck)
                  : fixIcon(FlexIcon.remix.roundAnchorPoint),
              color: isSelected
                  ? const Color(0xFF1B62F0)
                  : const Color(0xFF94A3B8),
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}
