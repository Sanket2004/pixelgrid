import 'package:cached_network_image/cached_network_image.dart';
import 'package:client/components/CustomButton.dart';
import 'package:client/components/RotatingLogo.dart';
import 'package:client/pages/SetWallpaperPage.dart';
import 'package:client/services/api.dart';
import 'package:fluentui_system_icons/fluentui_system_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class WallpapersPage extends StatefulWidget {
  const WallpapersPage({Key? key}) : super(key: key);

  @override
  State<WallpapersPage> createState() => _WallpapersPageState();
}

class _WallpapersPageState extends State<WallpapersPage> {
  final WallpaperApiService apiService = WallpaperApiService(
    baseUrl: dotenv.env['BASE_URL'] ?? "",
  );
  List<dynamic> wallpapers = [];
  bool isLoading = true;
  bool isLoadingMore = false; // To indicate loading more wallpapers
  int page = 1;
  int totalPage = 1;
  String Logo = "assets/logo.png";

  @override
  void initState() {
    super.initState();
    fetchWallpapers();
  }

  // Fetch wallpapers with pagination
  Future<void> fetchWallpapers({bool reset = false}) async {
    if (reset) {
      setState(() {
        page = 1; // Reset to first page
        totalPage = 1;
        wallpapers.clear(); // Clear the existing wallpapers
        isLoading = true;
      });
    }
    try {
      final data = await apiService.getWallpapers(page: page);
      setState(() {
        wallpapers =
            reset ? data['wallpapers'] : [...wallpapers, ...data['wallpapers']];
        totalPage = data['totalPage']; // Ensure totalPage is updated correctly
        isLoading = false;
        isLoadingMore = false;
      });
    } catch (e) {
      print('Error fetching wallpapers: $e');
      setState(() {
        isLoading = false;
        isLoadingMore = false;
      });
    }
  }

  // Fetch more wallpapers when scrolling reaches the bottom
  Future<void> fetchMoreWallpapers() async {
    if (isLoadingMore || isLoading)
      return; // Prevent multiple simultaneous fetch calls

    setState(() {
      isLoadingMore = true;
    });

    try {
      page++; // Increment page number
      final data = await apiService.getWallpapers(page: page);
      setState(() {
        // Avoid duplicates
        final newWallpapers = data['wallpapers']
            .where((newWallpaper) => !wallpapers
                .any((existing) => existing['_id'] == newWallpaper['_id']))
            .toList();
        wallpapers.addAll(newWallpapers);
        isLoadingMore = false; // Reset loading state
      });
    } catch (e) {
      print('Error fetching more wallpapers: $e');
      setState(() {
        isLoadingMore = false; // Reset loading state even on error
      });
    }
  }

