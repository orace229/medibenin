import 'package:flutter/material.dart';

/// Gros Bouton Universel - Principe "Conçu pour ma grand-mère"
/// Haut contraste, grande zone tactile (min 60px), icône évidente.
class MediBigButton extends StatelessWidget {
  final String label;
  final String? subtitle;
  final IconData icon;
  final Color backgroundColor;
  final Color foregroundColor;
  final VoidCallback onTap;
  final bool isFullWidth;

  const MediBigButton({
    super.key,
    required this.label,
    this.subtitle,
    required this.icon,
    this.backgroundColor = const Color(0xFF2E7D32),
    this.foregroundColor = Colors.white,
    required this.onTap,
    this.isFullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      child: Material(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(18),
        elevation: 3,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 30, color: foregroundColor),
                const SizedBox(width: 14),
                Flexible(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          color: foregroundColor,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          subtitle!,
                          style: TextStyle(
                            color: foregroundColor.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ],
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
