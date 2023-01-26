<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\StatisticController;

Route::get('/', function () {
    return redirect('/admin/statistics');
});

Route::get('/statistics', [StatisticController::class, 'index']);
Route::post('/statistics/request', [StatisticController::class, 'index'])->name('statisticsRequest');

