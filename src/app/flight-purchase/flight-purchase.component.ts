import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashboardApi } from '../dashboard.api';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs'
import { GridApi, GridOptions } from "ag-grid-community";
//import * as moment from 'moment-timezone';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'
import { formatDate } from '@angular/common';
import { DateTimePickerComponent } from "../date-time-picker/date-time-picker.component";
import { DatePipe } from '@angular/common';
import { ContinousColors } from '../constants';

import * as moment from 'moment';
import 'moment-timezone';

import {
  ColDef,
  GridReadyEvent,
  CellClassParams,
  CellClassRules,
  RowHeightParams,
  ICellRendererParams,
  ValueParserParams,
  RowModelType,
} from 'ag-grid-community';


export const DateTimeValidator = (fc: FormControl) => {
  const date = new Date(fc.value);
  const isValid = !isNaN(date.valueOf());
  return isValid ? null : {
    isValid: {
      valid: false
    }
  };
};


// Latest test
// [
//     '{{repeat(1125, 7)}}',
//     {
//         index: '{{index()}}',
//         loadFactor: '{{integer(4,100)}}',
//         hasAncillary: '{{bool()}}',
//         ancillary: '{{integer(4,100)}}',
//         transactionTime: '{{date(new Date(2014, 0, 1), new Date(), "M/D/YYYY hh:mm")}}',
//         flightNumber: '{{integer(100, 399)}}',
//         quantitySeats: '{{integer(1, 5)}}',
//         fare: '{{integer(180,400)}}',
//         averageSeatFare: '{{integer(100, 399)}}',
//         averageSeatDiscount: '{{integer(10, 169)}}',
//         averageSeatUpgrade: '{{floating(0.000001, 90)}}',
//         averageOtherUpgrade: '{{floating(0.000001, 90)}}',
//         totalOffer: '0.00',
//         totalPurchase: '0.0',
//         origin: function (tags) {
//             var origin = ['JFK', 'MAD', 'ORD', 'DFW', 'DAN', 'DAS'];
//             return origin[tags.integer(0, origin.length - 1)];
//         },
//         destination: function (tags) {
//             var origin = ['LAX', 'CLT', 'CAN', 'PHX', 'SEA', 'PEK'];
//             return origin[tags.integer(0, origin.length - 1)];
//         }
//     }
// ]

@Component({
  selector: 'app-flight-purchase',
  templateUrl: './flight-purchase.component.html',
  styleUrls: ['./flight-purchase.component.scss'],
  providers: [DatePipe, DateTimePickerComponent]
})

export class FlightPurchaseComponent implements OnInit, AfterViewInit {


