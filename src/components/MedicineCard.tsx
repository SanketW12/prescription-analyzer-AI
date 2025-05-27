import React from "react";
import { Medicine } from "../types";
import { Pill, Clock, AlertTriangle, Shield } from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
  isSelected: boolean;
  onClick: () => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  isSelected,
  onClick,
}) => {
  const { Medicine, Use } = medicine;

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
        isSelected
          ? "border-2 border-blue-500 transform scale-105"
          : "border border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl text-gray-800 mb-1 flex items-center">
            <Pill className="mr-2 text-blue-500" size={20} />
            {Medicine}
          </h3>
        </div>

        <div className="text-sm text-gray-600 mb-2">{Use}</div>

        {/* <div className="flex items-center text-gray-700 mb-3">
          <Clock className="mr-2 text-blue-400" size={18} />
          <p className="text-sm">{dosage}</p>
        </div> */}

        {/* {isSelected && (
          <div className="pt-3 border-t border-gray-100">
            {sideEffects.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center text-amber-600 mb-1">
                  <AlertTriangle size={16} className="mr-1" />
                  <h4 className="font-medium text-sm">Possible Side Effects</h4>
                </div>
                <ul className="text-xs text-gray-600 pl-6 list-disc">
                  {sideEffects.slice(0, 3).map((effect, idx) => (
                    <li key={idx}>{effect}</li>
                  ))}
                  {sideEffects.length > 3 && (
                    <li>And {sideEffects.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}

            {precautions.length > 0 && (
              <div>
                <div className="flex items-center text-blue-600 mb-1">
                  <Shield size={16} className="mr-1" />
                  <h4 className="font-medium text-sm">Precautions</h4>
                </div>
                <ul className="text-xs text-gray-600 pl-6 list-disc">
                  {precautions.slice(0, 3).map((precaution, idx) => (
                    <li key={idx}>{precaution}</li>
                  ))}
                  {precautions.length > 3 && (
                    <li>And {precautions.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default MedicineCard;
