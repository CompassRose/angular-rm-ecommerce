import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ContinousColors } from '../constants'
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { GridApi, GridOptions } from "ag-grid-community";
//import * as moment from 'moment-timezone';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';



//import moment from 'moment'

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

    constructor(public purchaseHistoryService: PurchaseHistoryService) {


        this.purchaseHistoryService.transactionDataBehaviorSubject$
            .subscribe((res) => {

                if (res.length > 0) {
                    //  console.log('res ', res)
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
        this.setChartOptions();
    }


    public ngAfterViewInit(): void { }


    public onValueChange(ev) {
        console.log('onValueChange ', ev[0], ev[1]);
    }


    public getDepartureDate(ev, type) {

        // console.log('getDepartureDate }}}}}}}}}}   getCloseNotification ', ev)

        if (type === 'ddf' && ev) {

            console.log('getDepartureDate }}}}}}}}}}   getCloseNotification FROM ', ev)

            let newDate = new Date(ev);

            let timer = moment(newDate, "M/D/YYYY hh:mm A");

            this.purchaseHistoryService.departureDateFrom = moment(ev).format('M/D/YYYY hh:mm A');

            let durationToAdd = moment.duration(5, 'days');

            const timey = timer.add(durationToAdd).format('M/D/YYYY hh:mm A');

            this.purchaseHistoryService.departureDateTo = moment(timey).format('M/D/YYYY hh:mm A');

            this.rangeSelector.patchValue({ departureDate: this.purchaseHistoryService.departureDateFrom })

        } else if (type === 'ddt') {

            console.log('getDepartureDate    getCloseNotification TO ', ev)
        }
    }


    public getTransactionDate(ev, type) {

        if (type === 'td' && ev) {
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


    public dateFormatter(params: any) {
        return moment(params.value).format('M/D/YYYY hh:mm A');
    }



    // Called from template auto resize chart
    public onChartInit(e: any): void { }


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
            // tooltip: {
            //     show: true,
            //     trigger: 'item',
            //     backgroundColor: 'rgba(255, 255, 255, 1)',
            //     borderWidth: 2,
            //     borderColor: 'Blue',
            //     extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
            //     padding: 12,
            //     axisPointer: {
            //         type: 'cross',
            //         snap: true,
            //         label: {
            //             backgroundColor: '#6a7985'
            //         }
            //     },
            //     // position: (point, params, dom, rect, size) => {
            //     //   console.log('position ', params)
            //     //   return [point[0], '36%'];
            //     // },
            //     textStyle: {
            //         fontSize: 16,
            //         color: '#000'
            //     },
            //     formatter: (params) => {
            //         return `Date: ${this.purchaseHistoryService.transactionData[params.dataIndex].transactionTime}<br>Load Factor: ${this.purchaseHistoryService.transactionData[params.dataIndex].loadFactor}%<br>Ancillary: $${this.purchaseHistoryService.transactionData[params.dataIndex].ancillary}<br>Upgrade: $${this.purchaseHistoryService.transactionData[params.dataIndex].averageSeatUpgrade}`
            //     }
            // },
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