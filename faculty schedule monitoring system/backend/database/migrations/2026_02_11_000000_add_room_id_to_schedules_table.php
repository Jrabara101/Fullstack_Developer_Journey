<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('room_id')->nullable()->after('room')->constrained('rooms')->nullOnDelete();
        });

        // Best-effort backfill: link existing free-text room values to rooms by name.
        // Rows that don't match any room name keep room_id = null and retain the
        // original `room` text so nothing is lost.
        $rooms = DB::table('rooms')->select('id', 'name')->get();

        foreach ($rooms as $room) {
            DB::table('schedules')
                ->whereRaw('LOWER(TRIM(room)) = ?', [strtolower(trim($room->name))])
                ->update(['room_id' => $room->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('room_id');
        });
    }
};
