import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminUser, Asset, Assignment, Disposal, InvestedSummary, PurchaseInvoice } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AssetsApiService {
  private readonly base = '/api';

  constructor(private readonly http: HttpClient) {}

  createInvoice(payload: {
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    supplierId: number;
    budgetLineId: number;
    notes?: string;
  }): Observable<PurchaseInvoice> {
    return this.http.post<PurchaseInvoice>(`${this.base}/acquisitions/invoices`, payload);
  }

  createAsset(payload: {
    assetCode?: string;
    name: string;
    description?: string;
    serialNumber: string;
    acquisitionDate: string;
    acquisitionCost: number;
    tagType: 'QR' | 'RFID';
    tagValue: string;
    location: string;
    purchaseInvoiceId: number;
  }): Observable<Asset> {
    return this.http.post<Asset>(`${this.base}/inventory/assets`, payload);
  }

  listAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.base}/inventory/assets`);
  }

  createAssignment(payload: {
    assetId: number;
    employeeId: number;
    assignedAt: string;
    expectedReturnAt?: string;
    digitalSignature: string;
    receiptConfirmation: string;
  }): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.base}/assignments`, payload);
  }

  returnAssignment(assignmentId: number): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.base}/assignments/${assignmentId}/return`, {});
  }

  listAssignmentsByEmployee(employeeId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.base}/assignments/employee/${employeeId}`);
  }

  listReturnedAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.base}/assignments/returns`);
  }

  requestDisposal(payload: {
    assetId: number;
    reason: string;
    disposalType: string;
    requestedBy: string;
  }): Observable<Disposal> {
    return this.http.post<Disposal>(`${this.base}/disposals`, payload);
  }

  approveDisposal(disposalId: number, payload: { approvedBy: string; finalValue: number }): Observable<Disposal> {
    return this.http.post<Disposal>(`${this.base}/disposals/${disposalId}/approve`, payload);
  }

  listPendingDisposals(): Observable<Disposal[]> {
    return this.http.get<Disposal[]>(`${this.base}/disposals/pending`);
  }


  createUser(payload: { username: string; password: string; role: 'ADMINISTRADOR' | 'COMPRAS' | 'INVENTARIO' | 'EMPLEADO' | 'FINANZAS'; employeeId?: number }): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.base}/admin/users`, payload);
  }

  myAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.base}/employee/me/assignments`);
  }

  investedSummary(): Observable<InvestedSummary> {
    return this.http.get<InvestedSummary>(`${this.base}/reports/invested-assets/summary`);
  }

  employeeReport(employeeId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.base}/reports/employee/${employeeId}`);
  }

  upcomingDisposals(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.base}/reports/upcoming-disposals`);
  }

  exportInvested(format: 'excel' | 'pdf'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.base}/reports/invested-assets/export`, {
      params,
      responseType: 'blob'
    });
  }
}
