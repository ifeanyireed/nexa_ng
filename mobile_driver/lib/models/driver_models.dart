enum TripStatus { pending, inProgress, completed, cancelled }

class Driver {
  final String id;
  final String name;
  final double rating;
  final int points;
  final int activeVehiclesCount;

  Driver({
    required this.id,
    required this.name,
    required this.rating,
    required this.points,
    required this.activeVehiclesCount,
  });
}

class Passenger {
  final String id;
  final String name;
  final String ticketNumber;
  final String status; // 'pending', 'picked_up', 'dropped_off'

  Passenger({
    required this.id,
    required this.name,
    required this.ticketNumber,
    required this.status,
  });
}

class TripStop {
  final String name;
  final String type; // 'pickup', 'dropoff'
  final List<Passenger> passengers;

  TripStop({
    required this.name,
    required this.type,
    required this.passengers,
  });
}

class DriverTrip {
  final String id;
  final String routeCode; // e.g. CMS401
  final String startLocation;
  final String endLocation;
  final String time;
  final int totalPassengers;
  final TripStatus status;
  final List<TripStop> stops;

  DriverTrip({
    required this.id,
    required this.routeCode,
    required this.startLocation,
    required this.endLocation,
    required this.time,
    required this.totalPassengers,
    required this.status,
    required this.stops,
  });
}
