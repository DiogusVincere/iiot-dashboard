import { ApiResponse, Device, Maintenance, MaintenanceResponse } from "../models/devices";
import { getCdnAxios } from "./services.config";

export const getDevices = (): Promise<ApiResponse<Device,null>> => {
    return getCdnAxios().get("?content_type=device");   
}

export const getMaintenances = (): Promise<ApiResponse<MaintenanceResponse,Device>> => {
    return getCdnAxios().get("?content_type=maintenance");   
}
