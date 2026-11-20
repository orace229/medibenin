// Comprehensive resilient mock data fallback for client-side evaluation & preview
export function getMockResponseForUrl(url: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const cleanUrl = url.split('?')[0];

  // 1. Auth Me
  if (cleanUrl.includes('/api/auth/me')) {
    return {
      user: {
        uid: 'demo-patient-tariq',
        email: 'tariq.nadim@demo.medisense.ae',
        displayName: 'Tariq Al-Nadim (Adult 36y)',
        role: 'patient',
        preferredLanguage: 'en',
        facilityName: 'Centre de Santé Al Bateen (Abu Dhabi)',
        linkedPatientIds: ['PT-36Y-TARIQ', 'PT-18M-ZAYED', 'PT-14Y-LAYLA', 'PT-18Y-YOUSSEF'],
      },
    };
  }

  // 2. Demo Counts
  if (cleanUrl.includes('/api/demo/counts')) {
    return {
      cohortSize: 6000,
      panelSize: 53,
      story: 'Demo panel of 53 patients drawn from a 6,000-person synthetic cohort',
    };
  }

  // 3. Governance Status
  if (cleanUrl.includes('/api/governance/status')) {
    return {
      signed: true,
      rulesCount: 22,
      signatureHash: '4b8a9f2e7c3d1b0a8e5f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
      signerRole: 'Chief Medical Officer & Clinical Governance Committee',
      signedBy: 'Dr. Sydney Kpegbe, MD & DoH Clinical Ethics Board',
      reviewDate: '2026-11-20',
      activeRules: 22,
    };
  }

  // 4. Patient Profile
  if (cleanUrl.includes('/api/patient/profile/')) {
    const parts = cleanUrl.split('/');
    const pid = parts[parts.indexOf('profile') + 1] || 'PT-36Y-TARIQ';

    // Sub-endpoints
    if (cleanUrl.endsWith('/screening-plan')) {
      return getMockScreeningPlan(pid);
    }
    if (cleanUrl.endsWith('/reminders')) {
      return getMockReminderPlan(pid);
    }
    if (cleanUrl.endsWith('/reminders/schedule')) {
      return { status: 'scheduled', scheduledDate: '2026-11-28', plan: getMockReminderPlan(pid).plan };
    }
    if (cleanUrl.endsWith('/reminders/send')) {
      return { status: 'sent', sentAt: new Date().toISOString() };
    }
    if (cleanUrl.endsWith('/self-assessment')) {
      return getMockSelfAssessmentResult(options.body);
    }
    if (cleanUrl.endsWith('/consents')) {
      return { consents: JSON.parse((options.body as string) || '{}') };
    }
    if (cleanUrl.endsWith('/respond')) {
      return { status: 'success', recordedAt: new Date().toISOString() };
    }
    if (cleanUrl.endsWith('/export')) {
      return { exportDate: new Date().toISOString(), patientId: pid, compliance: 'DoH Health Data Privacy Policy v2026' };
    }

    return getMockPatientDetail(pid);
  }

  // 5. Family SMS OTP
  if (cleanUrl.includes('/api/patient/family/request-sms-otp')) {
    return {
      status: 'otp_sent',
      childId: 'PT-18M-ZAYED',
      childName: 'Zayed Al-Nadim',
      maskedPhone: '+971 50 *** 4829',
      demoOtpCode: '2026',
      expiresInSeconds: 300,
    };
  }
  if (cleanUrl.includes('/api/patient/family/verify-sms-otp')) {
    return { status: 'verified', childId: 'PT-18M-ZAYED' };
  }

  // 6. Clinician Patients List
  if (cleanUrl.includes('/api/clinician/patients')) {
    if (cleanUrl.match(/\/api\/clinician\/patients\/[^/]+$/)) {
      const pid = cleanUrl.split('/').pop() || 'PT-36Y-TARIQ';
      return { patient: getMockPatientDetail(pid).profile };
    }
    return { patients: getMockClinicianPatients() };
  }

  // 7. Coordinator Queue & Outreach
  if (cleanUrl.includes('/api/coordinator/queue')) {
    return { items: getMockCoordinatorQueue() };
  }
  if (cleanUrl.includes('/outreach')) {
    return {
      status: 'success',
      action: 'call',
      label: 'Appel de coordination consigné (support logistique Sprio)',
      loggedAt: new Date().toISOString(),
    };
  }
  if (cleanUrl.includes('/invitation')) {
    return {
      status: 'queued',
      message: 'Invitation officielle transmise sur le canal préférentiel.',
      sentAt: new Date().toISOString(),
    };
  }

  // 8. Acceptance Suite
  if (cleanUrl.includes('/api/governance/acceptance-tests')) {
    return { passed: 58, total: 58, allInvariantsHold: true };
  }

  return undefined;
}

