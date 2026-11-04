import 'package:flutter/material.dart';

/// Charte Graphique Officielle MediBenin (CareX)
/// Conforme au Cahier des Charges & Principes d'Accessibilité Rurale
class AppColors {
  // Palette Principale
  static const Color primaryGreen = Color(0xFF2E7D32); // Santé, confiance, nature
  static const Color primaryGreenLight = Color(0xFFE8F5E9);
  static const Color primaryGreenDark = Color(0xFF1B5E20);

  // Niveaux de Triage
  static const Color statusGreen = Color(0xFF2E7D32);  // Cas Vert (Léger)
  static const Color statusOrange = Color(0xFFFFB74D); // Cas Orange (Modéré / Attention)
  static const Color statusOrangeDark = Color(0xFFE65100);
  static const Color statusRed = Color(0xFFD32F2F);    // Cas Rouge (Urgence Vitale)
  static const Color statusRedLight = Color(0xFFFFEBEE);

  // Teintes Locales & Neutres
  static const Color earthAccent = Color(0xFF795548);  // Racines, authenticité locale
  static const Color backgroundLight = Color(0xFFF8F9FA); // Fond clair, propreté
  static const Color cardSurface = Colors.white;
  static const Color textDark = Color(0xFF1A1A1A);
  static const Color textMuted = Color(0xFF666666);
  static const Color borderSubtle = Color(0xFFE0E0E0);

  // Couleurs Opérateurs Mobile Money Bénin
  static const Color mtnYellow = Color(0xFFFFCC00);
  static const Color moovBlue = Color(0xFF005BAC);
}
