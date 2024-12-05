import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final double? fontSize;
  final double? height;
  final double? width;
  final BorderRadiusGeometry? borderRadius;
  final EdgeInsetsGeometry? padding;
  final double? elevation;

  // Constructor to allow customization
  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.backgroundColor = Colors.black,
    this.textColor = Colors.white,
    this.fontSize = 12.0,
    this.height = 25.0,
    this.width = double.infinity,
    this.borderRadius = const BorderRadius.all(Radius.circular(12)),
    this.padding = const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
    this.elevation = 5.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ButtonStyle(
        backgroundColor: MaterialStateProperty.all(backgroundColor),
        padding: MaterialStateProperty.all(padding),
        shape: MaterialStateProperty.all(RoundedRectangleBorder(
          borderRadius: borderRadius!,
        )),
        elevation: MaterialStateProperty.all(elevation),
      ),
      child: Container(
        height: height,
        width: width,
        alignment: Alignment.center,
        child: Text(
          text.toUpperCase(),
          style: TextStyle(
            color: textColor,
            fontSize: fontSize,
            fontFamily: GoogleFonts.spaceMono().fontFamily,
            letterSpacing: 1.5,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
