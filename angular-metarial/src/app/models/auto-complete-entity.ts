import { IAutoCompleteEntity } from './auto-complete-interface';

export class AutoCompleteEntity implements IAutoCompleteEntity {
	constructor(_id:number,_name:string,_title:string,_selected:boolean){
        this.id = _id;
        this.name = _name;
        this.title = _title;
        this.selected = _selected;
    }
    
    id: number;
	name: string;
	title: string;
	selected : boolean;
};
