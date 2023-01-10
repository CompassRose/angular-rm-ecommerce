import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashboardApi } from '../dashboard.api';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs'
import { GridApi, GridOptions } from "ag-grid-community";
//import * as moment from 'moment-timezone';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'
import { formatDate } from '@angular/common';
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

import { PurchaseHistoryService } from '../purchase-history.service';


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
  providers: [DatePipe]
})

export class FlightPurchaseComponent implements OnInit, AfterViewInit {


  public columnDefs: ColDef[] = [
    {
      headerName: 'Id',
      field: 'index',
      width: 50,
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
      width: 60,
      floatingFilter: false,
      // filter: 'agNumberColumnFilter',
      sortable: true,
      cellStyle: function (params) {
        const test = Math.round(Math.floor(params.value * 10 / 100))
        return { color: 'black', backgroundColor: ContinousColors[5].value[test] };
      }
    },
    {
      headerName: 'Transaction Time',
      field: 'transactionTime',
      floatingFilter: false,
      sortable: true,
      valueFormatter: this.dateFormatter,
      width: 155
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
      headerName: "Dest",
      field: "destination",
      //filter: 'agNumberColumnFilter',
      floatingFilter: false,
      //suppressSizeToFit: true,
      sortable: true,
      width: 95
    },
    {
      headerName: "Num Seats",
      field: "quantitySeats",
      floatingFilter: false,
      sortable: true,
      cellClass: 'rag-amber',
      //suppressSizeToFit: true,
      width: 105
    },
    {
      headerName: "Base Fare",
      field: "baseFare",
      floatingFilter: false,
      sortable: true,
      cellClass: 'my-class',
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        return `$${params.data.baseFare}`
      },
      width: 115
    },
    {
      headerName: "Avg Seat Fare",
      field: "averageSeatFare",
      floatingFilter: false,
      sortable: true,
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
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageSeatUpgrade}`
      },
      width: 115
    },
    {
      headerName: "Avg Seat Discount",
      field: "averageSeatDiscount",
      //sortable: true,
      floatingFilter: false,
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageSeatDiscount}`
      },
      width: 115
    },
    {
      headerName: "Avg Other Upgrade",
      field: "averageOtherUpgrade",
      floatingFilter: false,
      cellClass: 'my-class',
      cellRenderer: (params: any) => {
        return `$${params.data.averageOtherUpgrade}`
      },
      width: 125
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


  // public transactionData: any[] = [];
  //public transactionDataBehaviorSubject$ = new BehaviorSubject<any[]>([]);
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


  constructor(public purchaseHistoryService: PurchaseHistoryService, private datePipe: DatePipe, private formBuilder: FormBuilder) {

    //this.startTime = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A").format('M/D/YYYY hh:mm A');
  }


  ngOnInit(): void {

  }

  public ngAfterViewInit(): void {
    // this.createForm()
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




  public getRowHeight: (
    params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
      return 40;
    };


  public onGridReady(params: any) {
    console.log('onGridReady ', params)

    this.gridApi = params.api;
    // setTimeout(() => {
    //     this.gridColumnApi = params.columnApi;
    //     this.gridApi.setColumnDefs(this.columnDefs);
    //     this.gridApi.setRowData(this.filteredData);
    //     this.gridApi.resetRowHeights();
    //     this.gridColumnApi.autoSizeColumns()
    //     this.gridApi.sizeColumnsToFit()
    // }, 200);
  }


  public dateFormatter(params: any) {
    return moment(params.value).format('M/D/YYYY hh:mm A');
  }


}
