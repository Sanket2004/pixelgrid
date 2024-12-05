import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';

class RotatingLogo extends StatefulWidget {
  final String logoAssetPath;
  final double height;
  final double width;

  const RotatingLogo({
    Key? key,
    required this.logoAssetPath,
    this.height = 75.0,
    this.width = 75.0,
  }) : super(key: key);

  @override
  State<RotatingLogo> createState() => _RotatingLogoState();
}

class _RotatingLogoState extends State<RotatingLogo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(); // Loop the animation
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Drop shadow
            Transform.translate(
              offset: const Offset(5, 5), // Shadow offset
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                child: ColorFiltered(
                  colorFilter: ColorFilter.mode(
                    Colors.black.withOpacity(0.1), // Shadow color and opacity
                    BlendMode.srcATop,
                  ),
                  child: Image.asset(
                    widget.logoAssetPath,
                    height: widget.height,
                    width: widget.width,
                  ),
                ),
              ),
            ),
            // Rotating logo
            Transform.rotate(
              angle: _controller.value * 2 * pi, // Rotate 360 degrees
              child: Image.asset(
                widget.logoAssetPath,
                height: widget.height,
                width: widget.width,
              ),
            ),
          ],
        );
      },
    );
  }
}
