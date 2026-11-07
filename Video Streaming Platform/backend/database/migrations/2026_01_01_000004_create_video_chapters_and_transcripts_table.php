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
        // 1. Video Chapters
        Schema::create('video_chapters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('video_id');
            $table->string('title');
            $table->integer('start_ms')->index();
            $table->integer('end_ms');
            $table->string('thumbnail_xywh')->nullable(); // Sprite coordinates e.g. 0,0,160,90
            $table->timestamps();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });

        // 2. Transcript Segments (Full-text dialogue search)
        Schema::create('transcript_segments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('video_id');
            $table->char('language_code', 2)->default('en');
            $table->integer('start_ms')->index();
            $table->integer('end_ms');
            $table->string('speaker_label')->nullable();
            $table->text('text_content');
            $table->json('words_payload')->nullable(); // Detailed word-by-word timestamps
            $table->timestamps();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
            $table->index(['video_id', 'language_code', 'start_ms']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transcript_segments');
        Schema::dropIfExists('video_chapters');
    }
};
