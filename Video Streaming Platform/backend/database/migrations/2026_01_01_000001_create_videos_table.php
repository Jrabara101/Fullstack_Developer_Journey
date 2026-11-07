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
        Schema::create('videos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('ulid', 26)->unique(); // Public watch slug
            $table->uuid('creator_id')->index();
            $table->uuid('channel_id')->index();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('visibility', ['public', 'unlisted', 'members_only', 'draft'])->default('draft');
            $table->enum('status', [
                'uploading',
                'queued',
                'transcoding_fast_proxy',
                'playable_hd_pending',
                'ready_all_renditions',
                'failed'
            ])->default('uploading')->index();
            $table->decimal('duration_seconds', 10, 3)->nullable();
            $table->string('aspect_ratio')->default('16:9');
            $table->string('master_playlist_path')->nullable();
            $table->string('storyboard_vtt_path')->nullable();
            $table->string('poster_url')->nullable();
            $table->string('motion_preview_url')->nullable();
            $table->string('audio_only_m4a_path')->nullable();
            $table->enum('max_resolution', ['720p', '1080p', '4k'])->default('1080p');
            $table->bigInteger('views_count')->default(0);
            $table->timestampTz('published_at')->nullable();
            $table->timestamps();

            $table->index(['visibility', 'status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
