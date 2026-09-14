import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AccountingRangeFilters,
  AccountingSummary,
  PaymentMethodBreakdown,
  ServiceBreakdown,
  TimelineGroupBy,
  TimelinePoint,
} from './accounting.model';

const BASE_URL = `${environment.apiUrl}/accounting`;

// Sin desde/hasta no se manda el param: el backend aplica su propio
// default (mes calendario actual), ver PROGRESS.md de nocturne-api.
function rangeParams(filters: AccountingRangeFilters): HttpParams {
  let params = new HttpParams();
  if (filters.desde) {
    params = params.set('desde', filters.desde);
  }
  if (filters.hasta) {
    params = params.set('hasta', filters.hasta);
  }
  return params;
}

@Service()
export class AccountingApi {
  private readonly http = inject(HttpClient);

  summary(filters: AccountingRangeFilters = {}): Promise<AccountingSummary> {
    return firstValueFrom(
      this.http.get<AccountingSummary>(`${BASE_URL}/summary`, {
        params: rangeParams(filters),
      }),
    );
  }

  byService(
    filters: AccountingRangeFilters = {},
  ): Promise<ServiceBreakdown[]> {
    return firstValueFrom(
      this.http.get<ServiceBreakdown[]>(`${BASE_URL}/by-service`, {
        params: rangeParams(filters),
      }),
    );
  }

  byPaymentMethod(
    filters: AccountingRangeFilters = {},
  ): Promise<PaymentMethodBreakdown[]> {
    return firstValueFrom(
      this.http.get<PaymentMethodBreakdown[]>(
        `${BASE_URL}/by-payment-method`,
        { params: rangeParams(filters) },
      ),
    );
  }

  timeline(
    filters: AccountingRangeFilters & { groupBy?: TimelineGroupBy } = {},
  ): Promise<TimelinePoint[]> {
    let params = rangeParams(filters);
    if (filters.groupBy) {
      params = params.set('groupBy', filters.groupBy);
    }
    return firstValueFrom(
      this.http.get<TimelinePoint[]>(`${BASE_URL}/timeline`, { params }),
    );
  }
}
