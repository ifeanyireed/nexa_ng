import 'package:flutter/material.dart';
import '../models/transport_models.dart';
import 'package:mobile_fleet/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class TransportMockData {
  static final UserProfile currentUser = UserProfile(
    id: 'u_123',
    firstName: 'Ifeanyi',
    lastName: 'User',
    email: 'ifeanyi@company.com',
    phone: '+2348000000000',
    corporateCompanyId: 'corp_tech_ltd', // Automatically mapped via email
    walletBalance: 15450.0,
    rewardPoints: 340,
  );

  static final List<ServiceModule> enabledServices = [
    ServiceModule(
      id: 'srv_1',
      name: 'Ride',
      description: 'On-demand rides',
      type: ServiceType.onDemand,
      imagePath: 'assets/images/ride.png',
      color: const Color(0xFF1769aa),
    ),
    ServiceModule(
      id: 'srv_2',
      name: 'Shuttle',
      description: 'Scheduled shuttles',
      type: ServiceType.shuttle,
      imagePath: 'assets/images/shuttle.png',
      color: const Color(0xFF009688),
    ),
    ServiceModule(
      id: 'srv_3',
      name: 'Rent',
      description: 'Hire any vehicle',
      type: ServiceType.rental,
      imagePath: 'assets/images/rent.png',
      color: const Color(0xFF7354b5),
    ),
    ServiceModule(
      id: 'srv_4',
      name: 'Staff Transport',
      description: 'Corporate commute',
      type: ServiceType.staff,
      imagePath: 'assets/images/staff.png',
      color: const Color(0xFFf44336),
    ),
    ServiceModule(
      id: 'srv_5',
      name: 'Interstate',
      description: 'Travel between cities',
      type: ServiceType.interstate,
      imagePath: 'assets/images/interstate.png',
      color: const Color(0xFFff9800),
    ),
    ServiceModule(
      id: 'srv_6',
      name: 'School',
      description: 'School transport',
      type: ServiceType.school,
      imagePath: 'assets/images/school.png',
      color: const Color(0xFF2196f3),
    ),
  ];

  static final Trip? activeTrip = Trip(
    id: 'trip_8829',
    serviceType: ServiceType.shuttle,
    pickupLocation: 'Sangotedo Bus Stop',
    destination: 'Marina (Eko Electricity)',
    pickupTime: DateTime.now().add(const Duration(minutes: 15)),
    status: TripStatus.driverArriving,
    driverName: 'Samuel O.',
    vehiclePlate: 'KJA-123XD',
    vehicleModel: 'Toyota Hiace',
    estimatedFare: 1200.0,
  );
}
