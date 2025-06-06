export class Maintenance {
    id: string = '';
    device: string = '';        // id do device relacionado
    dataManutencao: Date | null = null;
    descricao: string = '';
    devices: Array<Device> = [];
}

export class Device {
    id: string = '';
    name: string = '';
    icon: string = 'devices';
    state: boolean = false;
    pin: number = 0;
    manutencoes: Maintenance[] = [];
}

export class MaintenanceResponse {
    id: string = '';
    device: string = '';        // id do device relacionado
    dataManutencao: Date | null = null;
    descricao: string = '';
    devices: Array<Omit<ResponseItem<null>,"fields">> = [];
}

export class ResponseSys {
    id: string = '';
    version: number = 1;
}

export class ResponseItem<T> {
    fields: T | null = null;
    sys: ResponseSys = new ResponseSys();

    constructor(initialValue: T | null = null) {
        this.fields = initialValue;
    }
}

export class IncludesResponse<T> {
    Entry: Array<ResponseItem<T>> = [];
}

export class ApiResponse<T, Y> {
    items: Array<ResponseItem<T>> = [];
    sys: ResponseSys = new ResponseSys();
    includes: IncludesResponse<Y> = new IncludesResponse();
}

// Função para mapear resposta da API para Device + Manutenção

export const mapApiResponseToMaintenances = 
    (apiResponse: ApiResponse<MaintenanceResponse,Device>): Array<Maintenance> =>{

    return apiResponse.items.map(item=>{
        if(item.fields){
            const maintenance = new Maintenance();
            maintenance.device = item.fields.device;
            maintenance.id = item.sys.id;
            maintenance.devices = item.fields.devices?.map(sysDevice=>{
                const device = apiResponse.includes.Entry
                    .find(dev=>dev.sys.id === sysDevice.sys.id);
                if(device?.fields){
                    device.fields.id = sysDevice.sys.id;
                    return device.fields;
                }
                return null;
            }).filter(device=>device!==null);
            return maintenance;
        }
        return null;
    }).filter(maintenance=>maintenance!==null);
}

export class ApiAttribute<T>{
    pt: T|null = null;
    constructor(initialValue: T){
        this.pt = initialValue;
    }
}

export class NewMaintenance {
    name: ApiAttribute<string> = new ApiAttribute("");
}

export class NewField<T>{
    fields: T|null = null;    
    constructor(initialValue: T){
        this.fields = initialValue;
    }
}

export class CreatedItem {    
    sys: ResponseSys = new ResponseSys();    
}
