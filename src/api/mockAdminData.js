export const mockAnalytics = {
  totalRevenue: 24500,
  totalAppointments: 142,
  totalPatientsCount: 89,
  newPatientsThisMonth: 12,
  totalBilled: 26000,
  totalOutstanding: 1500,
  prescriptionsThisMonth: 45,
  totalTreatmentsCount: 8,
  monthlyRevenueTrend: [
    { label: "Jan", value: 4000 },
    { label: "Feb", value: 3000 },
    { label: "Mar", value: 5000 },
    { label: "Apr", value: 4500 },
    { label: "May", value: 6000 },
    { label: "Jun", value: 2000 }
  ],
  monthlyAppointmentTrend: [
    { label: "Jan", value: 40 },
    { label: "Feb", value: 30 },
    { label: "Mar", value: 50 },
    { label: "Apr", value: 45 },
    { label: "May", value: 60 },
    { label: "Jun", value: 20 }
  ],
  popularTreatments: [
    { _id: "Teeth Whitening", count: 45 },
    { _id: "Root Canal", count: 32 },
    { _id: "Dental Implants", count: 18 }
  ],
  paymentStatuses: [
    { _id: "Paid", count: 120 },
    { _id: "Pending", count: 22 }
  ],
  appointmentStatusStats: [
    { _id: "Completed", count: 98 },
    { _id: "Scheduled", count: 30 },
    { _id: "Cancelled", count: 14 }
  ],
  staffStats: [
    { _id: "Dr. Sarah Johnson", count: 85 },
    { _id: "Dr. Michael Chen", count: 57 }
  ]
};

export const mockFinancials = {
  billingOverview: {
    totalBilled: 26000,
    totalPaid: 24500,
    totalDue: 1500
  },
  paymentMethodBreakdown: [
    { _id: "Credit Card", count: 85 },
    { _id: "Cash", count: 20 },
    { _id: "Insurance", count: 37 }
  ],
  recentBookingInvoices: [
    { invoiceId: "INV-1001", patientName: "John Doe", serviceName: "Teeth Whitening", amount: 150, paymentStatus: "Paid", date: "2026-10-01T10:00:00Z" },
    { invoiceId: "INV-1002", patientName: "Jane Smith", serviceName: "Root Canal", amount: 850, paymentStatus: "Pending", date: "2026-10-02T14:30:00Z" },
    { invoiceId: "INV-1003", patientName: "Robert Johnson", serviceName: "Dental Checkup", amount: 95, paymentStatus: "Paid", date: "2026-10-03T09:15:00Z" }
  ]
};

export const mockAppointments = [
  { _id: "A1", patientName: "Alice Walker", serviceName: "Teeth Whitening", doctorName: "Dr. Sarah Johnson", date: "2026-10-04", timeSlot: "10:00 AM", status: "Scheduled", phone: "555-0101" },
  { _id: "A2", patientName: "Bob Martin", serviceName: "Root Canal", doctorName: "Dr. Michael Chen", date: "2026-10-04", timeSlot: "11:30 AM", status: "Completed", phone: "555-0102" },
  { _id: "A3", patientName: "Charlie Davis", serviceName: "Dental Implant", doctorName: "Dr. Sarah Johnson", date: "2026-10-05", timeSlot: "02:00 PM", status: "Cancelled", phone: "555-0103" }
];

export const mockPrescriptions = [
  { _id: "P1", prescriptionNumber: "RX-2026-001", patientName: "Alice Walker", doctorName: "Dr. Sarah Johnson", date: "2026-10-03T10:00:00Z", diagnosis: "Gingivitis" },
  { _id: "P2", prescriptionNumber: "RX-2026-002", patientName: "Bob Martin", doctorName: "Dr. Michael Chen", date: "2026-10-02T11:30:00Z", diagnosis: "Post Root Canal" }
];

export const mockSchedule = {
  schedule: [
    { slot: "09:00 AM", isAvailable: true },
    { slot: "10:00 AM", isAvailable: false },
    { slot: "11:00 AM", isAvailable: true }
  ],
  availableSlots: [
    { slot: "09:00 AM" },
    { slot: "11:00 AM" }
  ]
};
