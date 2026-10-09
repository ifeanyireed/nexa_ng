import 'package:flutter/material.dart';
import '../models/transport_models.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class TransportMockData {
  static final UserProfile currentUser = UserProfile(
    id: 'u_123',
    firstName: 'Ayodele',
    lastName: 'User',
    email: 'ayodele@company.com',
    phone: '+2348000000000',
    corporateCompanyId: 'corp_tech_ltd', // Automatically mapped via email
    walletBalance: 15450.0,
    rewardPoints: 340,
  );

  static final List<ServiceModule> enabledServices = [
    ServiceModule(
      id: 'srv_1',
      name: 'Ride',
      description:
          'Book a comfortable and affordable ride for your everyday commute. Get picked up in minutes and track your driver in real-time.',
      type: ServiceType.onDemand,
      imagePath: 'assets/images/ride.png',
      color: const Color(0xFF1769aa),
    ),
    ServiceModule(
      id: 'srv_2',
      name: 'Shuttle',
      description:
          'Join a scheduled shuttle to skip the traffic and travel comfortably. Reserve your seat, track the bus, and commute stress-free.',
      type: ServiceType.shuttle,
      imagePath: 'assets/images/shuttle.png',
      color: const Color(0xFF009688),
    ),
    ServiceModule(
      id: 'srv_3',
      name: 'Rent',
      description:
          'Rent a reliable and affordable vehicle with a driver for any occasion. Choose the vehicle type, set your trip details and book.',
      type: ServiceType.rental,
      imagePath: 'assets/images/rent.png',
      color: const Color(0xFF7354b5),
    ),
    ServiceModule(
      id: 'srv_4',
      name: 'Staff Transport',
      description:
          'Enjoy a seamless daily commute to and from your workplace. View your company-assigned routes and ride with your colleagues.',
      type: ServiceType.staff,
      imagePath: 'assets/images/staff.png',
      color: const Color(0xFFf44336),
    ),
    ServiceModule(
      id: 'srv_5',
      name: 'Interstate',
      description:
          'Travel comfortably across cities in our premium vehicles. Book your ticket ahead, choose your preferred seat, and enjoy the journey.',
      type: ServiceType.interstate,
      imagePath: 'assets/images/interstate.png',
      color: const Color(0xFFff9800),
    ),
    ServiceModule(
      id: 'srv_6',
      name: 'School',
      description:
          'Ensure safe and reliable daily transport for your children. Monitor their school bus in real-time and get updates on their trips.',
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