  // Function to open bottom sheet with wallpaper image
  void _openBottomSheet(dynamic wallpaper) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Makes bottom sheet height flexible
      useSafeArea: false,
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
                    placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(
                      color: Colors.black,
                      backgroundColor: Colors.black12,
                    )),
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
                  style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.w900,
                      fontFamily:
                          GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w900)
                              .fontFamily,
                      color: Colors.black),
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 5,
                ),
                Text(
                  wallpaper['description'] ?? 'No description available.',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.normal,
                      color: Colors.black87),
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 20,
                ),
                Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              height: 20,
                              width: 20,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.black),
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: const Icon(
                                FluentIcons.arrow_download_48_regular,
                                size: 12,
                                color: Colors.black,
                              ),
                            ),
                            const SizedBox(
                              width: 5,
                            ),
                            Text(
                              "Downloads: ${wallpaper['downloads']}",
                              style: const TextStyle(
                                  fontSize: 14, color: Colors.black),
                            ),
                          ],
                        )
                            .animate(delay: 200.ms)
                            .slide(
                                begin: const Offset(0, 1),
                                end: const Offset(0, 0))
                            .fadeIn(duration: 500.ms) // Fade-in effect
                            .move(duration: 500.ms),
                        const SizedBox(
                          width: 20,
                        ),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              height: 20,
                              width: 20,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.black),
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: const Icon(
                                FluentIcons.calendar_32_regular,
                                size: 12,
                                color: Colors.black,
                              ),
                            ),
                            const SizedBox(
                              width: 5,
                            ),
                            Text(
                              DateFormat.yMMM('en_US').format(
                                  DateTime.parse(wallpaper['createdAt'])),
                              style: const TextStyle(
                                  fontSize: 14, color: Colors.black),
                            ),
                          ],
                        )
                            .animate(delay: 200.ms)
                            .slide(
                                begin: const Offset(0, 1),
                                end: const Offset(0, 0))
                            .fadeIn(duration: 500.ms) // Fade-in effect
                            .move(duration: 500.ms),
                      ],
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
                CustomButton(
                  text: "SET WALLPAPER",
                  onPressed: () async {
                    handleDownload(wallpaper['_id'], wallpaper['title']);
                  },
                )
                    .animate(delay: 200.ms)
                    .slide(begin: const Offset(0, 1), end: const Offset(0, 0))
                    .fadeIn(duration: 500.ms) // Fade-in effect
                    .move(duration: 500.ms),
                const SizedBox(
                  height: 20,
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> handleDownload(String id, String fileName) async {
    try {
      // Fetch the wallpaper data
      final wallpaperData = await apiService.downloadWallpaper(id);
      final imageUrl = wallpaperData['imageUrl'];

      if (imageUrl == null || imageUrl.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image URL not found!')),
        );
        return;
      }
      // print(imageUrl);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => SetWallpaperPage(imageUrl: imageUrl),
        ),
      );
    } catch (e) {
      print("Error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'An error occurred: $e',
            style: TextStyle(
                color: Colors.black,
                fontFamily: GoogleFonts.spaceMono().fontFamily,
                letterSpacing: 1),
          ),
          backgroundColor: Colors.white,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
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
              ),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0, // No shadow
        iconTheme: const IconThemeData(color: Colors.black), // Icon color
      ),
      body: isLoading
          ? Center(
              child: RotatingLogo(logoAssetPath: Logo),
            )
          : wallpapers.isEmpty
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
                      const SizedBox(
                        height: 20,
                      ),
                      const Text(
                        "Something great is coming...",
                        style: TextStyle(
                          fontSize: 20,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    await fetchWallpapers(reset: true);
                  },
                  color: Colors.black,
                  backgroundColor: Colors.white,
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                      child: Column(
                        children: [
                          // MasonryGridView for displaying wallpapers
                          MasonryGridView.count(
                            crossAxisCount: 2, // Number of columns in the grid
                            mainAxisSpacing:
                                8.0, // Vertical space between tiles
                            crossAxisSpacing:
                                8.0, // Horizontal space between tiles
                            itemCount: wallpapers.length,
                            physics:
                                const NeverScrollableScrollPhysics(), // Disable scrolling on grid
                            shrinkWrap: true,
                            itemBuilder: (context, index) {
                              final wallpaper = wallpapers[index];
                              final imageUrl = wallpaper['compressedUrl'] ?? '';

                              if (imageUrl.isEmpty) {
                                return Center(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.black12,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.black),
                                    ),
                                    width: double.infinity,
                                    height: 110,
                                    child: Padding(
                                      padding: const EdgeInsets.all(10.0),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Image.asset(
                                            Logo,
                                            height: 50,
                                          ),
                                          Text(
                                            "Image not found :(".toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontFamily:
                                                  GoogleFonts.spaceMono()
                                                      .fontFamily,
                                            ),
                                          ),
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
                                  borderRadius: BorderRadius.circular(12),
                                  child: CachedNetworkImage(
                                    imageUrl: imageUrl,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Center(
                                      child: Container(),
                                    ),
                                    errorWidget: (context, url, error) {
                                      return const Icon(
                                          Icons.error_outline_outlined,
                                          size: 50);
                                    },
                                  ),
                                ),
                              )
                                  .animate(delay: (100 * index).ms)
                                  .slide(
                                      begin: const Offset(0, 1),
                                      end: const Offset(0, 0))
                                  .fadeIn(duration: 500.ms)
                                  .move(duration: 500.ms);
                            },
                          ),
                          const SizedBox(
                            height: 20,
                          ),
                          // Pagination logic displayed at the bottom
                          if (isLoadingMore)
                            RotatingLogo(logoAssetPath: Logo)
                          else if (page < totalPage)
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 20.0),
                              child: Center(
                                child: IconButton(
                                  onPressed: () {
                                    fetchMoreWallpapers();
                                  },
                                  icon: const Icon(
                                    FluentIcons.add_square_28_regular,
                                    size: 35,
                                    color: Colors.black54,
                                  ),
                                ),
                              ),
                            )
                          else
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 20.0),
                              child: Center(
                                child: Text(
                                  "That's all".toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.black45,
                                    fontFamily: GoogleFonts.spaceMono(
                                            fontWeight: FontWeight.bold)
                                        .fontFamily,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }
}
