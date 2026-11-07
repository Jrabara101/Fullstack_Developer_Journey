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
        Schema::create('upload_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('creator_id')->index();
            $table->uuid('video_id')->nullable();
            $table->string('original_filename');
            $table->string('mime_type');
            $table->bigInteger('total_size_bytes');
            $table->integer('chunk_size_bytes')->default(5242880); // 5MB standard chunk
            $table->json('uploaded_chunks_bitmap')->nullable(); // Set of completed chunk indices
            $table->string('s3_upload_id')->nullable(); // AWS S3 multipart upload ID
            $table->string('temp_storage_path')->nullable();
            $table->timestampTz('expires_at');
            $table->timestamps();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_sessions');
    }
};
