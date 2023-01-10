import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ScatterChartComponent } from './scatter.component/scatter-chart.component';
import { FilterPipe } from './pipes/filter.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';

//calendar3
// calendar2-x-fill
//calendar2-plus
import { calendarFill, ColorTheme } from 'ngx-bootstrap-icons';
const icons = {
  calendarFill
}
// import {
//   FaIconLibrary,
//   FontAwesomeModule
// } from "@fortawesome/angular-fontawesome";
//import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { FlightPurchaseComponent } from './flight-purchase/flight-purchase.component';
import { GraphChartComponent } from './graph-chart/graph-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    ScatterChartComponent,
    FilterPipe,
    FlightPurchaseComponent,
    GraphChartComponent,
    GraphChartComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    NgSelectModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    NgxBootstrapIconsModule.pick(icons, {
      width: '1em',
      height: '1em'
    }),
    BsDatepickerModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule {
  // constructor(library: FaIconLibrary) {
  //   library.addIcons(faCalendar, faClock);
  // }
}
