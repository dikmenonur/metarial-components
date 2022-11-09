import { Component, OnInit } from '@angular/core';
import { AutoCompleteEntity } from './models/auto-complete-entity';

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
    let entity=new AutoCompleteEntity(1,'Onur','Dikmen',false);
    let entity2=new AutoCompleteEntity(2,'Veli','Raman',false);
    let entity3=new AutoCompleteEntity(3,'Deli','Sagman',false);
    let entity4=new AutoCompleteEntity(4,'Keli','Tekilmen',false);

    this.dataOptionsData.push(entity);
    this.dataOptionsData.push(entity2);
    this.dataOptionsData.push(entity3);
    this.dataOptionsData.push(entity4);

  }

 
  selectChange = (event: any) => {
		const key: string = event.key;
		this.cardValue[key] = [...event.data];
	};
}
