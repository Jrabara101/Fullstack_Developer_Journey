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
        Schema::create('timed_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('video_id');
            $table->uuid('user_id')->index();
            $table->uuid('parent_id')->nullable()->index();
            $table->integer('timestamp_ms')->default(0)->index(); // Indexed for timeline avatar pin queries
            $table->text('body');
            $table->integer('upvotes_count')->default(0);
            $table->boolean('is_creator_pinned')->default(false);
            $table->timestamps();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('timed_comments')->onDelete('cascade');
            $table->index(['video_id', 'timestamp_ms']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timed_comments');
    }
};
