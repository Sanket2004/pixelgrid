import 'package:cached_network_image/cached_network_image.dart';
import 'package:client/services/api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';

class WallpapersPage extends StatefulWidget {
  const WallpapersPage({Key? key}) : super(key: key);

  @override
  State<WallpapersPage> createState() => _WallpapersPageState();
}

class _WallpapersPageState extends State<WallpapersPage> {
  final WallpaperApiService apiService = WallpaperApiService(
    baseUrl: 'https://pixelgrid-xt5k.onrender.com/api/user',
  );
  List<dynamic> wallpapers = [];
  bool isLoading = true;
  int page = 1;

  @override
  void initState() {
    super.initState();
    fetchWallpapers();
  }

  // Fetch wallpapers with pagination
  Future<void> fetchWallpapers() async {
    try {
      final data = await apiService.getWallpapers(page: page);
      setState(() {
        wallpapers.addAll(data['wallpapers']);
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching wallpapers: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  // Function to open bottom sheet with wallpaper image
  void _openBottomSheet(dynamic wallpaper) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Makes bottom sheet height flexible
      builder: (context) {
        return SingleChildScrollView(
          // Makes the bottom sheet scrollable
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Display the image with flexible height
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: CachedNetworkImage(
                    imageUrl: wallpaper['compressedUrl'] ?? '',
                    fit: BoxFit.cover,
                    width: double.infinity,
                    placeholder: (context, url) =>
                        const Center(child: CircularProgressIndicator()),
                    errorWidget: (context, url, error) =>
                        const Icon(Icons.error, size: 50),
                  ),
                ),
                const SizedBox(height: 20),
                // Wallpaper description or fallback text
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    wallpaper['description'] ?? 'No description available.',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallpapers',
            style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0, // No shadow
        iconTheme: const IconThemeData(color: Colors.black), // Icon color
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
              ),
            )
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: MasonryGridView.count(
                  crossAxisCount: 2, // Number of columns in the grid
                  mainAxisSpacing: 8.0, // Vertical space between tiles
                  crossAxisSpacing: 8.0, // Horizontal space between tiles
                  itemCount: wallpapers.length,
                  physics:
                      const AlwaysScrollableScrollPhysics(), // Ensure scrolling
                  itemBuilder: (context, index) {
                    final wallpaper = wallpapers[index];
                    final imageUrl = wallpaper['compressedUrl'] ?? '';

                    if (imageUrl.isEmpty) {
                      return const Center(child: Icon(Icons.image, size: 50));
                    }

                    return GestureDetector(
                      onTap: () => _openBottomSheet(wallpaper),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(
                            12), // Rounded corners for grid tiles
                        child: CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          placeholder: (context, url) =>
                              const Center(child: CircularProgressIndicator()),
                          errorWidget: (context, url, error) {
                            return const Icon(Icons.error, size: 50);
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
    );
  }
}
