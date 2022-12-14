import { Component, OnInit } from '@angular/core';
import { AutoCompleteEntity } from './models/auto-complete-entity';
import * as Data from '../app/dummy/user_generated.json'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-metarial';
  cardValue: any = {
		options: []
	};
  reloadData: boolean=false;
  dataOptionsData: Array<AutoCompleteEntity> =new Array<AutoCompleteEntity>();

constructor(){
  
}
  ngOnInit(): void {
    let jsonData= JSON.parse(JSON.stringify(Data));
    for (let index = 0; index < jsonData.length; index++) {
      const element = jsonData[index];
      this.dataOptionsData.push(element);
    }  
  }

 
  selectChange = (event: any) => {
		const key: string = event.key;
		this.cardValue[key] = [...event.data];
	};
}
