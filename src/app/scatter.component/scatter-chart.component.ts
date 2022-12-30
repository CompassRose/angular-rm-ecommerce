import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';

import { ContinousColors } from '../constants'
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { DashboardApi } from '../dashboard.api';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { GridApi, GridOptions } from "ag-grid-community";
//import * as moment from 'moment-timezone';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import { DateTimePickerComponent } from "../date-time-picker/date-time-picker.component";


//import moment from 'moment';

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


export interface ColorObject {
    key: string;
    value: string[];
}


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
    selector: 'scatter-chart',
    templateUrl: './scatter-chart.component.html',
    styleUrls: ['./scatter-chart.component.scss'],
    providers: [DateTimePickerComponent]
})

export class ScatterChartComponent implements OnInit, AfterViewInit {

    public KpiList: any[] = [
        { id: 0, kpi: 'loadFactor', title: 'Load Factor', suffix: '%', el: 1 },
        { id: 1, kpi: 'ancillary', title: 'Ancillary', suffix: '', el: 2 },
        { id: 2, kpi: 'averageSeatUpgrade', title: 'Average Seat Upgrade', suffix: '', el: 3 }
    ];

    public metricSelectedSubject$ = new BehaviorSubject<any>(0);

    public activeMetric = 0;

    public colorRange: any;

    public colorCollections: ColorObject[] = ContinousColors;

    public dateFromModel: Date = new Date();

    public dateToModel: Date = new Date();

    public stringDateModel: string = new Date().toString();

    public options: EChartsOption = {};

    public colorRamp = ContinousColors[0].value;

    public myChart: echarts.ECharts;

    public gridColumnApi: any;

    public rangeSelector: FormGroup;

    public supportingPieValues: any[] = [];

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


    constructor(public dateTimePickerComponent: DateTimePickerComponent,
        private dashboardAPI: DashboardApi,
        private formBuilder: FormBuilder,
        public purchaseHistoryService: PurchaseHistoryService) {

        let timer = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A");

        this.purchaseHistoryService.transactionDate = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A").format('M/D/YYYY hh:mm A');

        let durationToAdd = moment.duration(15, 'minutes');

        const timeHolder = timer.add(durationToAdd).format('M/D/YYYY hh:mm A');

        this.purchaseHistoryService.transactionDateTo = moment(timeHolder).format('M/D/YYYY hh:mm A');

        console.log('day transactionDateTo ', this.purchaseHistoryService.transactionDateTo)

        this.purchaseHistoryService.departureDate = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A").format('hh:mm A');


        this.purchaseHistoryService.transactionDataBehaviorSubject$
            .subscribe((res) => {

                if (res.length > 0) {
                    this.supportingPieValues = [];
                    this.purchaseHistoryService.transactionData.map((t, i) => {

                        if (t.totalPurchase > 0) {
                            this.supportingPieValues.push(this.setPieValues([t.transactionTime, t.baseFare, t.loadFactor, t.ancillary, t.averageSeatUpgrade]))
                        }
                    })
                    this.setChartOptions();
                }
            })

        this.colorRange = ContinousColors[0];
    }