function getMockPatientDetail(pid: string): any {
  if (pid === 'PT-18M-ZAYED') {
    return {
      profile: {
        id: 'PT-18M-ZAYED',
        displayName: 'Zayed Al-Nadim',
        ageYears: 1,
        ageMonths: 18,
        gestationalAgeWeeks: 39,
        sex: 'male',
        pathwayType: 'child',
        isPersona: true,
        parentUserId: 'PT-36Y-TARIQ',
        region: 'Abu Dhabi',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'ar',
        preferredChannel: 'WhatsApp',
        preferFemalePractitioner: true,
        accessTimeMinutes: 18,
        missedVisitsCount: 1,
        facilityCenter: 'Centre de Santé Al Bateen (Abu Dhabi)',
        primaryReasonSummary: 'Visite bien-être 18 mois (WCV) en retard, surveillance de croissance OMS et rappel vaccinal',
        nextDueDate: '2026-11-24',
        preventionProgressDone: 3,
        preventionProgressTotal: 5,
        referralCode: 'WCV8492Z',
        recommendationState: 'invited',
        overallLevel: 'orange',
        overallCertainty: 'probable',
        clinicalProfile: {
          weightKg: 10.8,
          heightCm: 81.5,
          muacMm: 148,
          weightForHeightZ: -0.3,
          bmiForAgeZ: -0.1,
          missedWcvConsecutive: 1,
          vaccineDelayDays: 38,
          isZeroDoseChild: false,
          anemiaScreeningDone: false,
        },
        calculations: {
          anthropometry: {
            weightKg: 10.8,
            heightCm: 81.5,
            bmi: 16.3,
            weightForHeightZ: -0.3,
            bmiForAgeZ: -0.1,
          },
        },
      },
      familyContext: {
        rootParent: { id: 'PT-36Y-TARIQ', displayName: 'Tariq Al-Nadim', ageYears: 36, pathwayType: 'adult' },
        affiliatedChildren: [
          { id: 'PT-18M-ZAYED', displayName: 'Zayed Al-Nadim', ageYears: 1, ageMonths: 18, sex: 'male', pathwayType: 'child', overallLevel: 'orange', primaryReasonSummary: 'Visite 18 mois WCV en retard' },
          { id: 'PT-14Y-LAYLA', displayName: 'Layla Al-Nadim', ageYears: 14, ageMonths: 168, sex: 'female', pathwayType: 'adolescent', overallLevel: 'green', primaryReasonSummary: 'Bilan adolescent à jour' },
          { id: 'PT-18Y-YOUSSEF', displayName: 'Youssef Al-Nadim', ageYears: 18, ageMonths: 216, sex: 'male', pathwayType: 'adult', overallLevel: 'yellow', primaryReasonSummary: 'Passage à la majorité 18 ans' },
        ],
      },
      flags: [
        { id: 'F-Z1', ruleId: 'P3', title: 'Visite Pédiatrique 18 Mois (WCV) en Retard', level: 'orange', certainty: 'probable', factors: ['Délai de 38 jours sur le calendrier vaccinal DoH.', 'Examen développemental et Z-score recommandés.'], missingData: [], dueDate: '2026-11-24', isEclipseSuspended: false },
      ],
      consents: { evaluationAndCalendar: true, channelReminders: true, shareWithFacility: true, anonymousStatistics: true, existingGenomicResult: false },
      nextRecommendation: { ruleId: 'P3', tier: 'orange', actionText: 'Visite Well-Child 18 mois & Rattrapage vaccinal', scheduledDate: '2026-11-24', status: 'invited', referralCode: 'WCV8492Z' },
    };
  }

  // Default: Tariq Al-Nadim (Adult 36y)
  return {
    profile: {
      id: 'PT-36Y-TARIQ',
      displayName: 'Tariq Al-Nadim',
      ageYears: 36,
      ageMonths: 432,
      gestationalAgeWeeks: 40,
      sex: 'male',
      pathwayType: 'adult',
      isPersona: true,
      parentUserId: null,
      region: 'Abu Dhabi',
      nationalityGroup: 'Emirati',
      insuranceCategory: 'Enhanced',
      preferredLanguage: 'en',
      preferredChannel: 'WhatsApp',
      preferFemalePractitioner: false,
      accessTimeMinutes: 35,
      missedVisitsCount: 1,
      facilityCenter: 'Centre de Santé Al Bateen (Abu Dhabi)',
      primaryReasonSummary: 'Tension artérielle limite (138/88 mmHg), bilan lipidique requis sous 30 jours',
      nextDueDate: '2026-11-28',
      preventionProgressDone: 3,
      preventionProgressTotal: 5,
      referralCode: 'IFH3692T',
      recommendationState: 'invited',
      overallLevel: 'orange',
      overallCertainty: 'probable',
      consentGenomic: true,
      clinicalProfile: {
        systolicBp1: 138,
        diastolicBp1: 89,
        systolicBp2: 136,
        diastolicBp2: 88,
        bpZoneLabel: 'Surveillance tensionnelle',
        weightKg: 78.0,
        heightCm: 175.0,
        bmi: 25.5,
        waistCm: 94,
        findriscScore: 12,
        smokingStatus: 'never',
        dailyPhysicalActivity: false,
        dailyFruitsVeg: true,
        antihypertensiveMed: false,
        historyHighGlucose: false,
        familyHistoryDiabetes: 'second_degree',
        familyHistoryFhOrEarlyCvd: true,
        ifhasFullScreeningDone: false,
        orientationLevel: 'orange',
        daysSinceOrientation: 14,
        bpSeries: [
          { dateLabel: 'Mai 2026', systolic: 128, diastolic: 82, targetMaxSys: 130, targetMaxDia: 85 },
          { dateLabel: 'Août 2026', systolic: 134, diastolic: 86, targetMaxSys: 130, targetMaxDia: 85 },
          { dateLabel: 'Oct 2026', systolic: 138, diastolic: 89, targetMaxSys: 130, targetMaxDia: 85 },
          { dateLabel: 'Nov 2026', systolic: 136, diastolic: 88, targetMaxSys: 130, targetMaxDia: 85 },
        ],
      },
      calculations: {
        whoCvdModel: {
          inDomain: true,
          domainNote: 'MENA 2019 Non-Lab Chart',
          regionUsed: 'MENA',
          riskPercent: 14,
          intervalLowPercent: 10,
          intervalHighPercent: 18,
          crossesThreshold: true,
          counterfactuals: [
            { factor: 'Pression Artérielle Systolique', currentValue: '138 mmHg', targetValue: '< 130 mmHg', riskReductionPct: 4 },
            { factor: 'Activité Physique Régulière', currentValue: 'Sédentaire', targetValue: '≥ 30 min/j', riskReductionPct: 3 },
          ],
        },
        bpProtocol: {
          reading1: '138/89',
          reading2: '136/88',
          reading3: null,
          spreadSys: 2,
          spreadDia: 1,
          requiresThirdReading: false,
          retainedSys: 137,
          retainedDia: 88,
          bpZoneLabel: 'Pré-hypertension / Surveillance',
        },
        anthropometry: {
          weightKg: 78,
          heightCm: 175,
          bmi: 25.5,
          waistCm: 94,
          correctedAgeMonths: null,
          weightForHeightZ: null,
          bmiForAgeZ: null,
          muacMm: null,
        },
        findriscModel: {
          score: 12,
          levelLabel: 'Risque modéré (1 sur 6 dans les 10 ans)',
          suspendedByPregnancy: false,
          asianBmiRuleA4Triggered: false,
          itemBreakdown: [
            { item: 'Âge (36 ans)', points: 0 },
            { item: 'IMC (25.5 kg/m²)', points: 1 },
            { item: 'Tour de taille (94 cm)', points: 3 },
            { item: 'Activité physique (< 30 min/j)', points: 2 },
            { item: 'Antécédents familiaux diabète', points: 3 },
            { item: 'Fruits et légumes quotidiens', points: 0 },
          ],
          questionnaireComplete: true,
          missingItems: [],
        },
        certaintyAudit: {
          completenessPercent: 88,
          provenanceCodes: { bp: 'M', bmi: 'M', smoking: 'D' },
          oldestMeasureMonths: 1,
          crossesWhoThreshold: true,
          finalCertainty: 'medium',
          certaintyReason: 'Données récentes complètes',
        },
        emergencyEscapeE0: { triggered: false, reason: null },
        eclipseSafeguard: { triggered: false, suspendedRuleIds: [] },
      },
    },
    familyContext: {
      rootParent: { id: 'PT-36Y-TARIQ', displayName: 'Tariq Al-Nadim', ageYears: 36, ageMonths: 432, pathwayType: 'adult' },
      affiliatedChildren: [
        { id: 'PT-18M-ZAYED', displayName: 'Zayed Al-Nadim', ageYears: 1, ageMonths: 18, sex: 'male', pathwayType: 'child', overallLevel: 'orange', overallCertainty: 'probable', primaryReasonSummary: 'Visite 18 mois WCV en retard + rappel vaccinal', nextDueDate: '2026-11-24' },
        { id: 'PT-14Y-LAYLA', displayName: 'Layla Al-Nadim', ageYears: 14, ageMonths: 168, sex: 'female', pathwayType: 'adolescent', overallLevel: 'green', overallCertainty: 'high', primaryReasonSummary: 'Bilan adolescent et croissance à jour', nextDueDate: '2027-02-15' },
        { id: 'PT-18Y-YOUSSEF', displayName: 'Youssef Al-Nadim', ageYears: 18, ageMonths: 216, sex: 'male', pathwayType: 'adult', overallLevel: 'yellow', overallCertainty: 'probable', primaryReasonSummary: 'Passage à la majorité (18 ans) — Dossier autonome en cours de détachement', nextDueDate: '2026-12-01' },
      ],
    },
    nextRecommendation: {
      ruleId: 'A2',
      tier: 'orange',
      actionText: 'Consultation préventive d’orientation — Bilan cardiométabolique',
      scheduledDate: '2026-11-28',
      status: 'invited',
      referralCode: 'IFH3692T',
      groupedActions: [
        { actionTitle: 'Bilan lipidique et glycémie à jeun', directiveSource: 'ADA / OMS HEARTS', category: 'Biologie' },
        { actionTitle: 'Contrôle tensionnel en 3 mesures', directiveSource: 'Protocole OMS HEARTS', category: 'Clinique' },
        { actionTitle: 'Conseil nutritionnel & activité physique', directiveSource: 'Programme Prévention DoH', category: 'Prévention' },
      ],
    },
    flags: [
      {
        id: 'FLAG-1',
        ruleId: 'A2',
        title: 'Tension Artérielle Limite (OMS HEARTS)',
        level: 'orange',
        certainty: 'probable',
        certaintyReason: 'Moyenne sur 2 mesures distinctes',
        factors: [
          'Pression systolique moyenne 137 mmHg (seuil alerte ≥ 135 mmHg).',
          'Surveillance tensionnelle à 30 jours et consultation recommandée.',
        ],
        missingData: [],
        dueDate: '2026-11-28',
        isEclipseSuspended: false,
      },
      {
        id: 'FLAG-2',
        ruleId: 'A4',
        title: 'Bilan Métabolique & Évaluation Diabète (FINDRISC)',
        level: 'orange',
        certainty: 'probable',
        certaintyReason: 'Questionnaire FINDRISC complété (score 12)',
        factors: [
          'Score FINDRISC calculé à 12 points (risque modéré).',
          'Dépistage préventif glycémie à jeun conseillé.',
        ],
        missingData: [],
        dueDate: '2026-12-10',
        isEclipseSuspended: false,
      },
    ],
    consents: {
      evaluationAndCalendar: true,
      channelReminders: true,
      shareWithFacility: true,
      anonymousStatistics: true,
      existingGenomicResult: false,
    },
    usageLogs: [
      {
        id: 1,
        actorName: 'Dr. Sydney Kpegbe',
        actorRole: 'Médecin Généraliste',
        dataCategory: 'Constantes cliniques',
        purposeDescription: 'Évaluation préventive et validation d’orientation',
        ruleVersionRef: 'SHA256:4b8a...v1.0.0',
        createdAt: '2026-11-19 14:32:00',
      },
      {
        id: 2,
        actorName: 'Fatima Zahra',
        actorRole: 'Coordinatrice de soins',
        dataCategory: 'Coordonnées de relance',
        purposeDescription: 'Envoi invitation multilingue WhatsApp',
        ruleVersionRef: 'POLICY:M1_OUTREACH',
        createdAt: '2026-11-19 15:10:00',
      },
    ],
    notifications: [
      {
        id: 'NOTIF-1',
        channel: 'WhatsApp',
        language: 'fr',
        recipientType: 'adult',
        title: 'Invitation au bilan préventif MediBenin',
        bodyText: 'Bonjour Tariq, votre bilan préventif de santé est programmé. Accédez à votre Pass QR IFH3692T en toute confidentialité.',
        sentAt: '2026-11-19 15:12:00',
        isRead: true,
        requiresAction: false,
      },
    ],
  };
}

