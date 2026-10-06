import '../models/driver_models.dart';

class MockData {
  static final currentDriver = Driver(
    id: 'D001',
    name: 'Mr Ajit',
    rating: 5.0,
    points: 20,
    activeVehiclesCount: 4,
  );

  static final todaysTrips = [
    DriverTrip(
      id: 'T001',
      routeCode: 'CMS401',
      startLocation: 'Ademola Tokumbo',
      endLocation: 'CMS',
      time: '6:00 AM',
      totalPassengers: 15,
      status: TripStatus.pending,
      stops: [
        TripStop(
          name: 'Chevron Bus stop',
          type: 'pickup',
          passengers: [
            Passenger(id: 'P01', name: 'Abolaji Olunuga', ticketNumber: 'HG7623', status: 'pending'),
            Passenger(id: 'P02', name: 'Daniel Wilson', ticketNumber: 'HG7623', status: 'pending'),
            Passenger(id: 'P03', name: 'Jane Doe', ticketNumber: 'HG7623', status: 'pending'),
          ],
        ),
        TripStop(
          name: 'Yaba Bus stop',
          type: 'pickup',
          passengers: [
            Passenger(id: 'P04', name: 'James Nelson', ticketNumber: 'HG7623', status: 'pending'),
          ],
        ),
      ],
    ),
    DriverTrip(
      id: 'T002',
      routeCode: 'IKJ200',
      startLocation: 'Ikeja',
      endLocation: 'Victoria Island',
      time: '8:30 AM',
      totalPassengers: 10,
      status: TripStatus.pending,
      stops: [],
    ),
  ];
}
