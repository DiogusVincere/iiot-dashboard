import { CreatedItem, NewMaintenance, NewField } from "../models/devices";
import { getApiAxios } from "./services.config";

export const saveMaintenance = (name:string): Promise<CreatedItem> => {

    const env = new NewMaintenance();
    env.name.pt = name;
    const field = new NewField<NewMaintenance>(env);

    return getApiAxios().post("/",field,{
        headers: {
            "X-Contentful-Content-Type": "maintenance"
        }
    });   
}

export const publish = (id:string, version:number = 1): Promise<void> => {

        return getApiAxios().put(`/${id}/published`,undefined,{
            headers: {
                "X-Contentful-Version": version
            }
        });   
}
