import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import '../../widgets/places_search_delegate.dart';
import '../../services/places_service.dart';
import '../payment_screen.dart';

class RentalPlanTripScreen extends StatefulWidget {
  const RentalPlanTripScreen({Key? key}) : super(key: key);

  @override
  State<RentalPlanTripScreen> createState() => _RentalPlanTripScreenState();
}

class _RentalPlanTripScreenState extends State<RentalPlanTripScreen> {
  bool _enableReturnTrip = false;
  bool _subscribeToRoute = false;
  Place? _origin;
  Place? _destination;
  DateTime? _departureDate;
  TimeOfDay? _departureTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Let's plan your next trip",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Origin / Destination Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Stack(
                      alignment: Alignment.centerRight,
                      children: [
                        Column(
                          children: [
                            _buildLocationField('Origin', 'Enter pickup location', _origin, () async {
                              final result = await showSearch<Place?>(
                                context: context,
                                delegate: PlacesSearchDelegate(),
                              );
                              if (result != null) {
                                setState(() => _origin = result);
                              }
                            }),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Divider(color: Color(0xFFE2E8F0)),
                            ),
                            _buildLocationField('Destination', 'Enter drop-off location', _destination, () async {
                              final result = await showSearch<Place?>(
                                context: context,
                                delegate: PlacesSearchDelegate(),
                              );
                              if (result != null) {
                                setState(() => _destination = result);
                              }
                            }),
                          ],
                        ),
                        // Swap Icon
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.swap_vert,
                              color: Colors.black54),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Date and Time
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        GestureDetector(
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _departureDate ?? DateTime.now(),
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              setState(() => _departureDate = date);
                            }
                          },
                          child: Container(
                            color: Colors.transparent,
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_outlined,
                                    color: Colors.grey, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                      _departureDate != null 
                                          ? '${_departureDate!.day}/${_departureDate!.month}/${_departureDate!.year}' 
                                          : 'Departure Date',
                                      style: TextStyle(
                                          fontSize: 14, 
                                          color: _departureDate != null ? Colors.black : Colors.black87)),
                                ),
                                const Icon(Icons.chevron_right, color: Colors.grey),
                              ],
                            ),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: Divider(color: Color(0xFFE2E8F0)),
                        ),
                        GestureDetector(
                          onTap: () async {
                            final time = await showTimePicker(
                              context: context,
                              initialTime: _departureTime ?? TimeOfDay.now(),
                            );
                            if (time != null) {
                              setState(() => _departureTime = time);
                            }
                          },
                          child: Container(
                            color: Colors.transparent,
                            child: Row(
                              children: [
                                const Icon(Icons.access_time_outlined,
                                    color: Colors.grey, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                      _departureTime != null 
                                          ? _departureTime!.format(context) 
                                          : 'Departure Time',
                                      style: TextStyle(
                                          fontSize: 14, 
                                          color: _departureTime != null ? Colors.black : Colors.black87)),
                                ),
                                const Icon(Icons.chevron_right, color: Colors.grey),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Toggles
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Enable Return trip',
                                style: TextStyle(fontSize: 14)),
                            Switch(
                              value: _enableReturnTrip,
                              onChanged: (val) =>
                                  setState(() => _enableReturnTrip = val),
                              activeColor: const Color(0xFF00C853),
                            ),
                          ],
                        ),
                        const Divider(color: Color(0xFFE2E8F0)),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Subscribe to route',
                                style: TextStyle(fontSize: 14)),
                            Switch(
                              value: _subscribeToRoute,
                              onChanged: (val) =>
                                  setState(() => _subscribeToRoute = val),
                              activeColor: const Color(0xFF00C853),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  if (_subscribeToRoute) ...[
                    const SizedBox(height: 20),
                    const Text('Trip Days',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
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
                    const Text('Trip Duration (In weeks)',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 12),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Expires: after 3 weeks',
                              style: TextStyle(fontWeight: FontWeight.w500)),
                          Text('Update',
                              style: TextStyle(
                                  color: Colors.blue.shade700,
                                  fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],

                ],
              ),
            ),
          ),

          // Bottom Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const PaymentScreen()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Proceed to Payment',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 400))
        .slideY(begin: 0.05, end: 0);
  }

  Widget _buildLocationField(String label, String hint, Place? selectedPlace, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: Colors.transparent, // Ensures the entire area is tappable
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 8),
            Text(
              selectedPlace?.description ?? hint,
              style: TextStyle(
                fontSize: 14,
                color: selectedPlace != null ? Colors.black : Colors.black87,
              ),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildDayBadge(String day, bool selected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? Colors.green.shade50 : Colors.transparent,
        border:
            Border.all(color: selected ? Colors.green : Colors.grey.shade300),
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