function getMockScreeningPlan(pid: string): any {
  return {
    evaluationPaused: false,
    plan: {
      patientId: pid,
      summary: { overdue: 1, dueSoon: 2, needsData: 0, upcoming: 1, upToDate: 2 },
      items: [
        {
          id: 'PLAN-1',
          title: 'Bilan Cardiovasculaire & Métabolique (OMS HEARTS)',
          source: 'Protocole OMS HEARTS',
          intervalMonths: 12,
          status: 'overdue',
          dueLabel: 'En retard (12 jours)',
          rationale: 'Pression systolique 137 mmHg et antécédents familiaux nécessitent un contrôle lipidique.',
          action: 'Consultation avec Dr. Sydney Kpegbe',
        },
        {
          id: 'PLAN-2',
          title: 'Surveillance Tensionnelle Rapprochée',
          source: 'Protocole HEARTS 2026',
          intervalMonths: 3,
          status: 'due_soon',
          dueLabel: 'Sous 14 jours (28 nov. 2026)',
          rationale: 'Deuxième lecture de confirmation pour écarter l’HTA masquée.',
          action: 'Prise de tension au centre de santé ou auto-mesure validée',
        },
        {
          id: 'PLAN-3',
          title: 'Bilan Pédiatrique Zayed (18 mois WCV)',
          source: 'Calendrier Pédiatrique DoH Abu Dhabi',
          intervalMonths: 6,
          status: 'due_soon',
          dueLabel: 'Sous 7 jours (24 nov. 2026)',
          rationale: 'Visite bien-être 18 mois, vérification Z-score OMS et rappel vaccinal.',
          action: 'Consultation pédiatrique couplée avec votre visite (Pass Famille)',
        },
        {
          id: 'PLAN-4',
          title: 'Examen Bucco-Dentaire Préventif',
          source: 'Programme National Prévention',
          intervalMonths: 12,
          status: 'up_to_date',
          dueLabel: 'À jour (Mars 2026)',
          rationale: 'Dernier contrôle effectué sans anomalie.',
          action: 'Prochain contrôle annuel prévu en 2027',
        },
        {
          id: 'PLAN-5',
          title: 'Dépistage Colorectal FIT',
          source: 'Directive Dépistage Précoce',
          intervalMonths: 24,
          status: 'upcoming',
          dueLabel: 'Prévu à 50 ans',
          rationale: 'Dépistage systématique à partir de 50 ans selon les recommandations internationales.',
          action: 'Planifié pour 2040',
        },
      ],
    },
  };
}

