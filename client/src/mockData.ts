// Mock data for testing without database
export const mockUsers = [
  {
    id: '1',
    email: 'admin@chartbreaker.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN',
    isActive: true,
  },
  {
    id: '2',
    email: 'nurse@chartbreaker.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'CLINICIAN',
    isActive: true,
    staffProfile: {
      employeeId: 'EMP001',
      discipline: 'SN',
      licenseNumber: 'RN123456',
    },
  },
];

export const mockPatients = [
  {
    id: '1',
    patientId: 'P001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1950-05-15',
    gender: 'M',
    phone: '303-555-0123',
    email: 'john.doe@email.com',
    episodes: [
      {
        id: '1',
        episodeNumber: 'E001',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: undefined,
        disciplines: ['SN', 'PT'],
      },
    ],
    referrals: [
      {
        id: '1',
        referralSource: 'Dr. Smith',
        referralDate: '2024-01-01',
        physicianName: 'Dr. Smith',
      },
    ],
    _count: {
      episodes: 1,
      visitNotes: 5,
    },
  },
  {
    id: '2',
    patientId: 'P002',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1945-08-22',
    gender: 'F',
    phone: '303-555-0124',
    episodes: [
      {
        id: '2',
        episodeNumber: 'E002',
        status: 'ACTIVE',
        startDate: '2024-01-15',
        endDate: undefined,
        disciplines: ['SN', 'OT'],
      },
    ],
    referrals: [
      {
        id: '2',
        referralSource: 'Dr. Johnson',
        referralDate: '2024-01-15',
        physicianName: 'Dr. Johnson',
      },
    ],
    _count: {
      episodes: 1,
      visitNotes: 3,
    },
  },
];

export const mockEpisodes = [
  {
    id: '1',
    episodeNumber: 'E001',
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: null,
    disciplines: ['SN', 'PT'],
    patient: {
      id: '1',
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
    },
    _count: {
      visitNotes: 5,
      schedules: 8,
    },
  },
  {
    id: '2',
    episodeNumber: 'E002',
    status: 'ACTIVE',
    startDate: '2024-01-15',
    endDate: null,
    disciplines: ['SN', 'OT'],
    patient: {
      id: '2',
      patientId: 'P002',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    _count: {
      visitNotes: 3,
      schedules: 6,
    },
  },
];

export const mockSchedules = [
  {
    id: '1',
    visitDate: '2024-01-20',
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-20T10:00:00Z',
    discipline: 'SN',
    visitType: 'ROUTINE',
    status: 'SCHEDULED',
    notes: 'Regular visit',
    patient: {
      id: '1',
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
    },
    staff: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
  },
  {
    id: '2',
    visitDate: '2024-01-21',
    startTime: '2024-01-21T10:00:00Z',
    endTime: '2024-01-21T11:00:00Z',
    discipline: 'PT',
    visitType: 'EVALUATION',
    status: 'COMPLETED',
    notes: 'Initial evaluation completed',
    patient: {
      id: '1',
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
    },
    staff: {
      id: '3',
      firstName: 'Mike',
      lastName: 'Wilson',
    },
  },
];

export const mockAssessments = [
  {
    id: '1',
    assessmentType: 'SOC',
    assessmentDate: '2024-01-01',
    isSigned: true,
    signedAt: '2024-01-01T14:30:00Z',
    patient: {
      id: '1',
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
    },
    episode: {
      id: '1',
      episodeNumber: 'E001',
    },
    clinician: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
  },
  {
    id: '2',
    assessmentType: 'ROC',
    assessmentDate: '2024-01-15',
    isSigned: false,
    patient: {
      id: '2',
      patientId: 'P002',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    episode: {
      id: '2',
      episodeNumber: 'E002',
    },
    clinician: {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
  },
];

export const mockClaims = [
  {
    id: '1',
    claimNumber: 'CLM001',
    claimType: 'CLAIM_837I',
    submissionDate: '2024-01-10',
    claimAmount: 1500.00,
    status: 'SUBMITTED',
    patient: {
      id: '1',
      patientId: 'P001',
      firstName: 'John',
      lastName: 'Doe',
    },
    payer: {
      id: '1',
      payerName: 'Medicare',
    },
  },
  {
    id: '2',
    claimNumber: 'CLM002',
    claimType: 'CLAIM_837I',
    submissionDate: '2024-01-15',
    claimAmount: 1200.00,
    status: 'PAID',
    patient: {
      id: '2',
      patientId: 'P002',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    payer: {
      id: '1',
      payerName: 'Medicare',
    },
  },
];

export const mockQAReviews = [
  {
    id: '1',
    documentType: 'OASIS',
    reviewDate: '2024-01-02',
    status: 'APPROVED',
    deficiencies: null,
    comments: 'Assessment completed correctly',
    reviewer: {
      id: '4',
      firstName: 'Michael',
      lastName: 'Brown',
    },
  },
  {
    id: '2',
    documentType: 'VISIT_NOTE',
    reviewDate: '2024-01-16',
    status: 'DEFICIENT',
    deficiencies: ['Missing vital signs', 'Incomplete assessment'],
    comments: 'Please complete missing sections',
    reviewer: {
      id: '4',
      firstName: 'Michael',
      lastName: 'Brown',
    },
  },
];

export const mockDashboardStats = {
  totalPatients: 25,
  activeEpisodes: 18,
  pendingVisits: 12,
  pendingClaims: 8,
  pendingQaReviews: 5,
};
