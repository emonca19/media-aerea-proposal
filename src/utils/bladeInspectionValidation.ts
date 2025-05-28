import AsyncStorage from '@react-native-async-storage/async-storage';
import { BladeInspectionData } from '../hooks/useBladeInspectionStorage';

export interface BladeInspectionValidationResult {
  isComplete: boolean;
  completedBlades: number;
  totalBlades: number;
  missingBlades: number[];
  validationMessage: string;
}

/**
 * Validates if all blades have been inspected for a given turbine
 * @param turbineId - The ID of the turbine to check
 * @returns Promise<BladeInspectionValidationResult>
 */
export const validateTurbineBladeInspection = async (
  turbineId: string
): Promise<BladeInspectionValidationResult> => {
  try {
    const storageKey = `blade_inspection_${turbineId}`;
    const storedData = await AsyncStorage.getItem(storageKey);
    
    if (!storedData) {
      return {
        isComplete: false,
        completedBlades: 0,
        totalBlades: 3,
        missingBlades: [1, 2, 3],
        validationMessage: 'No se ha iniciado la inspección de aspas para esta turbina.'
      };
    }

    const bladesData: BladeInspectionData[] = JSON.parse(storedData);
    const totalBlades = 3;
    const completedBlades = bladesData.filter(blade => blade.completed).length;
    const missingBlades = [];

    // Check which blades are missing or incomplete
    for (let i = 1; i <= totalBlades; i++) {
      const blade = bladesData.find(b => b.bladeNumber === i);
      if (!blade || !blade.completed) {
        missingBlades.push(i);
      }
    }

    const isComplete = missingBlades.length === 0;
    
    let validationMessage = '';
    if (isComplete) {
      validationMessage = 'Todas las aspas han sido inspeccionadas correctamente.';
    } else if (completedBlades === 0) {
      validationMessage = 'Ninguna aspa ha sido inspeccionada. Se requiere inspección completa de las 3 aspas.';
    } else {
      const missingBladeNames = missingBlades.map(num => `Aspa ${num}`).join(', ');
      validationMessage = `Inspección incompleta. Faltan: ${missingBladeNames}. Se requiere inspección completa de las 3 aspas.`;
    }

    return {
      isComplete,
      completedBlades,
      totalBlades,
      missingBlades,
      validationMessage
    };
  } catch (error) {
    console.error('Error validating blade inspection:', error);
    return {
      isComplete: false,
      completedBlades: 0,
      totalBlades: 3,
      missingBlades: [1, 2, 3],
      validationMessage: 'Error al verificar el estado de inspección de aspas.'
    };
  }
};

/**
 * Checks if a turbine activity requires blade inspection validation
 * @param activity - The activity object to check
 * @returns boolean
 */
export const requiresBladeInspection = (activity: any): boolean => {
  if (!activity) return false;
  
  // Exclude transfer, travel, and mobilization activities
  const activityNameLower = activity.name?.toLowerCase() || '';
  const activityTypeLower = activity.type?.toLowerCase() || '';
  const activityDescLower = activity.description?.toLowerCase() || '';
  
  const transferKeywords = [
    'traslado',
    'transfer',
    'movilizacion', 
    'movilización',
    'mobilization',
    'travel',
    'transporte',
    'transport',
    'movimiento'
  ];
  
  const turbineTransferKeywords = [
    'traslado entre turbinas',
    'traslado de turbina',
    'transfer between turbines',
    'turbine transfer',
    'movilización de turbina',
    'movilizacion entre turbinas'
  ];
  
  // Check if it's explicitly a transfer/mobilization activity
  const isTransferActivity = 
    activityTypeLower === 'travel' ||
    activityTypeLower === 'transfer' ||
    activityTypeLower === 'mobilization' ||
    activityTypeLower === 'movilizacion' ||
    transferKeywords.some(keyword => 
      activityNameLower.includes(keyword) || 
      activityDescLower.includes(keyword)
    ) ||
    turbineTransferKeywords.some(keyword => 
      activityNameLower.includes(keyword) || 
      activityDescLower.includes(keyword)
    );
  
  if (isTransferActivity) {
    return false;
  }
  
  // Check if activity is turbine-related work
  const isTurbineActivity = 
    activity.type === 'TURBINE_WORK' ||
    activity.type === 'TURBINE_INSPECTION' ||
    activityNameLower.includes('turbina') ||
    activityTypeLower.includes('turbine') ||
    activityDescLower.includes('turbina');

  // Check if activity has a turbine ID assigned
  const hasTurbineId = !!activity.turbineId;

  return isTurbineActivity && hasTurbineId;
};

/**
 * Gets a user-friendly message for blade inspection requirements
 * @param activity - The activity object
 * @param turbineId - The turbine ID
 * @returns string
 */
export const getBladeInspectionRequirementMessage = (
  activity: any, 
  turbineId?: string
): string => {
  const turbineRef = turbineId || activity?.turbineId || 'la turbina';
  return `Para completar actividades de trabajo en turbina (${turbineRef}), es necesario haber inspeccionado todas las aspas. Dirígete a la sección de inspección de aspas para completar esta verificación.`;
};
