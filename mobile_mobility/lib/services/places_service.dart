import 'dart:convert';
import 'package:http/http.dart' as http;

class Place {
  final String description;
  final String placeId;

  Place({required this.description, required this.placeId});

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      description: json['description'],
      placeId: json['place_id'],
    );
  }
}

class PlacesService {
  final String apiKey = 'AIzaSyCPSko-yh7VsQtpPyKzRmbXJWQOdcCJ8BE';

  Future<List<Place>> getAutocomplete(String search) async {
    if (search.isEmpty) {
      return [];
    }

    final String url =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$search&key=$apiKey';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        
        if (data['status'] == 'OK') {
          final List<dynamic> predictions = data['predictions'];
          return predictions.map((p) => Place.fromJson(p)).toList();
        }
      }
    } catch (e) {
      print('Error fetching places: $e');
    }

    return [];
  }
}
