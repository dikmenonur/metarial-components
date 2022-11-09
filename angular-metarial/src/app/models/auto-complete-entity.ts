import { IAutoCompleteEntity } from './auto-complete-interface';

export class AutoCompleteEntity implements IAutoCompleteEntity {
    constructor(){

    }
    
    id: string;
	name: string;
	title: string;
	selected : boolean;
    apiKey:string;
    createdAt:Date
};
