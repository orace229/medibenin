import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/triage_models.dart';
import '../../services/mock_data_service.dart';

class Screen21AuditCaseDetail extends StatefulWidget {
  final AuditCaseItem auditCase;

  const Screen21AuditCaseDetail({super.key, required this.auditCase});

  @override
  State<Screen21AuditCaseDetail> createState() => _Screen21AuditCaseDetailState();
}

class _Screen21AuditCaseDetailState extends State<Screen21AuditCaseDetail> {
  final MockDataService _service = MockDataService();
  final _commentController = TextEditingController();

  void _submitReview(bool approved) {
    _service.reviewAuditCase(
      widget.auditCase.caseId,
      approved,
      _commentController.text.trim(),
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: approved ? Colors.green : Colors.red,
        content: Text(approved ? '✅ Cas validé cliniquement !' : '❌ Anomalie signalée au comité collégial.'),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.auditCase;

    return Scaffold(
      appBar: AppBar(
        title: Text('Audit : ${c.caseId}'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Fiche Patient
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Patient & Contexte :', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMuted)),
                    const SizedBox(height: 4),
                    Text(c.patientAgeGender, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    if (c.temperature != null) ...[
                      const SizedBox(height: 6),
                      Text('Température mesurée : ${c.temperature} °C', style: const TextStyle(color: AppColors.statusRed, fontWeight: FontWeight.bold)),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Symptômes
              const Text('Symptômes rapportés :', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Text(c.reportedSymptoms, style: const TextStyle(fontSize: 14, height: 1.4)),
              ),
              const SizedBox(height: 16),

              // Décision du Système
              const Text('Décision générée par le système :', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: c.systemUrgency.code == 'ROUGE' ? AppColors.statusRedLight : AppColors.primaryGreenLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  'Niveau : ${c.systemUrgency.label}\n${c.shapSummary}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 20),

              // Commentaire Médecin
              const Text('Commentaire / Avis de l\'auditeur :', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                controller: _commentController,
                maxLines: 3,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Note pour la revue collégiale (ex: sur-triage justifié par la fièvre)...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 24),

              // Boutons d'action
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.cancel_outlined),
                      label: const Text('Signaler Anomalie'),
                      onPressed: () => _submitReview(false),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.check_circle_rounded),
                      label: const Text('Valider Décision'),
                      onPressed: () => _submitReview(true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Center(
                child: Text(
                  '🔒 Les évolutions de règles sont soumises au circuit collégial.',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
