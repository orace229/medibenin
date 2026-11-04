import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../services/mock_data_service.dart';
import 'screen_19_followup_j2.dart';

class Screen18ConsultationHistory extends StatelessWidget {
  const Screen18ConsultationHistory({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final history = service.consultationHistory;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historique des Consultations'),
      ),
      body: SafeArea(
        child: history.isEmpty
            ? const Center(child: Text('Aucune consultation enregistrée pour l\'instant.'))
            : ListView.separated(
                padding: const EdgeInsets.all(18),
                itemCount: history.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final t = history[index];
                  final (badgeBg, badgeFg) = switch (t.urgency) {
                    TriageUrgencyLevel.vert => (AppColors.primaryGreenLight, AppColors.primaryGreenDark),
                    TriageUrgencyLevel.orange => (const Color(0xFFFFF3E0), AppColors.statusOrangeDark),
                    TriageUrgencyLevel.rouge => (AppColors.statusRedLight, AppColors.statusRed),
                  };

                  return Container(
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
                              child: Text(
                                t.urgency.label,
                                style: TextStyle(color: badgeFg, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                            Text(
                              '${t.timestamp.day}/${t.timestamp.month}/${t.timestamp.year}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          t.conditionName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Patient : ${t.patientName}',
                          style: const TextStyle(fontSize: 13, color: AppColors.earthAccent, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          t.adviceFrench,
                          style: const TextStyle(fontSize: 13, color: AppColors.textDark),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Orientation : ${t.recommendedFacility}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                            TextButton.icon(
                              icon: const Icon(Icons.check_box_outlined, size: 16),
                              label: const Text('Suivi J+2'),
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
                },
              ),
      ),
    );
  }
}