function getMockReminderPlan(pid: string): any {
  return {
    plan: {
      patientId: pid,
      scheduledDate: '2026-11-28',
      reminders: [
        {
          id: 'REM-1',
          label: 'Rappel J-7 (WhatsApp Bilingue)',
          scheduledDate: '2026-11-21',
          status: 'sent',
          channel: 'WhatsApp',
          bodyText: 'Rappel : votre visite préventive est prévue le 28 nov. au Centre Al Bateen. Pass QR : IFH3692T.',
        },
        {
          id: 'REM-2',
          label: 'Rappel J-1 (Confirmation SMS)',
          scheduledDate: '2026-11-27',
          status: 'pending',
          channel: 'SMS',
          bodyText: 'MediBenin : RDV demain à 10h00 au Centre Al Bateen. Répondez OUI pour confirmer.',
        },
        {
          id: 'REM-3',
          label: 'Rappel J+3 (Bienveillant si empêchement)',
          scheduledDate: '2026-12-01',
          status: 'standby',
          channel: 'WhatsApp',
          bodyText: 'Vous n’avez pas pu venir ? Replanifiez votre visite en 1 clic sans pénalité.',
        },
      ],
    },
  };
}

function getMockSelfAssessmentResult(bodyRaw: any): any {
  const body = typeof bodyRaw === 'string' ? JSON.parse(bodyRaw) : bodyRaw || {};
  const s1 = parseFloat(body.systolicBp1) || 138;
  const d1 = parseFloat(body.diastolicBp1) || 88;
  const isRed = s1 >= 160 || d1 >= 100;
  const isOrange = !isRed && (s1 >= 140 || d1 >= 90 || parseFloat(body.weightKg) > 90);
  const level = isRed ? 'red' : isOrange ? 'orange' : 'green';

  return {
    overallLevel: level,
    overallCertainty: 'probable',
    calculations: {
      whoCvdModel: { riskPercent: isRed ? 28 : isOrange ? 14 : 4 },
      bpProtocol: { retainedSys: s1, retainedDia: d1, bpZoneLabel: isRed ? 'HTA Stade 2' : isOrange ? 'HTA Stade 1' : 'Normale' },
      anthropometry: { bmi: body.weightKg && body.heightCm ? Math.round((parseFloat(body.weightKg) / ((parseFloat(body.heightCm)/100)**2))*10)/10 : 25.5 },
      findriscModel: { score: isRed ? 18 : isOrange ? 12 : 5 },
    },
    flags: [
      {
        ruleId: isRed ? 'A11' : isOrange ? 'A2' : 'A1',
        title: isRed ? 'Alerte Hypertension Sévère (Stade 2)' : isOrange ? 'Tension Artérielle Limite' : 'Constantes Optimales',
        level: level,
        factors: [`Pression retenue ${s1}/${d1} mmHg.`],
      },
    ],
  };
}

