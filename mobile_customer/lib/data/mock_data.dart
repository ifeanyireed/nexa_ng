import '../models/shipment.dart';

class MockData {
  static const String userName = 'Sarah Johnson';
  static const String userLocation = 'Jakarta, ID';
  static const double userBalance = 244.00;

  static const List<ShipmentItem> shipments = [
    ShipmentItem(
      id: 'D314315783',
      title: 'Mac Mini M4 Pro',
      category: 'Electronics',
      status: ShipmentStatus.transit,
      departureDate: '18 Oct 25',
      sender: 'Mr Jeddah',
      estimatedDate: 'Estimated 19 Oct 26',
      destination: 'Diriyah, Riyadh',
      currentStep: 3,
      itemIconType: 'mac',
    ),
    ShipmentItem(
      id: 'D314315783',
      title: 'Premium Chair',
      category: 'Furniture',
      status: ShipmentStatus.transit,
      departureDate: '18 Oct 25',
      sender: 'Mr Jeddah',
      estimatedDate: 'Estimated 19 Oct 26',
      destination: 'Diriyah, Riyadh',
      currentStep: 3,
      itemIconType: 'chair',
    ),
    ShipmentItem(
      id: 'D314315784',
      title: 'Premium Chair',
      category: 'Furniture',
      status: ShipmentStatus.process,
      departureDate: '18 Oct 25',
      sender: 'Mr Jeddah',
      estimatedDate: 'Estimated 19 Oct 26',
      destination: 'Diriyah, Riyadh',
      currentStep: 2,
      itemIconType: 'chair',
    ),
    ShipmentItem(
      id: 'D314315785',
      title: 'Premium Chair',
      category: 'Audio',
      status: ShipmentStatus.delivered,
      departureDate: '15 Oct 25',
      sender: 'Mr Jeddah',
      estimatedDate: 'Delivered 18 Oct 25',
      destination: 'Diriyah, Riyadh',
      currentStep: 4,
      itemIconType: 'headphone',
    ),
  ];

  static const List<CourierInfo> couriers = [
    CourierInfo(
      name: 'Mr. Sarah Jonson',
      trackingId: 'D314315783',
      rating: 5.0,
      phone: '+62 821-4509-8812',
      vehicle: 'Mercedes Sprinter Van (B 1234 OFI)',
      lat: 0.62,
      lng: 0.32,
      avatarAsset: 'assets/images/driver.jpg',
    ),
    CourierInfo(
      name: 'Jessica Vance',
      trackingId: 'D908123441',
      rating: 4.9,
      phone: '+62 811-3456-7890',
      vehicle: 'Honda PCX Scooter',
      lat: 0.28,
      lng: 0.72,
      avatarAsset: 'assets/images/avatar12.png',
    ),
    CourierInfo(
      name: 'Alex Rivera',
      trackingId: 'D712903445',
      rating: 5.0,
      phone: '+62 813-9087-6543',
      vehicle: 'Toyota HiAce Delivery',
      lat: 0.42,
      lng: 0.18,
      avatarAsset: 'assets/images/avatar14.png',
    ),
    CourierInfo(
      name: 'Elena Rostova',
      trackingId: 'D456789123',
      rating: 4.8,
      phone: '+62 815-6677-8899',
      vehicle: 'Yamaha NMAX Delivery',
      lat: 0.36,
      lng: 0.88,
      avatarAsset: 'assets/images/avatar17.png',
    ),
    CourierInfo(
      name: 'Michael Chen',
      trackingId: 'D654321987',
      rating: 4.95,
      phone: '+62 812-9988-7766',
      vehicle: 'Suzuki Carry Courier',
      lat: 0.54,
      lng: 0.86,
      avatarAsset: 'assets/images/avatar19.png',
    ),
  ];
}
