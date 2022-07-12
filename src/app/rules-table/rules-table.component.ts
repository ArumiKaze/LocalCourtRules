import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, FirstDataRenderedEvent } from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CourtRule, FireStoreService } from '../fire-store.service';

@Component({
  selector: 'app-rules-table',
  templateUrl: './rules-table.component.html',
  styleUrls: ['./rules-table.component.css']
})
export class RulesTableComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  queryRules$!: Observable<CourtRule[]>;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Local Rules',
      field: 'pdfName',
      cellRenderer: function (params: any) {
        return `<a href="${params.data.pdfLink}" target="_blank">${params.data.pdfName}</a>`;
      }, 
      flex: 1
    },
    { field: 'websiteName', flex: 1 },
    { field: 'state', flex: 1, maxWidth: 100, resizable: false }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    suppressMenu: true
  };

  constructor(private fireStore: FireStoreService) { }

  ngOnInit(): void {
    this.fireStore.subjectStateFilter$.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (rules: any) => {
        this.queryRules$ = rules;
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ApplyStateFilter(state: string) {
    this.fireStore.QueryState(state);
  }

  OnFirstDataRendered(params: FirstDataRenderedEvent) {
    //params.api.sizeColumnsToFit();
  }
}
