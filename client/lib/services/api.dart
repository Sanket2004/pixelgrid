import 'dart:convert';
import 'package:http/http.dart' as http;

class WallpaperApiService {
  final String baseUrl;

  WallpaperApiService({required this.baseUrl});

  // Fetch wallpapers
  Future<Map<String, dynamic>> getWallpapers(
      {int page = 1, int limit = 10}) async {
    final url = Uri.parse('$baseUrl/wallpapers?page=$page&limit=$limit');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data; // Contains wallpapers, total, page, and totalPage
      } else {
        throw Exception(
            'Failed to fetch wallpapers. Status code: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching wallpapers: $e');
    }
  }

  // Download wallpaper by ID
  Future<Map<String, dynamic>> downloadWallpaper(String id) async {
    final url = Uri.parse('$baseUrl/wallpaper/$id');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data; // Contains imageUrl and updated downloads count
      } else if (response.statusCode == 403) {
        throw Exception('Wallpaper is not visible.');
      } else if (response.statusCode == 404) {
        throw Exception('Wallpaper not found.');
      } else {
        throw Exception(
            'Failed to download wallpaper. Status code: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error downloading wallpaper: $e');
    }
  }
}
