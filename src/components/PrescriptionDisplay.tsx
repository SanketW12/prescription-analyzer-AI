/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { PrescriptionData, Medicine } from "../types";
import MedicineCard from "./MedicineCard";
import QuestionBox from "./QuestionBox";
import { Calendar, User, UserCheck } from "lucide-react";

interface PrescriptionDisplayProps {
  imageUrl: string;
  prescriptionData: Medicine[];
  onAskQuestion: (question: string) => Promise<string>;
  onReset: () => void;
}

const PrescriptionDisplay: React.FC<PrescriptionDisplayProps> = ({
  imageUrl,
  prescriptionData,
  onAskQuestion,
  onReset,
}) => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(true);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMedicineClick = (medicine: Medicine) => {
    setSelectedMedicine(
      selectedMedicine?.name === medicine.name ? null : medicine
    );
  };

  const handleAskQuestion = async (question: string) => {
    setIsLoading(true);
    setAnswer(null);
    try {
      const response = await onAskQuestion(question);
      setAnswer(response);
    } catch (error) {
      setAnswer(
        "Sorry, there was an error processing your question. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Prescription Analysis
        </h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition"
        >
          New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800">
                Medications
              </h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {prescriptionData?.length > 0 ? (
              <div className="space-y-4">
                {prescriptionData?.map((medicine, index) => (
                  <MedicineCard
                    key={index}
                    medicine={medicine}
                    isSelected={selectedMedicine?.name === medicine.name}
                    onClick={() => handleMedicineClick(medicine)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No medications found in the prescription
              </p>
            )}
          </div>

          <QuestionBox
            onSubmit={handleAskQuestion as any}
            isLoading={isLoading}
            answer={answer}
          />
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* {prescriptionData.doctorName ||
            prescriptionData.patientName ||
            prescriptionData.date ? (
              <div className="bg-gray-50 p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {prescriptionData.doctorName && (
                    <div className="flex items-center">
                      <UserCheck size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Dr. {prescriptionData.doctorName}
                      </span>
                    </div>
                  )}
                  {prescriptionData.patientName && (
                    <div className="flex items-center">
                      <User size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {prescriptionData.patientName}
                      </span>
                    </div>
                  )}
                  {prescriptionData.date && (
                    <div className="flex items-center">
                      <Calendar size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {prescriptionData.date}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null} */}

            <div className="relative">
              <img
                src={imageUrl}
                alt="Prescription"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* {prescriptionData.additionalNotes && (
              <div className="p-4 border-t border-gray-100">
                <h4 className="font-medium text-sm mb-1">Additional Notes</h4>
                <p className="text-sm text-gray-700">
                  {prescriptionData.additionalNotes}
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDisplay;
