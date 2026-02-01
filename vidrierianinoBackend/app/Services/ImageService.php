<?php

namespace App\Services;

use App\Models\Image;
use Illuminate\Support\Collection;

class ImageService
{
    private $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    public function getAll(): Collection
    {
        return Image::all();
    }

    public function uploadImages(array $files): Collection
    {
        $createdImages = collect();

        foreach ($files as $file) {
            $url = $this->firebaseService->upload($file, 'images');

            $image = Image::create(['url' => $url]);
            $createdImages->push($image);
        }

        return $createdImages;
    }

    public function updateImage(Image $image, array $data): Image
    {
        $image->update($data);
        return $image;
    }

    public function deleteImage(Image $image): void
    {
        // Delete from storage first
        $this->firebaseService->delete($image->url);

        // Then delete from DB
        $image->delete();
    }
}
