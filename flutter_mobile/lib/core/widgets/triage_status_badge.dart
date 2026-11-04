import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/enums.dart';

/// Carte de Statut de Triage - Visibilité Maximale
/// Couleurs normées : Vert (Léger), Orange (Modéré), Rouge (Urgence Vitale)
class TriageStatusCard extends StatelessWidget {
  final TriageUrgencyLevel urgency;
  final String conditionName;
  final bool ruleBasedOverride;

  const TriageStatusCard({
    super.key,
    required this.urgency,
    required this.conditionName,
    this.ruleBasedOverride = false,
  });

  @override
  Widget build(BuildContext context) {
    final (bgGradient, iconData, title, alertSub) = switch (urgency) {
      TriageUrgencyLevel.vert => (
          [AppColors.statusGreen, const Color(0xFF388E3C)],
          Icons.check_circle_outline_rounded,
          'CAS VERT — LÉGER (70%)',
          'Symptômes bénins. Conseils & auto-soins recommandés.'
        ),
      TriageUrgencyLevel.orange => (
          [const Color(0xFFF57C00), AppColors.statusOrange],
          Icons.warning_amber_rounded,
          'CAS ORANGE — MODÉRÉ (20%)',
          'Nécessite une attention médicale sous 24h à 48h.'
        ),
      TriageUrgencyLevel.rouge => (
          [AppColors.statusRed, const Color(0xFFB71C1C)],
          Icons.emergency_rounded,
          'CAS ROUGE — URGENCE VITALE (10%)',
          'Alerte immédiate. Transfert d\'urgence à l\'hôpital le plus proche.'
        ),
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: bgGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: bgGradient.first.withOpacity(0.3),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(iconData, color: Colors.white, size: 36),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            conditionName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            alertSub,
            style: TextStyle(
              color: Colors.white.withOpacity(0.95),
              fontSize: 14,
              height: 1.3,
            ),
          ),
          if (ruleBasedOverride) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '🛡️ Imposé par règle clinique déterministe (PCIME / TETU)',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
