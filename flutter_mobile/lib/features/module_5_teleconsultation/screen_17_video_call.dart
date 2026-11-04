import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/triage_models.dart';
import '../module_2_symptoms/screen_5_home_dashboard.dart';

class Screen17VideoCall extends StatefulWidget {
  final DoctorProfile doctor;

  const Screen17VideoCall({super.key, required this.doctor});

  @override
  State<Screen17VideoCall> createState() => _Screen17VideoCallState();
}

class _Screen17VideoCallState extends State<Screen17VideoCall> {
  int _secondsLeft = 900; // 15 minutes
  Timer? _callTimer;
  bool _isMuted = false;
  bool _isVideoOff = false;

  @override
  void initState() {
    super.initState();
    _callTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft > 0) {
        setState(() {
          _secondsLeft--;
        });
      } else {
        _callTimer?.cancel();
        _endCall();
      }
    });
  }

  void _endCall() {
    _callTimer?.cancel();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Consultation Terminée'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Merci pour votre échange avec ${widget.doctor.fullName}.'),
            const SizedBox(height: 12),
            const Text('📄 Le compte-rendu médical officiel et les recommandations ont été envoyés par SMS sur votre numéro.'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
            child: const Text('Retour à l\'Accueil'),
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const Screen5HomeDashboard()),
                (route) => false,
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _callTimer?.cancel();
    super.dispose();
  }

  String _formatTimer(int totalSecs) {
    final m = totalSecs ~/ 60;
    final s = totalSecs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Flux Vidéo Médecin (Simulation UI)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 70,
                    backgroundColor: AppColors.primaryGreen.withOpacity(0.4),
                    child: const Icon(Icons.person, size: 80, color: Colors.white),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    widget.doctor.fullName,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${widget.doctor.specialty} • En ligne',
                    style: const TextStyle(color: Colors.greenAccent, fontSize: 14),
                  ),
                ],
              ),
            ),

            // Barre Supérieure : Timer et Nom
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.circle, color: Colors.red, size: 12),
                        const SizedBox(width: 8),
                        Text(
                          _formatTimer(_secondsLeft),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('Réseau Stable 3G/4G', style: TextStyle(color: Colors.white, fontSize: 12)),
                  ),
                ],
              ),
            ),

            // Vignette PIP Patient
            Positioned(
              right: 18,
              bottom: 120,
              child: Container(
                width: 90,
                height: 130,
                decoration: BoxDecoration(
                  color: Colors.grey.shade900,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white24, width: 2),
                ),
                child: Center(
                  child: Icon(
                    _isVideoOff ? Icons.videocam_off : Icons.face_rounded,
                    color: Colors.white70,
                    size: 36,
                  ),
                ),
              ),
            ),

            // Barre de Contrôles Inférieure
            Positioned(
              bottom: 24,
              left: 20,
              right: 20,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton.filled(
                    style: IconButton.styleFrom(
                      backgroundColor: _isMuted ? Colors.red : Colors.white24,
                      padding: const EdgeInsets.all(16),
                    ),
                    icon: Icon(_isMuted ? Icons.mic_off : Icons.mic, color: Colors.white, size: 28),
                    onPressed: () => setState(() => _isMuted = !_isMuted),
                  ),
                  IconButton.filled(
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.statusRed,
                      padding: const EdgeInsets.all(20),
                    ),
                    icon: const Icon(Icons.call_end_rounded, color: Colors.white, size: 36),
                    onPressed: _endCall,
                  ),
                  IconButton.filled(
                    style: IconButton.styleFrom(
                      backgroundColor: _isVideoOff ? Colors.red : Colors.white24,
                      padding: const EdgeInsets.all(16),
                    ),
                    icon: Icon(_isVideoOff ? Icons.videocam_off : Icons.videocam, color: Colors.white, size: 28),
                    onPressed: () => setState(() => _isVideoOff = !_isVideoOff),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
