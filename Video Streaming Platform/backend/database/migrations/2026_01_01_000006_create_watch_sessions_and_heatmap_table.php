<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Cross-Device Watch Sessions ("Pick up where you left off" & Smart Context Rewind)
        Schema::create('watch_sessions', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('video_id');
            $table->integer('last_position_ms')->default(0);
            $table->integer('max_position_ms')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestampTz('updated_at');

            $table->primary(['user_id', 'video_id']);
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });

        // 2. Video Heatmap Buckets (100 discrete duration slices for "Most Replayed" curve)
        Schema::create('video_heatmap_buckets', function (Blueprint $table) {
            $table->uuid('video_id');
            $table->smallInteger('bucket_index'); // 0 to 99 representing 1% duration slices
            $table->float('watch_intensity_score')->default(0.0);

            $table->primary(['video_id', 'bucket_index']);
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_heatmap_buckets');
        Schema::dropIfExists('watch_sessions');
    }
};
