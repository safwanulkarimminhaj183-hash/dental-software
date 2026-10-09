// Mock in-memory storage
let treatmentPlansData = [
  {
    id: 1,
    patient_id: "P001",
    patient_name: "John Doe",
    procedure_name: "Root Canal",
    tooth_number: "14",
    total_cost: 500,
    discount: 50,
    tax: 20,
    insurance_covered: 200,
    status: 'In Progress',
    treatment_steps: [
      { step_no: 1, title: 'Initial Examination', status: 'Completed' },
      { step_no: 2, title: 'Root Canal Procedure', status: 'In Progress' },
      { step_no: 3, title: 'Final Restoration', status: 'Pending' }
    ]
  }
];

const calculateNetPayable = (plan) => {
  return (plan.total_cost + plan.tax) - (plan.discount + plan.insurance_covered);
};

export const getTreatmentPlans = () => {
  return treatmentPlansData.map(plan => ({ ...plan, net_payable: calculateNetPayable(plan) }));
};

export const updateTreatmentPlan = (id, updatedFields) => {
  const index = treatmentPlansData.findIndex(p => p.id === id);
  if (index !== -1) {
    treatmentPlansData[index] = { ...treatmentPlansData[index], ...updatedFields };
    return { ...treatmentPlansData[index], net_payable: calculateNetPayable(treatmentPlansData[index]) };
  }
  return null;
};