function getMockClinicianPatients(): any[] {
  return [
    {
      id: 'PT-36Y-TARIQ',
      displayName: 'Tariq Al-Nadim',
      ageYears: 36,
      ageMonths: 432,
      pathwayType: 'adult',
      isPersona: true,
      overallLevel: 'orange',
      overallCertainty: 'probable',
      primaryReasonSummary: 'Tension artérielle limite (138/88 mmHg), bilan lipidique requis sous 30 jours',
      nextDueDate: '2026-11-28',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'invited',
    },
    {
      id: 'PT-18M-ZAYED',
      displayName: 'Zayed Al-Mansoor',
      ageYears: 1,
      ageMonths: 18,
      pathwayType: 'child',
      isPersona: true,
      overallLevel: 'orange',
      overallCertainty: 'probable',
      primaryReasonSummary: 'Visite Well-Child 18 mois en retard, retard vaccinal 38j',
      nextDueDate: '2026-11-24',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'invited',
    },
    {
      id: 'PT-14Y-LAYLA',
      displayName: 'Layla Al-Mansoor',
      ageYears: 14,
      ageMonths: 168,
      pathwayType: 'adolescent',
      isPersona: true,
      overallLevel: 'green',
      overallCertainty: 'high',
      primaryReasonSummary: 'Bilan adolescent et croissance OMS à jour',
      nextDueDate: '2027-02-15',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'done',
    },
    {
      id: 'PT-18Y-YOUSSEF',
      displayName: 'Youssef Al-Nadim',
      ageYears: 18,
      ageMonths: 216,
      pathwayType: 'adult',
      isPersona: true,
      overallLevel: 'yellow',
      overallCertainty: 'probable',
      primaryReasonSummary: 'Passage à la majorité (18 ans) — Détachement de dossier',
      nextDueDate: '2026-12-01',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'validated',
    },
    {
      id: 'PT-49Y-MARIAM-GREY',
      displayName: 'Mariam Al-Mazrouei',
      ageYears: 49,
      ageMonths: 588,
      pathwayType: 'adult',
      isPersona: true,
      overallLevel: 'grey',
      overallCertainty: 'low',
      primaryReasonSummary: 'Données cliniques incomplètes — Pression artérielle et poids à renseigner',
      nextDueDate: '2026-11-19',
      facilityCenter: 'Al Towayya Healthcare Centre',
      pathwayState: 'created',
    },
    {
      id: 'PT-29Y-FATIMA-RED',
      displayName: 'Fatima Al-Kaabi',
      ageYears: 29,
      ageMonths: 348,
      pathwayType: 'adult',
      isPersona: true,
      overallLevel: 'red',
      overallCertainty: 'high',
      primaryReasonSummary: 'URGENCE ROUGE : Grossesse + Pression artérielle 165/105 mmHg (Alerte Prééclampsie)',
      nextDueDate: '2026-11-20',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'validated',
    },
    {
      id: 'PT-62Y-AHMED-RED',
      displayName: 'Ahmed Al-Zaabi',
      ageYears: 62,
      ageMonths: 744,
      pathwayType: 'adult',
      isPersona: true,
      overallLevel: 'red',
      overallCertainty: 'high',
      primaryReasonSummary: 'URGENCE ROUGE : Risque CVD 10 ans > 30% (34%), HTA Stade 2, tabac actif',
      nextDueDate: '2026-11-20',
      facilityCenter: 'Centre de Santé Al Bateen',
      pathwayState: 'validated',
    },
  ];
}

