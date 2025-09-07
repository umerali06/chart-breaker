import { mockUsers, mockPatients, mockEpisodes, mockSchedules, mockAssessments, mockClaims, mockQAReviews, mockDashboardStats } from '../mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'admin123') {
      throw new Error('Invalid credentials');
    }
    return {
      token: 'mock-jwt-token',
      user
    };
  },

  async getProfile() {
    await delay(500);
    return { user: mockUsers[0] };
  },

  // Dashboard
  async getDashboardStats() {
    await delay(800);
    return { stats: mockDashboardStats };
  },

  // Patients
  async getPatients(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '' } = params;
    let filteredPatients = mockPatients;
    
    if (search) {
      filteredPatients = mockPatients.filter(p => 
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.patientId.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      patients: filteredPatients,
      pagination: {
        page,
        limit,
        total: filteredPatients.length,
        pages: Math.ceil(filteredPatients.length / limit)
      }
    };
  },

  async getPatient(id: string) {
    await delay(500);
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return { patient };
  },

  // Episodes
  async getEpisodes(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '' } = params;
    let filteredEpisodes = mockEpisodes;
    
    if (search) {
      filteredEpisodes = mockEpisodes.filter(e => 
        e.episodeNumber.toLowerCase().includes(search.toLowerCase()) ||
        e.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        e.patient.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      episodes: filteredEpisodes,
      pagination: {
        page,
        limit,
        total: filteredEpisodes.length,
        pages: Math.ceil(filteredEpisodes.length / limit)
      }
    };
  },

  // Schedules
  async getSchedules(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '' } = params;
    let filteredSchedules = mockSchedules;
    
    if (search) {
      filteredSchedules = mockSchedules.filter(s => 
        s.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.patient.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return {
      schedules: filteredSchedules,
      pagination: {
        page,
        limit,
        total: filteredSchedules.length,
        pages: Math.ceil(filteredSchedules.length / limit)
      }
    };
  },

  // Assessments
  async getAssessments(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '', assessmentType = '' } = params;
    let filteredAssessments = mockAssessments;
    
    if (search) {
      filteredAssessments = mockAssessments.filter(a => 
        a.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        a.patient.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (assessmentType) {
      filteredAssessments = filteredAssessments.filter(a => a.assessmentType === assessmentType);
    }

    return {
      assessments: filteredAssessments,
      pagination: {
        page,
        limit,
        total: filteredAssessments.length,
        pages: Math.ceil(filteredAssessments.length / limit)
      }
    };
  },

  // Billing
  async getClaims(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '', status = '' } = params;
    let filteredClaims = mockClaims;
    
    if (search) {
      filteredClaims = mockClaims.filter(c => 
        c.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        (c.claimNumber && c.claimNumber.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (status) {
      filteredClaims = filteredClaims.filter(c => c.status === status);
    }

    return {
      claims: filteredClaims,
      pagination: {
        page,
        limit,
        total: filteredClaims.length,
        pages: Math.ceil(filteredClaims.length / limit)
      }
    };
  },

  async getPayers() {
    await delay(300);
    return {
      payers: [
        { id: '1', payerName: 'Medicare', payerType: 'MEDICARE' },
        { id: '2', payerName: 'Colorado Medicaid', payerType: 'MEDICAID' },
      ]
    };
  },

  // QA
  async getQAReviews(params: any = {}) {
    await delay(600);
    const { page = 1, limit = 10, search = '', status = '' } = params;
    let filteredReviews = mockQAReviews;
    
    if (search) {
      filteredReviews = mockQAReviews.filter(r => 
        r.documentType.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReviews = filteredReviews.filter(r => r.status === status);
    }

    return {
      reviews: filteredReviews,
      pagination: {
        page,
        limit,
        total: filteredReviews.length,
        pages: Math.ceil(filteredReviews.length / limit)
      }
    };
  },

  // Reports
  async getProductivityReport() {
    await delay(800);
    return {
      productivity: [
        { clinicianId: '2', _count: { id: 15 }, _avg: { visitDate: new Date() } },
        { clinicianId: '3', _count: { id: 12 }, _avg: { visitDate: new Date() } },
      ]
    };
  }
};
