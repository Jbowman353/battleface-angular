export interface DestinationCountry {
    name: string;
    country_id: string;
}

export interface HostCountry {
    name: string;
    country_id: string;
    host_country_states: {
        country_state: {
            code: string;
            name: string
        }[]
    }
}

export interface Currency {
    name: string;
    iso_code: string;
}

export interface Quote {
    total: number;
    premium: number;
    tax: number;
    fees: number;
    currency_id: string;
    return_url: string;
    quotation_id: number;
}