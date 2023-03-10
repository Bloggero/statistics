<?php

namespace App\Http\Controllers\Admin;


use Carbon\Carbon;
use App\Models\Setting;
use App\Models\Statistic;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class StatisticController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {

        $updateInstaller = Setting::find(1);
        if($updateInstaller['value'] == 'false'){
            $updateInstaller->value = 'true';
            $updateInstaller->save();
        }
        
        if(isset($request->type)){
            switch ($request->type) {
                case 'post':
                    $request = StatisticController::store($request);
                break;
                case 'put':
                    $request = StatisticController::update($request);
                    $request = response()->json(['success' => $request]);
                break;
                case 'get':
                    /**
                     * Get $fullDate for example 01-23
                     * next $response get data for $fullDate variable
                     * next $lastItems received data from getLastItems and now this create two variables for $lastRevenue and $lastExpenses
                     * next all this is send for response
                     */
                    $fullDate   = $request->month . '-' . $request->year;

                    $response = Statistic::where('info_date', $fullDate)->get();

                    $lastItems = StatisticController::getLastItems($fullDate);
                    $lastRevenue   = $lastItems->sum('pop_ads') + $lastItems->sum('other_ads');
                    $lastExpenses    = $lastItems->sum('links') + $lastItems->sum('referals');

                    $request = response()->json(['success' => true, 'items' => $response, 'lastItems' => ['lastRevenue' => $lastRevenue, 'lastExpenses' => $lastExpenses]]);

                    break;
                default:
                    $request = response()->json(['success' => false]);
                break;
            }
            return $request;

        }else{
            /**
             * $firstYear gets the first date from the table, if this table doesn't have any dates the $firstDate will the actual year
             */

            $firstYear  = Statistic::select('info_date')->first();
            if($firstYear == null){
                $firstYear = Carbon::now()->format('Y');
            }else{
                $firstYear = intval(substr(strval($firstYear->info_date), 3, 4));
            }

            $lastYear   = Carbon::now()->format('Y');

            $thisMontItems = Statistic::where('info_date', Carbon::now()->format('m-Y'))->orderBy('id', 'desc')->get();
            $revenue = $thisMontItems->sum('pop_ads') + $thisMontItems->sum('other_ads');
            $expenses    = $thisMontItems->sum('links') + $thisMontItems->sum('referals');


            $lastItems = StatisticController::getLastItems(Carbon::now()->format('m-Y'));
            $lastRevenue   = $lastItems->sum('pop_ads') + $lastItems->sum('other_ads');
            $lastExpenses    = $lastItems->sum('links') + $lastItems->sum('referals');

            return view('admin.statistics', [
                'items' => $thisMontItems,
                'firstYear' => $firstYear,
                'lastYear' => $lastYear,
                'revenue' => $revenue,
                'expenses' => $expenses,
                'lastRevenue' => $lastRevenue,
                'lastExpenses' => $lastExpenses,
            ]);

        }

    }


    static public function getLastItems($value){

                    /**
                     * To get the last month date, we need to substract the date 1 day
                     * and next execute a query with the $lastDate variable
                     */
                    $lastDate  = date('01-'.$value);
                    $lastDate  = date('m-Y', strtotime($lastDate.'- 1 days'));
                    
                    $response = Statistic::where('info_date', $lastDate)->get();
                    return $response;

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $response = new Statistic();
        $response->info_date = $request['info_date'];
        $response->links = $request['links'];
        $response->referals = $request['referals'];
        $response->pop_ads = $request['pop_ads'];
        $response->other_ads = $request['other_ads'];

        $response->save();

        return response()->json(['success' => $request, 'id' => $response->id, ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {

        $response = Statistic::find($request->id);
        $response->links = $request->links;
        $response->referals = $request->referals;
        $response->pop_ads = $request->pop_ads;
        $response->other_ads = $request->other_ads;

        return $response->save();

    }
}
