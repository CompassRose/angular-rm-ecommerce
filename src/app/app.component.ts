import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GridApi, GridOptions } from "ag-grid-community";
import { BtnCellRenderer } from './grid-components';
import { DashboardApi } from './dashboard.api';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(private dashboardAPI: DashboardApi) { }

  public ngAfterViewInit(): void { }

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

  public getRowHeight: (
    params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
      return 40;
    };

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

}
