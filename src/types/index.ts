export interface Medicine {
  Medicine: string;
  Use: string;
}

export interface PrescriptionData {
  medicines: Medicine[];
  doctorName?: string;
  patientName?: string;
  date?: string;
  additionalNotes?: string;
}

export interface OpenAIResponse {
  prescription: PrescriptionData;
}
