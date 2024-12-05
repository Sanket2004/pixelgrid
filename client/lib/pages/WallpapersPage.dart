import 'package:cached_network_image/cached_network_image.dart';
import 'package:client/components/CustomButton.dart';
import 'package:client/components/RotatingLogo.dart';
import 'package:client/services/api.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:google_fonts/google_fonts.dart';

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
  String Logo = "assets/logo.png";

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
      backgroundColor: Colors.white,
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
                )
                    .animate()
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(height: 20),
                // Wallpaper description or fallback text
                Text(
                  wallpaper['title'] ?? 'No description available.',
                  style: const TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.w900,
                      color: Colors.black),
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 10,
                ),
                Text(
                  wallpaper['description'] ?? 'No description available.',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.normal,
                      color: Colors.black45),
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 10,
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      height: 25,
                      width: 25,
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        border: Border.all(color: Colors.black),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.file_download_outlined,
                        size: 18,
                      ),
                    ),
                    const SizedBox(
                      width: 5,
                    ),
                    Text(
                      wallpaper['downloads'].toString(),
                      style: const TextStyle(fontSize: 18),
                    ),
                  ],
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 20,
                ),
                CustomButton(text: "Download", onPressed: () {})
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
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
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        title: Row(
          children: [
            Image.asset(
              Logo,
              width: 30,
              height: 30,
            ),
            const SizedBox(
              width: 5,
            ),
            RichText(
                text: TextSpan(
              children: [
                TextSpan(
                  text: 'PIXEL',
                  style: TextStyle(
                      fontSize: 22,
                      color: Colors.black54,
                      fontFamily:
                          GoogleFonts.spaceMono(fontWeight: FontWeight.bold)
                              .fontFamily),
                ),
                TextSpan(
                  text: 'GRID',
                  style: TextStyle(
                      fontSize: 22,
                      color: Colors.black,
                      fontFamily:
                          GoogleFonts.spaceMono(fontWeight: FontWeight.bold)
                              .fontFamily),
                ),
              ],
            )),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0, // No shadow
        iconTheme: const IconThemeData(color: Colors.black), // Icon color
      ),
      body: wallpapers.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset(
                    Logo,
                    height: 80,
                    width: 80,
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Text(
                    "Something great is coming...",
                    style: TextStyle(
                      fontSize: 20,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            )
          : isLoading
              ? Center(
                  child: RotatingLogo(logoAssetPath: Logo),
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
                          return Center(
                            child: Container(
                              decoration: BoxDecoration(
                                  color: Colors.black12,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.black)),
                              width: double.infinity,
                              height: 110,
                              child: Padding(
                                padding: const EdgeInsets.all(10.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Image.asset(
                                      Logo,
                                      height: 50,
                                    ),
                                    Text(
                                      "Image not found :(".toUpperCase(),
                                      style: TextStyle(
                                          fontSize: 10,
                                          fontFamily: GoogleFonts.spaceMono()
                                              .fontFamily),
                                    )
                                  ],
                                ),
                              ),
                            ),
                          )
                              .animate(delay: (100 * index).ms)
                              .slide(
                                  begin: const Offset(0, 1),
                                  end: const Offset(0, 0))
                              .fadeIn(duration: 500.ms) // Fade-in effect
                              .move(duration: 500.ms);
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
                                  Center(child: Container()),
                              errorWidget: (context, url, error) {
                                return const Icon(Icons.error_outline_outlined,
                                    size: 50);
                              },
                            ),
                          ),
                        )
                            .animate(delay: (100 * index).ms)
                            .slide(
                                begin: const Offset(0, 1),
                                end: const Offset(0, 0))
                            .fadeIn(duration: 500.ms) // Fade-in effect
                            .move(duration: 500.ms);
                      },
                    ),
                  ),
                ),
    );
  }
}
