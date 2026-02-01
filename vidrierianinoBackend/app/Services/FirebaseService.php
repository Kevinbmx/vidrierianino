<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Storage;
use Illuminate\Http\UploadedFile;

class FirebaseService
{
    private $storage;
    private $bucket;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));
        $this->storage = $factory->createStorage();
        $this->bucket = $this->storage->getBucket();
    }

    public function upload(UploadedFile $file, string $folder = 'images'): string
    {
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $folder . '/' . $fileName;

        $object = $this->bucket->upload(
            file_get_contents($file->getRealPath()),
            [
                'name' => $filePath,
            ]
        );

        // Generate signed URL valid for 10 years
        return $object->signedUrl(new \DateTime('+10 years'));
    }

    public function delete(string $url): void
    {
        try {
            // Extract path from URL
            $urlComponents = parse_url($url);
            $path = ltrim($urlComponents['path'], '/');
            $path = urldecode($path);

            // Remove bucket name if present in path
            $bucketName = $this->bucket->name();
            $prefix = $bucketName . '/';
            if (strpos($path, $prefix) === 0) {
                $path = substr($path, strlen($prefix));
            }

            $object = $this->bucket->object($path);
            if ($object->exists()) {
                $object->delete();
            }
        } catch (\Exception $e) {
            // Log error but allow flow to continue (e.g. if file already missing)
            report($e);
        }
    }
}
