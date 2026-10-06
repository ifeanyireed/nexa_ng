enum ShipmentStatus {
  transit('Transit'),
  process('Process'),
  delivered('Delivered'),
  pending('Pending');

  final String label;
  const ShipmentStatus(this.label);
}

class ShipmentItem {
  final String id;
  final String title;
  final String category;
  final ShipmentStatus status;
  final String departureDate;
  final String sender;
  final String estimatedDate;
  final String destination;
  final int currentStep; // 0 to 4
  final String itemIconType; // 'mac', 'chair', 'headphone', 'camera'

  const ShipmentItem({
    required this.id,
    required this.title,
    required this.category,
    required this.status,
    required this.departureDate,
    required this.sender,
    required this.estimatedDate,
    required this.destination,
    required this.currentStep,
    required this.itemIconType,
  });
}

class CourierInfo {
  final String name;
  final String trackingId;
  final double rating;
  final String phone;
  final String vehicle;
  final double lat;
  final double lng;
  final String avatarAsset;

  const CourierInfo({
    required this.name,
    required this.trackingId,
    required this.rating,
    required this.phone,
    required this.vehicle,
    required this.lat,
    required this.lng,
    required this.avatarAsset,
  });
}
