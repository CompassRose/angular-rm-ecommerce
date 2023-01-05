import { Injectable, AfterViewInit } from '@angular/core';
import { DashboardApi } from './dashboard.api';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import { DateTimePickerComponent } from "./date-time-picker/date-time-picker.component";

import * as moment from 'moment';
import 'moment-timezone';



export const filterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {

    const test = moment(filterLocalDateAtMidnight).format('MM/DD/YYYY');
    //console.log('test ', test, ' filterLocalDateAtMidnight ', filterLocalDateAtMidnight, ' cellValue ', cellValue, ' type ', typeof (cellValue))
    var dateAsString = cellValue;

    if (dateAsString == null) return -1;


    var dateParts = dateAsString.split('/');

    //console.log('dateValues ', dateValues)
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    //console.log('test ', test, ' cellDate ', cellValue)


    // if (test === cellValue) {
    //     return 0;
    // }
    if (moment(test).isBefore(cellValue, 'day')) {
      console.log('   Before ')
      return -1;
    }
    else if (moment(cellValue).isBefore(test, 'day')) {
      console.log('   After ')
      return 0;
    } else {
      console.log('   Equals ')
      return 0;
    }
  },
  browserDatePicker: true,
};

@Injectable({
  providedIn: 'root'
})


export class PurchaseHistoryService implements AfterViewInit {

  public transactionData: any[] = [];
  public transactionDataBehaviorSubject$ = new BehaviorSubject<any[]>([]);

  public rangeSelector: FormGroup;

  public gridColumnApi: any;
  public stringDateModel: string = new Date().toString();

  // public dateFromModel: Date = new Date();
  // public dateToModel: Date = new Date();

  public transactionDate: any;
  public transactionDateTo: any;

  public departureDate: any;
  public departureDateTo: any;

  // public endDate: any;

  //public startTime: any;
  //public endTime: any;

  constructor(private dashboardAPI: DashboardApi, dateTimePickerComponent: DateTimePickerComponent) {

    this.dashboardAPI.getTransactions()
      .subscribe(response => {

        response.map((r: any, i: number) => {

          this.transactionData.push({
            index: r.index,
            origin: r.origin,
            destination: r.destination,
            loadFactor: r.loadFactor,
            ancillary: r.ancillary,
            transactionTime: r.transactionTime,
            flightNumber: r.flightNumber,
            quantitySeats: r.quantitySeats,
            averageSeatFare: Math.round(r.averageSeatFare),
            averageSeatDiscount: Math.round(r.averageSeatDiscount),
            averageSeatUpgrade: Math.round(r.averageSeatUpgrade),
            averageOtherUpgrade: Math.round(r.averageOtherUpgrade),
            totalOffer: r.totalOffer,
            totalPurchase: r.totalPurchase,
            baseFare: this.totalBaseFareFormatter()
          })

        })


        let timer = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A");

        let durationToAdd = moment.duration(30, 'minutes');
        let dayToAdd = moment.duration(1, 'day');
        let dayHolder: any;
        let dayTemp: any;

        this.transactionData.map((t, i) => {

          t.totalPurchase = this.totalValueFormatter(t);

          if (i % 120 === 0) {
            dayHolder = timer.add(dayToAdd).format('M/D/YYYY');
            dayTemp = moment(`${dayHolder}, 11:00 AM`, "M/D/YYYY hh:mm A");
            t.transactionTime = moment(dayTemp).format("M/D/YYYY hh:mm A");
          } else {
            const timeHolder = dayTemp.add(durationToAdd).format('M/D/YYYY hh:mm A');
            t.transactionTime = timeHolder

          }

          return t
        })
        console.log('XXXXX ', this.transactionData[0].transactionTime)

        this.transactionDate = this.transactionData[0].transactionTime;

        this.departureDate = this.transactionData[0].transactionTime;

        this.departureDateTo = this.transactionData[this.transactionData.length - 1].transactionTime;

        this.transactionDataBehaviorSubject$.next(this.transactionData);




        // let timer = moment('01/01/2020, 11:00 AM', "M/D/YYYY hh:mm A");

        // let durationToAdd = moment.duration(30, 'minutes');
        // let dayToAdd = moment.duration(1, 'day');
        // let dayHolder: any;
        // let dayTemp: any;

        // let monthsToAdd = moment.duration(60, 'days');

        // const monthsHolder = timer.add(monthsToAdd).format('M/D hh:mm A');

        // let monthsCalc = moment(`${monthsHolder}, 11:00 AM`, "M/D hh:mm A");


        // this.transactionData.map((t, i) => {

        //   t.totalPurchase = this.totalValueFormatter(t);



        //   if (i % 120 === 0) {
        //     dayHolder = timer.add(dayToAdd).format('M/D/YYYY');
        //     dayTemp = moment(`${dayHolder}, 11:00 AM`, "M/D hh:mm A");
        //     t.transactionTime = moment(dayTemp).format("M/D hh:mm A");

        //   } else {

        //     const timeHolder = dayTemp.add(durationToAdd).format('M/D hh:mm A');


        //     const newMonths = monthsCalc.add(durationToAdd).format('M/D hh:mm A');

        //     t.transactionTime = timeHolder;

        //     t.departureTime = newMonths;
        //     console.log('t.transactionTime ', t.transactionTime, ' t.departureTime', t.departureTime)
        //   }

        //   return t
        // })

        //console.log('Service transactionData ', this.transactionData)
      })

  }


  public totalBaseFareFormatter() {

    function randomIntFromInterval(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const rndInt = randomIntFromInterval(241, 437);
    //console.log('rndInt ', rndInt)
    return rndInt;
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
    //         this.transactionDataBehaviorSubject$.next(holderAry);
    //       })

    //     })
    //   )
    //   .subscribe()
  }



  public totalValueFormatter(values: any) {

    function randomIntFromInterval(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const rndInt = randomIntFromInterval(0, 6);

    let totalPurchase = 0;
    return totalPurchase = rndInt === 1 ? (values.quantitySeats * values.averageSeatFare) + (values.quantitySeats * values.averageSeatUpgrade) + (values.quantitySeats * values.averageOtherUpgrade) : 0;

  }


}

