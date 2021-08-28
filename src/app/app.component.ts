import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpService } from './http.service';
import { DestinationCountry, HostCountry, Currency, Quote } from './responseTypes';
import { dateAfterValidator, dateBeforeValidator } from './customValidators';

const productId = 8;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'battleface';
  showFormError = false;
  lastQuote?: Quote; 
  // = {
  //   total: 123,
  //   currency_id: "USD",
  //   fees: 342,
  //   premium: 1234,
  //   quotation_id: 999,
  //   return_url: 'https://google.com',
  //   tax: 0.5
  // };

  // Form Controls
  hostCountryControl = new FormControl('', [Validators.required]);
  hostStateControl = new FormControl('', [Validators.required]);
  destCountryControl = new FormControl('', [Validators.required]);
  currencyControl = new FormControl('', [Validators.required]);
  startDateControl = new FormControl('', [Validators.required]);
  endDateControl = new FormControl('', [Validators.required, dateAfterValidator(this.startDateControl)]);
  depositDateControl = new FormControl('', [Validators.required]);
  winterExtensionControl = new FormControl(false);
  ageControl = new FormControl('', [Validators.required, Validators.min(18)]);
  totalCostControl = new FormControl(0, [Validators.required, Validators.min(0)]);
  
  // Select Options
  hostCountryOptions: HostCountry[] = [];
  destCountryOptions: DestinationCountry[] = [];
  currencyOptions: Currency[] = [];

  // The form itself
  form = new FormGroup({
    hostCountry: this.hostCountryControl,
    hostState: this.hostStateControl,
    destCountry: this.destCountryControl,
    currency: this.currencyControl,
    startDate: this.startDateControl,
    endDate: this.endDateControl,
    winterExtension: this.winterExtensionControl,
    age: this.ageControl,
    totalCost: this.totalCostControl,
    depositDate: this.depositDateControl
  });

  // Subscriptions we need to track
  startDateSub!: any;
  endDateSub!: any;

  constructor(private http: HttpService) {
    // Initialize host countries
    this.http.getHostCountries(productId).subscribe((res) => {
      this.hostCountryOptions = res;
    });

    // Initialize destination countries
    this.http.getDestinationCountries(productId).subscribe((res) => {
      this.destCountryOptions = res;
    });

    // When Host Country changes, update the list of applicable currencies
    this.hostCountryControl.valueChanges.subscribe((newHost: HostCountry) => {
      this.currencyControl.setValue('');
      this.http.getAllowedCurrencies(productId, newHost.country_id).subscribe((currencies) => {
        this.currencyOptions = currencies;
      });
    });

    // We must add these validators after initialization, because they depend on FormControls that do not yet exist
    this.endDateControl.addValidators(dateAfterValidator(this.startDateControl));
    this.startDateControl.addValidators(dateBeforeValidator(this.endDateControl));

    this.restoreStartDateSub();
    this.restoreEndDateSub();
  }

  /**
   * Callback for main form, will submit form data to API to retrieve Quote data
   */
  onSubmit() {
    this.showFormError = false;
    
    // Send form data to API
    this.http.getQuote(
      this.startDateControl.value,
      this.endDateControl.value,
      this.totalCostControl.value,
      this.depositDateControl.value,
      this.winterExtensionControl.value,
      productId,
      this.ageControl.value,
      this.currencyControl.value.iso_code,
      this.destCountryControl.value,
      this.hostCountryControl.value,
      this.hostStateControl.value
    ).pipe(
      catchError(this.handleFormError.bind(this))
    ).subscribe((res) =>{
      this.lastQuote = res;
    });
  }

  /////////////////////////////
  // Some Helper Functions
  /////////////////////////////

  private handleFormError(err: HttpErrorResponse) {
    this.showFormError = true;
    return throwError('Unable to submit form');
  }

  private restoreStartDateSub() {
    this.startDateSub = this.startDateControl.valueChanges.subscribe(() => {
      // Temporarily unsubscribe, so we do not get an infinite loop 
      this.endDateSub.unsubscribe();
      // Manually re-validate End Date, to ensure a valid range
      this.endDateControl.markAsTouched()
      this.endDateControl.updateValueAndValidity()
      this.restoreEndDateSub();
    });
  }

  private restoreEndDateSub() {
    this.endDateSub = this.endDateControl.valueChanges.subscribe(() => {
      // Temporarily unsubscribe, so we do not get an infinite loop
      this.startDateSub.unsubscribe();
      // Manually re-validate Start Date, to ensure a valid range
      this.startDateControl.markAsTouched();
      this.startDateControl.updateValueAndValidity();
      this.restoreStartDateSub();
    });
  }
  
}