  public columnDefs: ColDef[] = [
    {
      headerName: 'Idx',
      field: 'index',
      width: 70,
      floatingFilter: false,
      sortable: true,
    },
    {
      headerName: 'LF',
      field: 'loadFactor',
      floatingFilter: false,
      sortable: true,
      width: 60,
      cellStyle: function (params) {
        const test = Math.round(Math.floor(params.value * 10 / 100))
        return { color: 'white', backgroundColor: ContinousColors[0].value[test] };
      }
    },
    {
      headerName: 'Anc',
      field: 'ancillary',
      width: 90,
      floatingFilter: false,
      // filter: 'agNumberColumnFilter',
      sortable: true
    },
    {
      headerName: 'Transaction Time',
      field: 'transactionTime',
      floatingFilter: false,
      sortable: true,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: "Flight #",
      field: "flightNumber",
      // filter: 'agNumberColumnFilter',
      floatingFilter: false,
      //suppressSizeToFit: true,
      sortable: true,
      width: 105
    },
    {
      headerName: "Origin",
      field: "origin",
      //filter: 'agNumberColumnFilter',
      floatingFilter: false,
      suppressSizeToFit: true,
      sortable: true,
      width: 105
    },
    {
      headerName: "Destination",
      field: "destination",
      //filter: 'agNumberColumnFilter',
      floatingFilter: false,
      //suppressSizeToFit: true,
      sortable: true,
      width: 105
    },
    {
      headerName: "Num Seats",
      field: "quantitySeats",
      floatingFilter: false,
      //filter: 'agNumberColumnFilter',
      sortable: true,
      cellClass: 'rag-amber',
      //suppressSizeToFit: true,
      width: 105
    },
    {
      headerName: "Avg Seat Fare",
      field: "averageSeatFare",
      floatingFilter: false,
      //filter: 'agNumberColumnFilter',
      //sortable: true,
      cellClass: 'my-class',
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        return `$${params.data.averageSeatFare}`
      },
      width: 115
    },
    {
      headerName: "Avg Seat Upgrade",
      field: "averageSeatUpgrade",
      //sortable: true,
      floatingFilter: false,
      filter: 'agNumberColumnFilter',
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageSeatUpgrade}`
      }
    },
    {
      headerName: "Avg Seat Discount",
      field: "averageSeatDiscount",
      //sortable: true,
      floatingFilter: false,
      filter: 'agNumberColumnFilter',
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageSeatDiscount}`
      }
    },
    {
      headerName: "Avg Other Upgrade",
      field: "averageOtherUpgrade",
      floatingFilter: false,
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageOtherUpgrade}`
      }
    },
    {
      headerName: "Total Offer",
      field: "totalOffer",
      floatingFilter: false,
      cellClass: 'my-class',
      width: 95
    },

    {
      headerName: "Total Purchase",
      field: "totalPurchase",
      floatingFilter: false,
      cellClass: 'my-class',
      width: 165
    },

  ];

  public rangeSelector: FormGroup;
  public transactionData: any[] = [];
  public transactionDataBehaviorSubject$ = new BehaviorSubject<any[]>([]);
  public gridColumnApi: any;
  public stringDateModel: string = new Date().toString();
  public dateFromModel: Date = new Date();
  public dateToModel: Date = new Date();
  public startTime: any;
  public endTime: any;
  public colorRamp = ContinousColors[0].value;

  public gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: false
    },
    animateRows: true,
    enableCellChangeFlash: true,
    paginationPageSize: 10,
    pagination: true,
    domLayout: 'autoHeight',
    columnDefs: this.columnDefs,
  };

  public gridApi: GridApi;



  constructor(public dateTimePickerComponent: DateTimePickerComponent, private datePipe: DatePipe, private formBuilder: FormBuilder) {

    this.startTime = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A").format('M/D/YYYY hh:mm A');

  }


  ngOnInit(): void {
  }

  public ngAfterViewInit(): void {


    // this.rangeSelector.valueChanges
    //   .pipe(
    //     debounceTime(1220),
    //     distinctUntilChanged(),
    //     tap((event) => {
    //       let metricHolder = [];
    //       let holderAry = [];



    //       setTimeout(() => {
    //         Object.entries(event).forEach((d: any, i) => {
    //           if (d[1] !== '' && d[1].length < 4) {
    //             metricHolder.push(d);
    //           } else if (d[1].length > 3) {
    //             //console.log('YES DATE ', d[1])
    //           }
    //         })

    //         holderAry = [];

    //         this.transactionData.map((word, j) => {

    //           let lgth = 0;
    //           metricHolder.forEach((d: any, i) => {
    //             if (word[d[0]] === d[1]) {
    //               lgth++;
    //               console.log(' lgth ', lgth)

    //             } else {
    //               //console.log('           NOPE  i', i, ' j ', j, ' word[d[0]] ', word[d[0]], ' d ', d[1])
    //             }
    //           })
    //           if (lgth === metricHolder.length) {
    //             holderAry.push(word)
    //           }
    //         })

    //         this.transactionData = holderAry;
    //         //console.log('||||||   ', this.transactionData)
    //         this.transactionDataBehaviorSubject$.next(holderAry)
    //       })

    //     })
    //   )
    //   .subscribe()
  }

  public createForm() {

    //console.log('NEW ', new Date(), ' startTime ', this.startTime)
    // this.rangeSelector = this.formBuilder.group({
    //   origin: new FormControl('', [Validators.required]),
    //   destination: new FormControl('', [Validators.required]),
    //   transactionTimeFrom: new FormControl('', [Validators.required]),
    //   transactionTimeTo: new FormControl('', [Validators.required]),
    //   departureDateFrom: new FormControl(this.startTime, { validators: [Validators.required, DateTimeValidator] }),
    //   departureDateTo: new FormControl(this.endTime, { validators: [Validators.required, DateTimeValidator] })
    // });
  }


  public cellStyle(params: CellClassParams) {
    //console.log('cellStyle ', params.data.loadFactor)
    const color = this.numberToColor(params.data.loadFactor);
    return {
      backgroundColor: color,
    };
  }

  public numberToColor(val: number) {
    // console.log('numberToColor ', val)
    if (val === 0) {
      return '#ffaaaa';
    } else if (val == 1) {
      return '#aaaaff';
    } else {
      return '#aaffaa';
    }
  }



  public dateFormatter(params: any) {
    return moment(params.value).format('M/D/YYYY hh:mm A');
  }


}
