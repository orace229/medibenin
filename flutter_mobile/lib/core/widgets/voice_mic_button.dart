import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Bouton Microphone Central Animé
/// Conçu pour l'expression libre orale en Fon, Yoruba, Bariba ou Français.
class VoiceMicButton extends StatefulWidget {
  final bool isRecording;
  final VoidCallback onToggleRecord;
  final String statusText;

  const VoiceMicButton({
    super.key,
    required this.isRecording,
    required this.onToggleRecord,
    required this.statusText,
  });

  @override
  State<VoiceMicButton> createState() => _VoiceMicButtonState();
}

class _VoiceMicButtonState extends State<VoiceMicButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedBuilder(
          animation: _scaleAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: widget.isRecording ? _scaleAnimation.value : 1.0,
              child: child,
            );
          },
          child: Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: widget.isRecording
                    ? [AppColors.statusRed, const Color(0xFFE57373)]
                    : [AppColors.primaryGreen, const Color(0xFF43A047)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: (widget.isRecording
                          ? AppColors.statusRed
                          : AppColors.primaryGreen)
                      .withOpacity(0.35),
                  blurRadius: 24,
                  spreadRadius: widget.isRecording ? 8 : 4,
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              shape: const CircleBorder(),
              child: InkWell(
                onTap: widget.onToggleRecord,
                customBorder: const CircleBorder(),
                child: Center(
                  child: Icon(
                    widget.isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                    size: 64,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          widget.statusText,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: widget.isRecording ? AppColors.statusRed : AppColors.textDark,
          ),
        ),
      ],
    );
  }
}
