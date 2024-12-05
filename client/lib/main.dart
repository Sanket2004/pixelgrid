import 'package:client/pages/WallpapersPage.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PixelGrid',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        textTheme: GoogleFonts.tekoTextTheme(
          Theme.of(context).textTheme,
        ),
        scaffoldBackgroundColor: Colors.white,
        // You can add more Material-specific themes or styles here
      ),
      home: const WallpapersPage(),
    );
  }
}
