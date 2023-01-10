import { Component, OnInit } from '@angular/core';

import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { PurchaseHistoryService } from '../purchase-history.service';

@Component({
  selector: 'app-graph-chart',
  templateUrl: './graph-chart.component.html',
  styleUrls: ['./graph-chart.component.scss']
})


export class GraphChartComponent implements OnInit {

  public options: EChartsOption = {};
  public myChart: echarts.ECharts;

  public graphData = [];
  public linkData: any[] = [];

  constructor(public purchaseHistoryService: PurchaseHistoryService) {

    this.purchaseHistoryService.transactionDataBehaviorSubject$
      .subscribe((res) => {

        if (res.length > 0) {
          res.forEach((tran, i) => {
            // this.graphData.push(res)
          })
          console.log('GraphChartComponent  ', this.purchaseHistoryService.transactionData)


          this.setChartOptions();
        }
      })
  }

  public ngOnInit(): void {

    this.setChartNodes();

  }

  public setChartNodes() {
    const chart: HTMLCanvasElement = document.getElementById('graph-chart') as HTMLCanvasElement;
    this.myChart = echarts.init(chart, 'light');
    this.setChartOptions();
  }


  public setChartOptions(): void {

    console.log(' this.colorRange  setChartOptions')

    this.myChart.setOption(this.options);

    const axisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // this.linkData = this.purchaseHistoryService.transactionData.map((rd, i) => {
    //   const test = 0
    //   if (i % 2 === 0) {
    //     console.log('rd ', rd)

    //     return {
    //       source: i,
    //       target: i + 1
    //     }
    //   }
    // })

    // console.log('this.linkData ', this.linkData)

    const data = axisData.map(function (item, i) {

      return Math.round(Math.random() * 1000 * (i + 1));

    });

    let test = {};
    let links = []
    this.purchaseHistoryService.transactionData.map(function (item, i) {

      if (i % 2 === 0) {
        // console.log('links ', i)

        test = {
          source: i,
          target: i + 1
        }
        links.push(test)
      }

      // return {
      //   source: i,
      //   target: i + 1

      // };
    });

    //console.log('data ', data)
    //links = test
    console.log('links ', links)

    links.pop();

    this.options = {
      grid: {
        show: false,
        left: 50,
        right: 20,
        top: 40,
        bottom: 30
      },
      title: {
        //text: 'Graph on Cartesian'
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: axisData
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          symbolSize: 40,
          label: {
            show: true
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          data: data,
          links: links,
          lineStyle: {
            color: '#2f4554'
          }
        }
      ]
    };

  }
}
