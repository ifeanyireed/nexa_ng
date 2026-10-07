import 'package:flutter/material.dart';
import '../models/transport_models.dart';

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
      icon: Icons.local_taxi,
      color: const Color(0xFF1769aa),
    ),
    ServiceModule(
      id: 'srv_2',
      name: 'Shuttle',
      description: 'Scheduled shuttles',
      type: ServiceType.shuttle,
      icon: Icons.directions_bus,
      color: const Color(0xFF1B62F0),
    ),
    ServiceModule(
      id: 'srv_3',
      name: 'Rent',
      description: 'Hire any vehicle',
      type: ServiceType.rental,
      icon: Icons.car_rental,
      color: const Color(0xFF7354b5),
    ),
    ServiceModule(
      id: 'srv_4',
      name: 'Staff Transport',
      description: 'Corporate commute',
      type: ServiceType.staff,
      icon: Icons.business_center,
      color: const Color(0xFFe65100),
    ),
    ServiceModule(
      id: 'srv_5',
      name: 'Interstate',
      description: 'Travel between cities',
      type: ServiceType.interstate,
      icon: Icons.map,
      color: const Color(0xFFF59E0B),
    ),
    ServiceModule(
      id: 'srv_6',
      name: 'School',
      description: 'School transport',
      type: ServiceType.school,
      icon: Icons.school,
      color: const Color(0xFF10B981),
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
