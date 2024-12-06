import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:client/components/RotatingLogo.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:wallpaper/wallpaper.dart';

class SetWallpaperPage extends StatefulWidget {
  final String imageUrl;

  const SetWallpaperPage({Key? key, required this.imageUrl}) : super(key: key);

  @override
  State<SetWallpaperPage> createState() => _SetWallpaperPageState();
}

class _SetWallpaperPageState extends State<SetWallpaperPage> {
  late Stream<String> progressStream;
  bool isDownloading = false;
  String downloadProgress = "0%";
  String Logo = "assets/logo.png";

  Future<void> setWallpaper() async {
    try {
      final width = MediaQuery.of(context).size.width.toInt();
      final height = MediaQuery.of(context).size.height.toInt();

      setState(() {
        isDownloading = true;
      });

      // Start wallpaper download and setting process
      progressStream = Wallpaper.imageDownloadProgress(widget.imageUrl);
      progressStream.listen((progress) {
        setState(() {
          downloadProgress = progress;
        });
      }, onDone: () async {
        // Set the wallpaper after download
        await Wallpaper.bothScreen(
          // options: RequestSizeOptions.resizeFit,
          width: width.toDouble(),
          height: height.toDouble(),
        );

        setState(() {
          isDownloading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Wallpaper set successfully!".toUpperCase(),
              style: TextStyle(
                  color: Colors.black,
                  fontFamily: GoogleFonts.spaceMono().fontFamily,
                  letterSpacing: 1),
            ),
            backgroundColor: Colors.white,
          ),
        );
      }, onError: (error) {
        setState(() {
          isDownloading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Error setting wallpaper: $error",
              style: TextStyle(
                  color: Colors.black,
                  fontFamily: GoogleFonts.spaceMono().fontFamily,
                  letterSpacing: 1),
            ),
            backgroundColor: Colors.white,
          ),
        );
      });
    } catch (e) {
      setState(() {
        isDownloading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "Failed to set wallpaper: $e",
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
      body: Stack(
        children: [
          // Display the wallpaper image
          SizedBox.expand(
            child: CachedNetworkImage(
              imageUrl: widget.imageUrl,
              placeholder: (context, url) {
                return Center(child: RotatingLogo(logoAssetPath: Logo));
              },
              fit: BoxFit.cover,
            ),
          ),

          // Gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.white.withOpacity(0.7), // light at the bottom
                    Colors.transparent, // Transparent at the top
                  ],
                ),
              ),
            ),
          ),

          // Bottom button and progress
          Align(
            alignment: AlignmentDirectional.bottomCenter,
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.8,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: isDownloading ? null : setWallpaper,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 50, vertical: 18),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  child: isDownloading
                      ? Text(
                          "Downloading... [$downloadProgress]".toUpperCase(),
                          style: TextStyle(
                              letterSpacing: 1,
                              fontFamily: GoogleFonts.spaceMono().fontFamily),
                        )
                      : Text(
                          "Set Wallpaper".toUpperCase(),
                          style: TextStyle(
                              letterSpacing: 1,
                              fontFamily: GoogleFonts.spaceMono().fontFamily),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
