import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/models/enums.dart';
import '../../../services/mock_data_service.dart';
import '../../module_6_followup/screen_19_followup_j2.dart';
import '../../module_7_audit_admin/screen_20_audit_queue.dart';
import '../../module_7_audit_admin/screen_22_settings_legal.dart';

class TabFamilyFollowup extends StatelessWidget {
  const TabFamilyFollowup({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final patient = service.currentPatient;
    final history = service.consultationHistory;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Carte Carnet de Santé Foyer
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.earthAccent, AppColors.earthAccent.withOpacity(0.85)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: AppColors.earthAccent.withOpacity(0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.family_restroom_rounded, color: Colors.white, size: 34),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Carnet de Santé Familial',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Profil actif : ${patient.nameOrNickname} (${patient.age} ans)',
                        style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Numéro SMS : ${patient.phoneNumber}',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Historique des Triages',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
              Text(
                '${history.length} consultation(s)',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 10),

          ...history.map((t) {
            final (badgeBg, badgeFg) = switch (t.urgency) {
              TriageUrgencyLevel.vert => (AppColors.primaryGreenLight, AppColors.primaryGreenDark),
              TriageUrgencyLevel.orange => (const Color(0xFFFFF3E0), AppColors.statusOrangeDark),
              TriageUrgencyLevel.rouge => (AppColors.statusRedLight, AppColors.statusRed),
            };

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: badgeBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(t.urgency.label, style: TextStyle(color: badgeFg, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      Text(
                        '${t.timestamp.day}/${t.timestamp.month}/${t.timestamp.year}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(t.conditionName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('Pour : ${t.patientName}', style: const TextStyle(fontSize: 12, color: AppColors.earthAccent, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text(
                    t.adviceFrench,
                    style: const TextStyle(fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        t.recommendedFacility,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.check_circle_outline, size: 16),
                        label: const Text('Bilan J+2'),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => Screen19FollowupJ2(triage: t)),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 16),

          // Accès Comité Médical & APDP
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.verified_user_rounded, size: 18, color: Colors.purple),
                  label: const Text('Comité Médical', style: TextStyle(color: Colors.purple, fontSize: 12)),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const Screen20AuditQueue()),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.gavel_rounded, size: 18, color: AppColors.earthAccent),
                  label: const Text('Légal & APDP', style: TextStyle(color: AppColors.earthAccent, fontSize: 12)),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const Screen22SettingsLegal()),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
