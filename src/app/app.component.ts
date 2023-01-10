import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GridApi, GridOptions } from "ag-grid-community";
import { BtnCellRenderer } from './grid-components';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DashboardApi } from './dashboard.api';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import {
  ColDef,
  ColumnApi,
  GridReadyEvent,
  IServerSideDatasource,
  ColumnResizedEvent,
  ColSpanParams,
  RowHeightParams,
  RowModelType,
} from 'ag-grid-community';
import { PurchaseHistoryService } from './purchase-history.service';

export const DateTimeValidator = (fc: FormControl) => {
  const date = new Date(fc.value);
  const isValid = !isNaN(date.valueOf());
  return isValid ? null : {
    isValid: {
      valid: false
    }
  };
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'angular-rm-e-commerce';

  public rowData: any[] = [];

  //public gridColumnApi: any;

  public columnDefs: ColDef[] = [

    {
      headerName: 'Origin',
      field: 'origin',
      suppressSizeToFit: true,
      width: 80,
    },
    {
      headerName: "Departure Date",
      field: "departureDate",
      suppressSizeToFit: true,
      sortable: true,
      //width: 185
    },
    {
      headerName: "Destination",
      field: "destination",
      sortable: true,
      cellClass: 'rag-amber',
      suppressSizeToFit: true,
      //width: 100
    },
    {
      headerName: "Base Fare",
      field: "baseFare",
      sortable: true,
      cellClass: 'my-class',
      suppressSizeToFit: true,
      //width: 165
    },
    {
      headerName: "Flight Number",
      field: "flightNumber",
      sortable: true,
      cellClass: 'my-class',
      width: 165
    },
    {
      headerName: "Discount Fare",
      field: "discountFare",
      sortable: true,
      cellClass: 'my-class',
      width: 165
    },
    {
      headerName: "Select",
      field: "discountFare",
      cellRenderer: BtnCellRenderer,
      cellRendererParams: {
        clicked: (field: any) => {
          alert(`${field} was clicked`);
        }
      },
      sortable: true,
      cellClass: 'my-class',
      width: 165
    }

  ];

  public gridOptions: GridOptions = {
    animateRows: true,
    enableCellChangeFlash: true,
    paginationPageSize: 19,
    pagination: false,
    domLayout: 'autoHeight',
    columnDefs: this.columnDefs,
  };

  public gridApi: GridApi;
  private gridColumnApi!: ColumnApi;

  public numPassengers: number = 0;

  public isTransactionTimeOpen = false;

  public isDepartureTimeOpen = false;


  public rangeSelector: FormGroup;

  constructor(private dashboardAPI: DashboardApi, public purchaseHistoryService: PurchaseHistoryService, private formBuilder: FormBuilder) {
    this.createForm()
  }



  public ngAfterViewInit(): void {

    this.rangeSelector.valueChanges
      .pipe(
        debounceTime(1220),
        distinctUntilChanged(),
        tap((event) => {

          let metricHolder = [];
          let holderAry = [];

          console.log('XXXXXXXXXXX  event ', event)

          setTimeout(() => {
            Object.entries(event).forEach((d: any, i) => {
              console.log('event ', ' d ', d)

              // if (d[1] !== null &&  d[1] !== '') {
              //     metricHolder.push(d);

              // } else 
              if (Array.isArray(d[1])) {
                console.log('           Is Array ', d)
              } else if (d[1] !== null && d[1] !== '') {
                console.log('           Is string ', d)
                metricHolder.push(d);
              } else if (d[1] && d[1].length > 3) {
                console.log('           YES DATE ', d[1])
              }
            })
            console.log('   metricHolder ', metricHolder)
            holderAry = [];

            this.purchaseHistoryService.transactionData.map((word, j) => {
              // console.log('word ', word)
              let lgth = 0;
              metricHolder.forEach((d: any, i) => {

                if (word[d[0]] === d[1]) {
                  lgth++;


                } else {
                  // console.log('           NOPE  i', i, ' j ', j, ' word[d[0]] ', word[d[0]], ' d ', d[1])
                }
              })
              if (lgth === metricHolder.length) {
                holderAry.push(word)
              }
            })
            console.log(' holderAry ', holderAry)

            this.purchaseHistoryService.transactionData = holderAry;


            this.purchaseHistoryService.transactionDataBehaviorSubject$.next(holderAry)
          })

        })
      )
      .subscribe()
  }

  public ngOnInit(): void {

    this.dashboardAPI.getInventory()
      .subscribe(response => {

        // console.log('constructor constructor constructor ', response)

        response.flights.map((r: any, i: number) => {
          // console.log('r ', r)
          this.rowData.push({
            origin: r.origin, destination: r.destination, departureDate: r.departureDateTime, flightNumber: r.flightNumber, discountFare: r.discountFare, bidPrice: r.availabilityInfo, baseFare: r.flightCharges.baseFare
          })

        })
        // console.log('this.rowData ', this.rowData)

      })

  }


  public createForm() {

    console.log('||||||||||||   createForm  transactionDate ', this.purchaseHistoryService.transactionDate)
    this.rangeSelector = this.formBuilder.group({
      origin: new FormControl('', [Validators.required]),
      destination: new FormControl('', [Validators.required]),
      transactionTimeFrom: new FormControl(this.purchaseHistoryService.transactionDate, { validators: [Validators.required, DateTimeValidator] }),
      transactionTimeTo: new FormControl(this.purchaseHistoryService.transactionDateTo, { validators: [Validators.required, DateTimeValidator] }),
      departureDateFrom: new FormControl(this.purchaseHistoryService.transactionDate, { validators: [Validators.required, DateTimeValidator] }),
      departureDateTo: new FormControl(this.purchaseHistoryService.transactionDateTo, { validators: [Validators.required, DateTimeValidator] })
    });
  }

  public onGridReady(params: any) {
    //console.log('onGridReady ', params)

    var colSpan = function (params: ColSpanParams) {
      return params.data === 2 ? 3 : 1;
    };
    function fillAllCellsWithWidthMeasurement() {
      Array.prototype.slice
        .call(document.querySelectorAll('.ag-cell'))
        .forEach(function (cell) {
          var width = cell.offsetWidth;
          var isFullWidthRow = cell.parentElement.childNodes.length === 1;
          cell.textContent = (isFullWidthRow ? 'Total width: ' : '') + width + 'px';
        });
    }

    this.gridApi = params.api;
    setTimeout(() => {
      this.gridColumnApi = params.columnApi;
      this.gridApi.setColumnDefs(this.columnDefs);
      this.gridApi.setRowData(this.rowData);
      this.gridApi.resetRowHeights();
      this.gridApi.sizeColumnsToFit()
    }, 200);


  }

  public getRowHeight: (
    params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
      return 40;
    };


  public toggleTransactionOpenState() {
    this.isTransactionTimeOpen = !this.isTransactionTimeOpen;
  }

  public toggleDepartureOpenState() {
    this.isDepartureTimeOpen = !this.isDepartureTimeOpen;
  }

  public addNumPassengers(passengers: any) {
    //console.log('numPassengers ', passengers, passengers[passengers])
    this.numPassengers = passengers.numPassengers
  }


  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  autoSizeAll(skipHeader: boolean) {

    const allColumnIds: string[] = [];
    this.gridColumnApi.getColumns()!.forEach((column) => {
      allColumnIds.push(column.getId());
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  onColumnResized(params: ColumnResizedEvent) {
    // this.autoSizeAll(true);
    this.sizeToFit()
    //console.log('onColumnResized ', params);
  }


  // public getRowHeight: (params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
  //   if (params.node && params.node.detail) {
  //     var offset = 60;
  //     var sizes = params.api.getSizesForCurrentTheme() || {};
  //     var allDetailRowHeight = params.data.callRecords.length * sizes.rowHeight;
  //     return allDetailRowHeight + (sizes.headerHeight || 0) + offset;
  //   }
  // };

  // public getRowHeight: (
  //   params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
  //     return 40;
  //   };

}
