import 'package:flutter/material.dart';
import '../models/transport_models.dart';
import 'package:flexicon/flexicon.dart';
import '../utils/icon_util.dart';
import '../data/transport_mock_data.dart';
import 'services/on_demand_screen.dart';
import 'services/shuttle_screen.dart';
import 'services/rental_screen.dart';
import 'services/staff_screen.dart';
import 'services/interstate_screen.dart';
import 'services/school_screen.dart';
import 'account_screen.dart';
import 'bookings_screen.dart'; // Add Account Screen import

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final UserProfile user = TransportMockData.currentUser;
  final List<ServiceModule> services = TransportMockData.enabledServices;
  final Trip? activeTrip = TransportMockData.activeTrip;

  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      bottomNavigationBar: _buildBottomNav(),
      body: SafeArea(
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_currentIndex == 1) {
      return const BookingsScreen();
    } else if (_currentIndex == 2) {
      return AccountScreen(user: user);
    }

    return CustomScrollView(
      slivers: [
        _buildHeader(),
        _buildDynamicServiceGrid(),
        _buildBanners(),

        if (activeTrip != null) _buildActiveTripWidget(),
        _buildIntelligentPrompt(),
        const SliverPadding(padding: EdgeInsets.only(bottom: 40)),
      ],
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        height: 66,
        elevation: 0,
        destinations: [
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.home2)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.home2)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.receipt)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.receipt)),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.userCircleSingle)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.userCircleSingle)),
            label: 'My Account',
          ),
        ],
      ),
    );
  }

  SliverToBoxAdapter _buildHeader() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('Lagos, Nigeria', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14)),
                    Icon(Icons.keyboard_arrow_down, size: 20),
                  ],
                ),
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.customerSupport5), color: Colors.black),
                    const SizedBox(width: 16),
                    Stack(
                      children: [
                        Icon(fixIcon(FlexIcon.remix.bellNotification), color: Colors.black),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                          ),
                        )
                      ],
                    )
                  ],
                )
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Text(
                  'Hi, ${user.firstName}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.starCircle), color: Colors.orange, size: 14),
                      const SizedBox(width: 4),
                      Text('${user.rewardPoints}', style: const TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: TextField(
                decoration: InputDecoration(
                  icon: Icon(fixIcon(FlexIcon.remix.magnifyingGlass), color: Colors.grey),
                  hintText: 'Where would you like to go?',
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildActiveTripWidget() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1B62F0),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1B62F0).withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Ongoing ${activeTrip!.serviceType.name}',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Text(
                    activeTrip!.status.name.toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildTimelineIcon(fixIcon(FlexIcon.remix.locationTarget2), Colors.white),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Pickup', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        Text(activeTrip!.pickupLocation, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  Text(activeTrip!.pickupTime.toString().substring(11, 16), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(left: 17),
                child: Container(width: 2, height: 20, color: Colors.white.withOpacity(0.3)),
              ),
              Row(
                children: [
                  _buildTimelineIcon(fixIcon(FlexIcon.remix.locationPin3), Colors.white),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Drop-off', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        Text(activeTrip!.destination, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimelineIcon(IconData icon, Color color) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
      child: Icon(icon, size: 16, color: color),
    );
  }

  SliverToBoxAdapter _buildIntelligentPrompt() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF1B62F0), Color(0xFF1E3A8A)]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Going to Work?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                  SizedBox(height: 4),
                  Text('Tap to book your usual Staff route.', style: TextStyle(color: Color(0xFFBAE6FD), fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                child: Icon(Icons.chevron_right, color: Color(0xFF1B62F0), size: 20),
              )
            ],
          ),
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildBanners() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.only(top: 10, bottom: 20),
        child: SizedBox(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            physics: const BouncingScrollPhysics(),
            itemCount: 5,
            itemBuilder: (context, index) {
              return Container(
                width: MediaQuery.of(context).size.width * 0.85,
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  image: DecorationImage(
                    image: AssetImage('assets/images/banner${index + 1}.png'),
                    fit: BoxFit.cover,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
  SliverToBoxAdapter _buildDynamicServiceGrid() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Explore Services',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.9,
              ),
              itemCount: services.length,
              itemBuilder: (context, index) {
                final service = services[index];
                return _buildServiceIcon(service);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceIcon(ServiceModule service) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (service.type == ServiceType.onDemand) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const OnDemandScreen()));
            } else if (service.type == ServiceType.shuttle) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ShuttleScreen()));
            } else if (service.type == ServiceType.rental) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const RentalScreen()));
            } else if (service.type == ServiceType.staff) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const StaffScreen()));
            } else if (service.type == ServiceType.interstate) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const InterstateScreen()));
            } else if (service.type == ServiceType.school) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SchoolScreen()));
            }
          },
          borderRadius: BorderRadius.circular(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: service.color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(service.icon, color: service.color, size: 24),
              ),
              const SizedBox(height: 10),
              Text(
                service.name,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
