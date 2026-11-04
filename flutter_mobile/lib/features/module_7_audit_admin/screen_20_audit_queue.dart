import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../services/mock_data_service.dart';
import 'screen_21_audit_case_detail.dart';

class Screen20AuditQueue extends StatelessWidget {
  const Screen20AuditQueue({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final cases = service.auditCases;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Comité Médical • File d\'Audit'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.purple.shade50,
              child: Row(
                children: [
                  Icon(Icons.verified_user_rounded, color: Colors.purple.shade800, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Supervision a posteriori : 100% des cas ROUGE + cas incertains sont audités collégialement.',
                      style: TextStyle(fontSize: 12, color: Colors.purple.shade900, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(18),
                itemCount: cases.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final c = cases[index];
                  final (tagBg, tagFg) = switch (c.systemUrgency) {
                    TriageUrgencyLevel.vert => (AppColors.primaryGreenLight, AppColors.primaryGreenDark),
                    TriageUrgencyLevel.orange => (const Color(0xFFFFF3E0), AppColors.statusOrangeDark),
                    TriageUrgencyLevel.rouge => (AppColors.statusRedLight, AppColors.statusRed),
                  };

                  return InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => Screen21AuditCaseDetail(auditCase: c)),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: c.isReviewed ? Colors.grey.shade300 : Colors.purple.shade200,
                          width: c.isReviewed ? 1 : 2,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(c.caseId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: tagBg,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(c.systemUrgency.code, style: TextStyle(color: tagFg, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(c.patientAgeGender, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(
                            c.reportedSymptoms,
                            style: const TextStyle(fontSize: 13, color: AppColors.textDark),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const Divider(height: 18),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                c.isReviewed
                                    ? (c.isApproved == true ? '✅ Validé par le médecin' : '❌ Signalé avec anomalie')
                                    : '⏳ En attente de révision',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: c.isReviewed ? (c.isApproved == true ? Colors.green : Colors.red) : Colors.purple.shade700,
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
