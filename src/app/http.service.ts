import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Currency, DestinationCountry, HostCountry, Quote } from './responseTypes';

const httpOptions = {
  headers: {
    'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUYW5naWVycyBJbnRlcm5hdGlvbmFsIiwiaWF0IjoxNjI4MDA4MjAxLCJleHAiOjIyNTkxNjAyMDEsIm5iZiI6MTYyODAwODIwMSwianRpIjoiVkZzU3I5TE9hbHNKN1d0QyIsImFmZmlsaWF0ZV9pZCI6MSwicHJvZHVjdF9pZHMiOnsiMSI6MiwiMiI6NiwiMyI6NywiNCI6OCwiNSI6OSwiNiI6MTAsIjciOjExLCI4IjoxMn0sInBlcm1pc3Npb25zIjpbIlFRQyIsIkdBQyIsIkdEQyIsIkdIQyIsIkdSVSJdLCJzdWIiOiJQYXJ0bmVyIEFjY2VzcyBUb2tlbiJ9.sTZsa-ufE4MkDaqKMz380HmGZjc2evxOXw9M1H1M_Xs`,
    'Content-Type': 'application/json'
  },
  responseType: 'json' as const
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  /**
   * Retrieve applicable destination countries from the API, given the product ID
   * @param productId - ID No. of the relevant product
   */
  getDestinationCountries(productId: number): Observable<DestinationCountry[]> {
    return this.http.get<DestinationCountry[]>(
      `https://coding-challenge-api.bfdevsite.com/api/v1/site/1/product/${productId}/destination_country`,
      httpOptions
    )
  }

  /**
   * Retrieve applicable host countries from the API, given the product ID
   * @param productId - ID No. of the relevant product
   */
  getHostCountries(productId: number): Observable<HostCountry[]> {
    return this.http.get<HostCountry[]>(
      `https://coding-challenge-api.bfdevsite.com/api/v1/site/1/product/${productId}/host_country`,
      httpOptions
    )
  }

  /**
   * Retrieve the currencies allowed for a particular combination of product and country from the API
   * @param productId - ID No. of the relevant product
   * @param countryId - country ISO code (e.g. 'US')
   */
  getAllowedCurrencies(productId: number, countryId: string): Observable<Currency[]> {
    return this.http.get<Currency[]>(
      `https://coding-challenge-api.bfdevsite.com/api/v1/token/product/${productId}/country/${countryId}/currencies`,
      httpOptions
    )
  }

  /**
   * Retrieve a quotation from the API
   * @param startDate - Start date of trip
   * @param endDate - End date of trip
   * @param totalCost - Total cost of the trip
   * @param depositDate - Date which first deposit payment will be made
   * @param winterExtension - Whether or not the Winter Sports Extension is required
   * @param productId - ID of the product of interest
   * @param age - Age of insured
   * @param currencyId - ISO code of currency to be used
   * @param destCountries - List of destination countries
   * @param hostCountry - Home country of insured
   * @param countryState - OPTIONAL: Home state of insured
   */
  getQuote(startDate: Date, endDate: Date, totalCost: number, depositDate: Date, winterExtension: boolean, productId: number,
    age: number, currencyId: string, destCountries: DestinationCountry[], hostCountry: HostCountry, countryState?: string): Observable<Quote> {
    return this.http.post<Quote>(
      'https://coding-challenge-api.bfdevsite.com/api/v1/site/1/token/quotation',
      {
        product_id: productId,
        age: String(age),
        currency_id: currencyId,
        destination_country_ids: destCountries.map(country => country.country_id).join(','),
        host_country_id: hostCountry.country_id,
        country_state: countryState,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        trip_cost: Number(totalCost),
        deposit_date: depositDate.toISOString(),
        winter_sport_extension: winterExtension
      },
      httpOptions
    )
  }
}
