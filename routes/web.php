<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProcurementController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/dashboard', [ProcurementController::class, 'dashboard'])->name('dashboard');

Route::get('/purchase-orders', [ProcurementController::class, 'purchaseOrders'])->name('purchase-orders.index');
Route::get('/purchase-orders/create', [ProcurementController::class, 'createPurchaseOrder'])->name('purchase-orders.create');
Route::post('/purchase-orders', [ProcurementController::class, 'storePurchaseOrder'])->name('purchase-orders.store');
Route::patch('/purchase-orders/{id}/status', [ProcurementController::class, 'updatePurchaseOrderStatus'])->name('purchase-orders.status.update');
Route::patch('/purchase-orders/{id}/suppliers', [ProcurementController::class, 'updatePurchaseOrderSuppliers'])->name('purchase-orders.suppliers.update');
Route::patch('/purchase-orders/{id}', [ProcurementController::class, 'updatePurchaseOrder'])->name('purchase-orders.update');
Route::delete('/purchase-orders/{id}', [ProcurementController::class, 'deletePurchaseOrder'])->name('purchase-orders.destroy');
Route::get('/purchase-orders/{id}/preview', [ProcurementController::class, 'previewPurchaseOrder'])->name('purchase-orders.preview');
Route::get('/purchase-orders/{id}', [ProcurementController::class, 'showPurchaseOrder'])->name('purchase-orders.show');
Route::get('/purchase-orders/{id}/edit', [ProcurementController::class, 'editPurchaseOrder'])->name('purchase-orders.edit');

Route::get('/surat-jalan', [ProcurementController::class, 'suratJalan'])->name('surat-jalan.index');
Route::patch('/surat-jalan/{id}', [ProcurementController::class, 'updateSuratJalan'])->name('surat-jalan.update');
Route::get('/surat-jalan/{id}/preview', [ProcurementController::class, 'previewSuratJalan'])->name('surat-jalan.preview');
Route::get('/surat-jalan/{id}', [ProcurementController::class, 'showSuratJalan'])->name('surat-jalan.show');

Route::get('/invoices', [ProcurementController::class, 'invoices'])->name('invoices.index');
Route::get('/invoices/{id}/create', [ProcurementController::class, 'createInvoice'])->name('invoices.create');
Route::post('/invoices/{id}', [ProcurementController::class, 'storeInvoice'])->name('invoices.store');
Route::patch('/invoices/{id}/status', [ProcurementController::class, 'updateInvoiceStatus'])->name('invoices.status.update');
Route::get('/invoices/{id}/preview', [ProcurementController::class, 'previewInvoice'])->name('invoices.preview');
Route::get('/invoices/{id}', [ProcurementController::class, 'showInvoice'])->name('invoices.show');

Route::get('/master-stok', [ProcurementController::class, 'masterStock'])->name('master-stok.index');
Route::get('/master-stok/create', [ProcurementController::class, 'createStock'])->name('master-stok.create');
Route::post('/master-stok', [ProcurementController::class, 'storeStock'])->name('master-stok.store');
Route::get('/master-stok/{id}', [ProcurementController::class, 'showStock'])->name('master-stok.show');
Route::get('/master-stok/{id}/edit', [ProcurementController::class, 'editStock'])->name('master-stok.edit');
Route::patch('/master-stok/{id}', [ProcurementController::class, 'updateStock'])->name('master-stok.update');
Route::delete('/master-stok/{id}', [ProcurementController::class, 'deleteStock'])->name('master-stok.destroy');