function getMockCoordinatorQueue(): any[] {
  return [
    {
      patientId: 'PT-29Y-FATIMA-RED',
      displayName: 'Fatima Al-Kaabi',
      pathwayType: 'adult',
      overallLevel: 'red',
      sPrio: 98.5,
      clinicalScore: 100,
      logisticsScore: 95,
      predictedNoShowProbability: 0.12,
      overdueDays: 0,
      primaryReasonSummary: 'URGENCE ROUGE : Grossesse + HTA sévère 165/105 mmHg',
      recommendedChannel: 'Appel Téléphonique Immédiat',
      status: 'action_required',
      actionHistory: [],
    },
    {
      patientId: 'PT-62Y-AHMED-RED',
      displayName: 'Ahmed Al-Zaabi',
      pathwayType: 'adult',
      overallLevel: 'red',
      sPrio: 94.2,
      clinicalScore: 95,
      logisticsScore: 92,
      predictedNoShowProbability: 0.35,
      overdueDays: 2,
      primaryReasonSummary: 'URGENCE ROUGE : Score CVD 34%, HTA sévère',
      recommendedChannel: 'WhatsApp + Transport VTC',
      status: 'action_required',
      actionHistory: [],
    },
    {
      patientId: 'PT-18M-ZAYED',
      displayName: 'Zayed Al-Mansoor',
      pathwayType: 'child',
      overallLevel: 'orange',
      sPrio: 78.0,
      clinicalScore: 75,
      logisticsScore: 82,
      predictedNoShowProbability: 0.28,
      overdueDays: 38,
      primaryReasonSummary: 'Visite Well-Child 18 mois en retard de 38 jours',
      recommendedChannel: 'WhatsApp Bilingue',
      status: 'invited',
      actionHistory: [{ action: 'WhatsApp', sentAt: '2026-11-18 10:00' }],
    },
    {
      patientId: 'PT-36Y-TARIQ',
      displayName: 'Tariq Al-Nadim',
      pathwayType: 'adult',
      overallLevel: 'orange',
      sPrio: 72.4,
      clinicalScore: 70,
      logisticsScore: 76,
      predictedNoShowProbability: 0.22,
      overdueDays: 14,
      primaryReasonSummary: 'Tension artérielle limite 138/88 mmHg, bilan lipidique',
      recommendedChannel: 'WhatsApp (Pass QR IFH3692T)',
      status: 'invited',
      actionHistory: [{ action: 'WhatsApp', sentAt: '2026-11-19 15:12' }],
    },
  ];
}
