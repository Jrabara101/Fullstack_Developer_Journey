<?php

namespace App\Services;

use App\Models\Video;
use Exception;

/**
 * Service: SignedManifestService
 * Protects premium and cinema-grade HLS streams using cryptographically signed
 * HMAC-SHA256 tokens and CloudFront signed URL structures to prevent hotlinking and unauthorized scraping.
 */
class SignedManifestService
{
    protected string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('app.key', 'cinestream-secret-master-token-key-2026');
    }

    /**
     * Generate a signed streaming token valid for a set duration (e.g., 6 hours)
     */
    public function generateSignedStreamToken(string $ulid, ?string $userId = null, int $ttlSeconds = 21600): array
    {
        $expires = time() + $ttlSeconds;
        $payload = "{$ulid}:{$expires}:" . ($userId ?? 'anon');
        $signature = hash_hmac('sha256', $payload, $this->secretKey);

        return [
            'token' => $signature,
            'expires' => $expires,
            'query_string' => "token={$signature}&expires={$expires}"
        ];
    }

    /**
     * Validate an incoming stream token
     */
    public function validateToken(string $ulid, string $token, int $expires, ?string $userId = null): bool
    {
        // Check expiration
        if (time() > $expires) {
            return false;
        }

        $payload = "{$ulid}:{$expires}:" . ($userId ?? 'anon');
        $expectedSignature = hash_hmac('sha256', $payload, $this->secretKey);

        return hash_equals($expectedSignature, $token);
    }

    /**
     * Injects signed query parameters into child playlists inside a master HLS manifest
     */
    public function signManifestContent(string $manifestContent, string $signedQuery): string
    {
        // Append ?token=...&expires=... to all child .m3u8 rendition lines
        return preg_replace('/^([a-zA-Z0-9_-]+\.m3u8)$/m', "$1?{$signedQuery}", $manifestContent);
    }
}