    ngOnInit(): void {
        const chart: HTMLCanvasElement = document.getElementById('scatter-chart') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, 'light');
        this.createForm();
        this.setChartOptions();
    }


    public ngAfterViewInit(): void {
        //console.log(' ???? ', this.dateTimePickerComponent)
        this.rangeSelector.valueChanges
            .pipe(
                debounceTime(1220),
                distinctUntilChanged(),
                tap((event) => {

                    let metricHolder = [];
                    let holderAry = [];

                    //console.log('event ', event)

                    setTimeout(() => {
                        Object.entries(event).forEach((d: any, i) => {
                            if (d[1] !== '' && d[1].length < 4 && d[1]) {
                                metricHolder.push(d);
                            } else if (d[1].length > 3) {
                                //console.log('YES DATE ', d[1])
                            }
                        })

                        holderAry = [];

                        this.purchaseHistoryService.transactionData.map((word, j) => {

                            let lgth = 0;
                            metricHolder.forEach((d: any, i) => {
                                if (word[d[0]] === d[1]) {
                                    lgth++;
                                    // console.log(' lgth ', lgth)

                                } else {
                                    // console.log('           NOPE  i', i, ' j ', j, ' word[d[0]] ', word[d[0]], ' d ', d[1])
                                }
                            })
                            if (lgth === metricHolder.length) {
                                holderAry.push(word)
                            }
                        })

                        this.purchaseHistoryService.transactionData = holderAry;
                        this.purchaseHistoryService.transactionDataBehaviorSubject$.next(holderAry)
                    })

                })
            )
            .subscribe()
    }


    public getDepartureDate(ev, type) {

        console.log('getDepartureDate }}}}}}}}}}   getCloseNotification ', ev)

        if (type === 'dd') {
            console.log('getDepartureDate }}}}}}}}}}   getCloseNotification ', ev)
            let newDate = new Date(ev)
            let timer = moment(newDate, "M/D/YYYY hh:mm A");
            this.purchaseHistoryService.departureDate = moment(ev).format('M/D/YYYY hh:mm A');

            let durationToAdd = moment.duration(5, 'days');

            const timey = timer.add(durationToAdd).format('M/D/YYYY hh:mm A');

            //this.purchaseHistoryService.departureDateTo = moment(timey).format('M/D/YYYY hh:mm A');

            this.rangeSelector.patchValue({ departureDate: this.purchaseHistoryService.departureDate })
        }
    }


    public getTransactionDate(ev, type) {
        if (type === 'td') {
            console.log('\n\n\n getTransactionDate ', ev)
            let newDate = new Date(ev)
            let timer = moment(newDate, "M/D/YYYY hh:mm A");
            this.purchaseHistoryService.transactionDate = moment(ev).format('M/D/YYYY hh:mm A');

            let durationToAdd = moment.duration(30, 'minutes');
            const timey = timer.add(durationToAdd).format('M/D/YYYY hh:mm A');
            this.purchaseHistoryService.transactionDateTo = moment(timey).format('M/D/YYYY hh:mm A');
            console.log('       transactionDateTo ', this.purchaseHistoryService.transactionDateTo)
            this.rangeSelector.patchValue({ transactionTimeTo: this.purchaseHistoryService.transactionDateTo })
        }


    }

    // Called from Dropdown in Template and with incoming data
    public selectKpiElement(el: any): void {
        console.log('selectKpiElement ', el)
        this.activeMetric = el.el;
        this.metricSelectedSubject$.next(el.id)
        this.setChartOptions()
        // this.dashboardAPI.setSelectedMetric(el);
        // window.localStorage.setItem('metricSettings', JSON.stringify(el.id));
    }


    // From color range dropdown
    public selectColorRange(ev: any): void {

        const rangeIdx = ContinousColors.findIndex(r => r.key === ev.key);
        console.log('selectColorRange ', ev, ' r i ', rangeIdx)
        this.colorRange = ContinousColors[rangeIdx];
        this.setChartOptions()
        // window.localStorage.setItem('colorRange', JSON.stringify(rangeIdx));
        // if (this.dashboardAPI.yearCollection.length > 0) {
        //     this.setSeriesValues();
        // }
    }


    public setPieValues(item: any): any {

        const pieRadius = 15;

        const pieFace = {
            type: 'pie',
            silent: true,
            z: 3,
            //id: 'pie-' + index,
            center: [item[0], item[1]],
            radius: pieRadius,
            coordinateSystem: 'cartesian2d',
            itemStyle: {
                borderColor: 'black',
                borderWidth: 1

            },
            label: {
                show: false,
                formatter: '{c}',
                fontSize: 9,
                position: 'inside'
            },
            data: [
                { name: 'Time', value: item[0] },
                { name: 'Load Factor', value: item[1] },
                { name: 'Ancillary', value: item[2] },
                { name: 'Average Seat Upgrade', value: item[3] }
            ]
        };

        //console.log('pieFace ', pieFace, ' item ', item)
        return pieFace;
    }


    public createForm() {

        //console.log('NEW ', new Date(), ' transactionDate ', this.purchaseHistoryService.transactionDate)
        this.rangeSelector = this.formBuilder.group({
            origin: new FormControl('', [Validators.required]),
            destination: new FormControl('', [Validators.required]),
            transactionTimeFrom: new FormControl(this.purchaseHistoryService.transactionDate, { validators: [Validators.required, DateTimeValidator] }),
            transactionTimeTo: new FormControl(this.purchaseHistoryService.transactionDateTo, { validators: [Validators.required, DateTimeValidator] }),
            departureDateFrom: new FormControl(this.purchaseHistoryService.departureDate, { validators: [Validators.required, DateTimeValidator] }),
            departureDateTo: new FormControl(this.purchaseHistoryService.departureDateTo, { validators: [Validators.required, DateTimeValidator] })
        });
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



    // Called from template auto resize chart
    public onChartInit(e: any): void { }


    public getRowHeight: (
        params: RowHeightParams) => number | undefined | null = (params: RowHeightParams) => {
            return 40;
        };


    public onGridReady(params: any) {
        //console.log('onGridReady ', params)

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


    public setChartOptions(): void {
        //console.log(' this.colorRange', this.colorRange)

        this.myChart.setOption(this.options);

        this.options = {
            //color: ['#dd4444', '#fec42c', '#80F1BE'],
            title: {
                show: false,
                text: 'Transactions',
            },
            grid: {
                show: false,
                left: 50,
                right: 20,
                top: 40,
                bottom: 80
            },
            toolbox: {
                show: true,
                right: 60,
                top: -7,
                itemSize: 13,
                // emphasis: {
                //     iconStyle: {
                //         //textPosition: 'left',
                //         textBackgroundColor: 'white'
                //     }
                // },
                feature: {
                    dataZoom: {
                        show: true,
                        yAxisIndex: 'none',
                        iconStyle: {
                            textBackgroundColor: 'white'
                        },
                        emphasis: {
                            iconStyle: {
                                borderColor: 'navy'
                            }
                        },
                        brushStyle: {
                            borderColor: 'lightBlue',
                            borderWidth: 1
                        }
                        // icon: {
                        //     back: 'activeState'
                        // }
                    },
                },
            },
            tooltip: {
                show: true,
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                borderColor: 'Blue',
                extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                padding: 12,
                axisPointer: {
                    type: 'cross',
                    snap: true,
                    label: {
                        backgroundColor: '#6a7985'
                    }
                },
                // position: (point, params, dom, rect, size) => {
                //   console.log('position ', params)
                //   return [point[0], '36%'];
                // },
                textStyle: {
                    fontSize: 16,
                    color: '#000'
                },
                formatter: (params) => {
                    return `Date: ${this.purchaseHistoryService.transactionData[params.dataIndex].transactionTime}<br>Load Factor: ${this.purchaseHistoryService.transactionData[params.dataIndex].loadFactor}%<br>Ancillary: $${this.purchaseHistoryService.transactionData[params.dataIndex].ancillary}<br>Upgrade: $${this.purchaseHistoryService.transactionData[params.dataIndex].averageSeatUpgrade}`
                }
            },
            xAxis: {
                scale: true,
                type: 'category',
                boundaryGap: ['20%', '20%']
            },
            yAxis: {
                scale: true,
                boundaryGap: ['0%', '2%'],
                type: 'value',
            },
            dataZoom: [{
                show: true,
                start: 0,
                end: 20,
                filterMode: 'none',
            }, {
                type: 'inside'
            }],
            series: [
                {
                    type: 'scatter',
                    silent: false,
                    data: this.purchaseHistoryService.transactionData.map((s, i) => {

                        const test = Math.round(Math.floor(s.ancillary * 10 / 100))
                        //console.log('test ', this.KpiList[this.activeMetric].kpi)
                        const elColor = this.colorRange.value[test];

                        return {
                            value: [s.transactionTime, s.baseFare],
                            itemStyle: {
                                normal: {
                                    color: s.totalPurchase > 0 ? elColor : 'rgba(150,150,150,0.1)',
                                    borderColor: 'red',
                                    borderWidth: s.totalPurchase > 0 ? 1 : 0,
                                },
                                // emphasis: {
                                //   color: '#0000fd'
                                // }
                            },
                            symbolSize: s.totalPurchase > 0 ? 60 + (test * 2) : 20
                        }
                    }),
                },
                ...this.supportingPieValues

            ]
        }


    }
}