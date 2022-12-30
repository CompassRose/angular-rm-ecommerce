import {
    Component,
    OnInit,
    Input,
    forwardRef,
    ViewChild,
    Output,
    EventEmitter,
    AfterViewInit,
    Injector
} from "@angular/core";
import {
    NgbTimeStruct,
    NgbDateStruct,
    NgbPopoverConfig,
    NgbPopover,
    NgbDatepicker
} from "@ng-bootstrap/ng-bootstrap";
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    NgControl
} from "@angular/forms";
import { DatePipe } from "@angular/common";
import { DateTimeModel } from "./date-time-model";
import { noop } from "rxjs";

@Component({
    selector: "app-date-time-picker",
    templateUrl: "./date-time-picker.component.html",
    providers: [
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DateTimePickerComponent,
            multi: true
        }
    ]
})

export class DateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input()
    dateString: string;

    @Input()
    inputDatetimeFormat = "M/d/yyyy H:mm a";
    @Input()
    hourStep = 1;
    @Input()
    minuteStep = 10;
    @Input()
    secondStep = 30;
    @Input()
    seconds = true;
    @Input()
    disabled = false;


    @Output() public dateChange: EventEmitter<any> = new EventEmitter<any>();

    public showTimePickerToggle = false;

    public datetime: DateTimeModel = new DateTimeModel();

    private firstTimeAssign = true;

    public selected = {
        year: 2020,
        month: 1,
        day: 1
    }

    @ViewChild(NgbDatepicker, { static: true })
    private dp: NgbDatepicker;

    @ViewChild(NgbPopover, { static: true })
    private popover: NgbPopover;

    public onTouched: () => void = noop;
    public onChange: (_: any) => void = noop;

    public ngControl: NgControl;

    constructor(private config: NgbPopoverConfig, private inj: Injector) {
        config.autoClose = "outside";
        config.placement = "auto";
    }

    ngOnInit(): void {
        this.ngControl = this.inj.get(NgControl);
        // console.log('this.ngControl  ', this.ngControl)
    }

    ngAfterViewInit(): void {
        this.popover.hidden.subscribe($event => {
            this.showTimePickerToggle = false;
        });
    }

    writeValue(newModel: string) {
        console.log('writeValue newModel ', newModel)
        if (newModel) {
            this.datetime = Object.assign(
                this.datetime,
                DateTimeModel.fromLocalString(newModel)
            );
            this.dateString = newModel;
            this.setDateStringModel();
        } else {
            //this.datetime = new DateTimeModel();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // @ts-ignore
    toggleDateTimeState($event) {
        this.showTimePickerToggle = !this.showTimePickerToggle;
        $event.stopPropagation();
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInputChange($event: any) {
        //console.log('onInputChange ', $event)
        const value = $event.target.value;
        const dt = DateTimeModel.fromLocalString(value);

        if (dt) {
            this.datetime = dt;
            this.setDateStringModel();
        } else if (value.trim() === "") {
            this.datetime = new DateTimeModel();
            this.dateString = "";
            this.onChange(this.dateString);
        } else {
            this.onChange(value);
        }
    }


    onDateChange($event: string | NgbDateStruct, dp: NgbDatepicker) {

        console.log('onDateChange ', $event, ' dp ', dp)

        const date = new DateTimeModel($event);

        if (!date) {
            this.dateString = this.dateString;
            return;
        }

        if (!this.datetime) {
            this.datetime = date;
        }

        this.datetime.year = date.year;
        this.datetime.month = date.month;
        this.datetime.day = date.day;

        const adjustedDate = new Date(this.datetime.toString());

        if (this.datetime.timeZoneOffset !== adjustedDate.getTimezoneOffset()) {
            this.datetime.timeZoneOffset = adjustedDate.getTimezoneOffset();
        }



        this.setDateStringModel();
    }

    onTimeChange(event: NgbTimeStruct) {
        this.datetime.hour = event.hour;
        this.datetime.minute = event.minute;
        this.datetime.second = event.second;

        this.setDateStringModel();
    }

    setDateStringModel() {
        //  console.log('this.firstTimeAssign ', this.firstTimeAssign)

        this.dateString = this.datetime.toString();

        //  console.log('this.dateString ', this.dateString)

        this.dateChange.emit(this.dateString);

        if (!this.firstTimeAssign) {
            this.onChange(this.dateString);
        } else {
            // Skip very first assignment to null done by Angular
            if (this.dateString !== null) {
                this.firstTimeAssign = false;
            }
        }
    }

    // @ts-ignore

    inputBlur($event) {
        //console.log('inputBlur ', $event)
        this.onTouched();
    }
}
