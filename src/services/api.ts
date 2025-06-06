import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.qubitro.com/v2',
  headers: {
    'Authorization': 'Bearer ***REMOVIDO***',
    'Accept': 'application/json'
  }
});
 
export interface PlantData {
  plant_1_HUM: number;
  plant_1_TEMP: number;
  plant_2_HUM: number;
  plant_2_TEMP: number;
  plant_3_HUM: number;
  plant_3_TEMP: number;
  plant_4_HUM: number;
  plant_4_TEMP: number;
  tanque_PH: number;
  tanque_TEMP: number;
  time: string;
}
 
// Nova interface para representar os dados brutos recebidos da API
export interface RawApiData {
  [key: string]: any;
  time: string;
}
 
export interface ApiResponse {
  success: boolean;
  action: string;
  status: number;
  message: string;
  data: RawApiData[];  // Agora usando RawApiData para maior flexibilidade
}
 
// Função para normalizar os dados recebidos da API para o formato esperado pelo app
const normalizePlantData = (rawData: RawApiData): PlantData => {
  // Dados padrão (zeros) para o caso de valores ausentes
  const defaultData: PlantData = {
    plant_1_HUM: 0,
    plant_1_TEMP: 0,
    plant_2_HUM: 0,
    plant_2_TEMP: 0,
    plant_3_HUM: 0,
    plant_3_TEMP: 0,
    plant_4_HUM: 0,
    plant_4_TEMP: 0,
    tanque_PH: 0,
    tanque_TEMP: 0,
    time: rawData.time
  };
 
  // Se os dados usam o formato antigo (plant_X_XXX), usamos diretamente
  if ('plant_1_HUM' in rawData) {
    return {
      ...defaultData,
      plant_1_HUM: rawData.plant_1_HUM || 0,
      plant_1_TEMP: rawData.plant_1_TEMP || 0,
      plant_2_HUM: rawData.plant_2_HUM || 0,
      plant_2_TEMP: rawData.plant_2_TEMP || 0,
      plant_3_HUM: rawData.plant_3_HUM || 0,
      plant_3_TEMP: rawData.plant_3_TEMP || 0,
      plant_4_HUM: rawData.plant_4_HUM || 0,
      plant_4_TEMP: rawData.plant_4_TEMP || 0,
      tanque_PH: rawData.tanque_PH || 0,
      tanque_TEMP: rawData.tanque_TEMP || 0,
    };
  }
  // Se os dados usam o novo formato (sensor_plantacao_X_XXX), mapeamos para o formato antigo
  else if ('sensor_plantacao_1_HUM' in rawData) {
    return {
      ...defaultData,
      plant_1_HUM: rawData.sensor_plantacao_1_HUM || 0,
      plant_1_TEMP: rawData.sensor_plantacao_1_PH || 0,  // Ajustando PH como TEMP
      plant_2_HUM: rawData.sensor_plantacao_2_HUM || 0,
      plant_2_TEMP: rawData.sensor_plantacao_2_PH || 0,  // Ajustando PH como TEMP
      // Mantendo os valores default para os outros campos
    };
  }
 
  // Se não reconhecemos o formato, retorna os valores default
  return defaultData;
};
 
export const fetchPlantData = async (): Promise<PlantData[]> => {
  const projectId = '61423240-e511-4e83-a8b5-70fd8458503a';
  const deviceId = '92a9c650-9b11-49b5-9fdc-4c3a540bc0c9';
 
  try {
    // Adicionando os parâmetros de consulta necessários
    const params = {
      page: 1,
      limit: 75,
      range: 'all'
    };
   
    const response = await api.get<ApiResponse>(
      `/projects/${projectId}/devices/${deviceId}/data`,
      { params }
    );
   
    // Transformando os dados brutos no formato esperado pelo app
    const normalizedData = response.data.data.map(normalizePlantData);
   
    return normalizedData;
  } catch (error) {
    console.error('Error fetching plant data:', error);
    return [];
  }
};