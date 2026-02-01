<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImageRequest;
use App\Http\Requests\UpdateImageRequest;
use App\Http\Resources\ImageResource;
use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;

class ImageController extends Controller
{
    private $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        // Use Resource Collection
        return ImageResource::collection($this->imageService->getAll());
    }

    public function store(StoreImageRequest $request): JsonResponse
    {
        $images = $this->imageService->uploadImages($request->file('images'));

        return response()->json(ImageResource::collection($images), 201);
    }

    public function show(Image $image): ImageResource
    {
        return new ImageResource($image);
    }

    public function update(UpdateImageRequest $request, Image $image): JsonResponse
    {
        $updatedImage = $this->imageService->updateImage($image, $request->validated());

        return response()->json(new ImageResource($updatedImage));
    }

    public function destroy(Image $image): JsonResponse
    {
        $this->imageService->deleteImage($image);

        return response()->json(null, 204);
    }
}
