import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Conteneur Responsive Adaptatif Multi-écrans
/// - Mobile (< 768px) : Plein écran natif
/// - Tablette / Desktop (>= 768px) : Mise en page spacieuse centrée avec largeur maximale fluide
class ResponsiveAppFrame extends StatelessWidget {
  final Widget child;

  const ResponsiveAppFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.backgroundLight,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1400),
          child: child,
        ),
      ),
    );
  }
}
