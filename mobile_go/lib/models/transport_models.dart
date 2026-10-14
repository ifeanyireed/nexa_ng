import 'package:flutter/material.dart';

enum ServiceType {
  shuttle,
  rental,
  staff,
  interstate,
  school,
  onDemand;

  String get displayName {
    switch (this) {
      case ServiceType.shuttle:
        return 'Shuttle';
      case ServiceType.rental:
        return 'Rental';
      case ServiceType.staff:
        return 'Staff';
      case ServiceType.interstate:
        return 'Interstate';
      case ServiceType.school:
        return 'School';
      case ServiceType.onDemand:
        return 'On Demand';
    }
  }
}

class ServiceModule {
  final String id;
  final String name;
  final String description;
  final ServiceType type;
  final String imagePath;
  final Color color;

  ServiceModule({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.imagePath,
    required this.color,
  });
}

enum TripStatus {
  searching,
  driverAssigned,
  driverArriving,
  arrived,
  inProgress,
  completed,
  cancelled;

  String get displayName {
    switch (this) {
      case TripStatus.searching:
        return 'Searching';
      case TripStatus.driverAssigned:
        return 'Driver Assigned';
      case TripStatus.driverArriving:
        return 'Driver Arriving';
      case TripStatus.arrived:
        return 'Arrived';
      case TripStatus.inProgress:
        return 'In Progress';
      case TripStatus.completed:
        return 'Completed';
      case TripStatus.cancelled:
        return 'Cancelled';
    }
  }
}

class Trip {
  final String id;
  final ServiceType serviceType;
  final String pickupLocation;
  final String destination;
  final DateTime pickupTime;
  final TripStatus status;
  final String? driverName;
  final String? vehiclePlate;
  final String? vehicleModel;
  final double? estimatedFare;

  Trip({
    required this.id,
    required this.serviceType,
    required this.pickupLocation,
    required this.destination,
    required this.pickupTime,
    required this.status,
    this.driverName,
    this.vehiclePlate,
    this.vehicleModel,
    this.estimatedFare,
  });
}

class UserProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String? corporateCompanyId; // If linked to a corporate account
  final double walletBalance;
  final int rewardPoints;

  UserProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.corporateCompanyId,
    this.walletBalance = 0.0,
    this.rewardPoints = 0,
  });

  bool get isCorporateLinked =>
      corporateCompanyId != null && corporateCompanyId!.isNotEmpty;
}
