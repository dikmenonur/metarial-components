import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { debounceTime, exhaustMap, scan, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { AutoCompleteEntity } from '../models/auto-complete-entity';
import { forIn, orderBy } from 'lodash';
@Component({
  selector: 'app-multi-select-autocomplete',
  templateUrl: './multi-select-autocomplete.component.html',
  styleUrls: ['./multi-select-autocomplete.component.scss']
})
export class MultiSelectAutocompleteComponent implements OnInit {

  	private nextPage$ = new Subject();
	@Input() currentFromGroup: FormGroup;
	dataSourceData: Observable<Array<AutoCompleteEntity>> = new Observable<Array<AutoCompleteEntity>>();
	@Input() optionsData: Array<AutoCompleteEntity> = new Array<AutoCompleteEntity>();
	@Output() selectedDealer: AutoCompleteEntity[] = new Array<AutoCompleteEntity>();
	@Output() unSelectedDealer: AutoCompleteEntity[] = new Array<AutoCompleteEntity>();
	@Output() result = new EventEmitter<{ key: string, data: Array<AutoCompleteEntity> }>();
	@Input() reloadData= false;
	isLoading = false;
	key: string = "";
	constructor(private change: ChangeDetectorRef) {
    this.currentFromGroup= new FormGroup({
      autoComplete:new FormControl()
    });
	}

	displayFnArray(autoEntity: AutoCompleteEntity[] | string): string  {
		let displayValue='';
    if (Array.isArray(autoEntity)) {
			autoEntity.forEach((auto, index) => {
				if (index === 0) {
					displayValue = auto.name + ' ' + auto.title;
				} else {
					displayValue += ', ' + auto.name + ' ' + auto.title;
				}
			});
		} else {
			displayValue = autoEntity;
		}
		return displayValue;
	}


	get formControl(): AbstractControl {
		return this.currentFromGroup.get('autoComplete') as AbstractControl;
	}

	optionClicked = (event: Event, dealer: AutoCompleteEntity): void => {
		event.stopPropagation();
		this.toggleSelection(dealer);
	};

	toggleSelection(entitiy: AutoCompleteEntity) {
		entitiy.selected = !entitiy.selected;

		if (entitiy.selected) {
			this.selectedDealer.push(entitiy);
			this.unSelectedDealer.push(entitiy);
		} else {
			const i = this.selectedDealer.findIndex(value => value.name === entitiy.name
				&& value.title === entitiy.title);
			this.selectedDealer.splice(i, 1);
		}

		this.formControl.setValue(this.selectedDealer);


		this.dataInitPage(100);
		this.emitAdjustedData();
	}

	emitAdjustedData = (): void => {
		const results: Array<AutoCompleteEntity> = []
		this.selectedDealer.forEach((data: AutoCompleteEntity) => {
			results.push(data);
		});
		this.result.emit({ key: this.key, data: results });
	};

	getChangedValOfInput(_debounceTime:number) {
debugger

		const filter$ = this.formControl.valueChanges.pipe(
			startWith(""),
			debounceTime(_debounceTime)
			// Note: If the option valye is bound to object, after selecting the option
			// Note: the value will change from string to {}. We want to perform search
			// Note: only when the type is string (no match)
			// filter(q => typeof q === 'string')
		);
		return filter$;
	}
	ngOnInit() {

		this.dataInitPage(300);
	}

	matAutoCompleteClear() {
		this.formControl.setValue('');
		for (var i = 0; i < this.unSelectedDealer.length; i++) {
			let dealer = this.unSelectedDealer[i]
			dealer.selected = true;
			this.toggleSelection(dealer);
		}
		this.dataInitPage(50);
	}

	dataInitPage(_debounceTime:number) {
		const filter$ = this.getChangedValOfInput(_debounceTime);
		this.dataSourceData = filter$.pipe(
			switchMap(currInputVal => {
				// Note: Reset the page with every new seach text
				let currentPage = 1;
				return this.nextPage$.pipe(
					startWith(currentPage),
					// Note: Until the backend responds, ignore NextPage requests.
					exhaustMap(_ => this._filter(currInputVal, currentPage)),
					tap(() => currentPage++),
					// Note: This is a custom operator because we also need the last emitted value.
					// Note: Stop if there are no more pages, or no results at all for the current search text.
					takeWhile(p => p.length > 0, true),
					scan((allAutoData, newData) => {

						for (var i = 0; i < newData.length; i++) {
							let currentData = newData[i];
							let indexC = allAutoData.findIndex(t => t.name == currentData.name);

							if (indexC > -1) {
								allAutoData[indexC] = currentData;
							} else {
								allAutoData.push(currentData);
							}

							if (allAutoData.filter(t => t.selected).length > 0) {
								allAutoData = orderBy(allAutoData, ["selected"], ['asc']);
							}
							else {
								allAutoData = orderBy(allAutoData, ["name"], ['desc']);
							}
						}

						return allAutoData;
					})
				);
			})
		);
	}

	private _filter(entityValue: string, page: number): Observable<AutoCompleteEntity[]> {

		const take = 10;
		const skip = page > 0 ? (page - 1) * take : 0;
		let filterData = this.optionsData;
		if (typeof entityValue == 'string') {
			filterData = this.optionsData.filter(option => option.name.toLowerCase().includes(entityValue.toLowerCase()));
			filterData = filterData.length !== 0 ? filterData : this.optionsData.filter(option => option.title.toLowerCase().includes(entityValue.toLowerCase()));
		} else if (typeof entityValue == 'object') {
			filterData = this.optionsData.filter(option => option == entityValue);
		}

		return of(filterData.slice(skip, skip + take));
	}

	onScroll() {
		this.nextPage$.next;
	}

	ngOnChanges() {
		if (this.reloadData) {
			this.formControl.setValue('');
			for (var i = 0; i < this.unSelectedDealer.length; i++) {
				let dealer = this.unSelectedDealer[i]
				dealer.selected = true;
				this.toggleSelection(dealer);
			}
			this.unSelectedDealer = [];
			this.dataInitPage(50);
			this.change.detectChanges();
		}
	}

}
