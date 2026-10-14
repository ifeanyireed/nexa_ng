import 'package:flutter/material.dart';
import '../services/places_service.dart';

class PlacesSearchDelegate extends SearchDelegate<Place?> {
  final PlacesService _placesService = PlacesService();

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
          },
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSuggestions();
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return _buildSuggestions();
  }

  Widget _buildSuggestions() {
    if (query.isEmpty) {
      return const Center(
        child: Text('Enter a destination'),
      );
    }

    return FutureBuilder<List<Place>>(
      future: _placesService.getAutocomplete(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return const Center(child: Text('Error loading places'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No results found'));
        }

        final places = snapshot.data!;
        return ListView.builder(
          itemCount: places.length,
          itemBuilder: (context, index) {
            final place = places[index];
            return ListTile(
              leading: const Icon(Icons.location_on, color: Colors.grey),
              title: Text(place.description),
              onTap: () {
                close(context, place);
              },
            );
          },
        );
      },
    );
  }
}
