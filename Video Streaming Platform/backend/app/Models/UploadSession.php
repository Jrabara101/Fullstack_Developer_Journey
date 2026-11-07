<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UploadSession extends Model
{
    use HasUuids;

    protected $table = 'upload_sessions';

    protected $fillable = [
        'creator_id',
        'video_id',
        'original_filename',
        'mime_type',
        'total_size_bytes',
        'chunk_size_bytes',
        'uploaded_chunks_bitmap',
        's3_upload_id',
        'temp_storage_path',
        'expires_at'
    ];

    protected $casts = [
        'total_size_bytes' => 'integer',
        'chunk_size_bytes' => 'integer',
        'uploaded_chunks_bitmap' => 'array',
        'expires_at' => 'datetime',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }

    public function getTotalExpectedChunks(): int
    {
        return (int) ceil($this->total_size_bytes / $this->chunk_size_bytes);
    }

    public function isComplete(): bool
    {
        $bitmap = $this->uploaded_chunks_bitmap ?? [];
        $total = $this->getTotalExpectedChunks();
        return count($bitmap) >= $total;
    }
}
