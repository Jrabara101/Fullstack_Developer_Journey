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
        Schema::create('video_renditions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('video_id');
            $table->enum('resolution_label', ['360p', '480p', '720p', '1080p', '1440p', '4k']);
            $table->integer('width');
            $table->integer('height');
            $table->integer('bitrate_kbps');
            $table->string('codec')->default('avc1.640028');
            $table->string('playlist_path');
            $table->bigInteger('file_size_bytes')->nullable();
            $table->enum('status', ['pending', 'processing', 'ready', 'failed'])->default('pending');
            $table->smallInteger('progress_percent')->default(0);
            $table->timestampTz('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
            $table->unique(['video_id', 'resolution_label']);
            $table->index(['video_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_renditions');
    }
};
