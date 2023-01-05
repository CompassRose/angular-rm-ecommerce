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
import { DateTimePickerComponent } from "./date-time-picker/date-time-picker.component";
import { NgSelectModule } from '@ng-select/ng-select';

import {
  FaIconLibrary,
  FontAwesomeModule
} from "@fortawesome/angular-fontawesome";
import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { FlightPurchaseComponent } from './flight-purchase/flight-purchase.component';


@NgModule({
  declarations: [
    AppComponent,
    ScatterChartComponent,
    DateTimePickerComponent,
    FilterPipe,
    FlightPurchaseComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    NgSelectModule,
    HttpClientModule,
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [DateTimePickerComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faCalendar, faClock);
  }
}
