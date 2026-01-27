<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Storage;

class ImageController extends Controller
{
    private $storage;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));
        $this->storage = $factory->createStorage();
    }

    public function index()
    {
        return Image::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $urls = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $bucket = $this->storage->getBucket();
                $object = $bucket->upload(
                    file_get_contents($file->getRealPath()),
                    [
                        'name' => 'images/' . $fileName,
                    ]
                );

                $url = $object->signedUrl(new \DateTime('+10 years'));

                $image = Image::create(['url' => $url]);
                $urls[] = $image;
            }
        }

        return response()->json($urls, 201);
    }

    public function destroy(Image $image)
    {
        // Extraer el path del objeto de la URL
        $urlComponents = parse_url($image->url);
        $path = ltrim($urlComponents['path'], '/');
        // El path puede estar url-encoded
        $path = urldecode($path);
        // Quita el nombre del bucket del path si está presente
        $bucketName = $this->storage->getBucket()->name();
        $prefix = $bucketName . '/';
        if (strpos($path, $prefix) === 0) {
            $path = substr($path, strlen($prefix));
        }

        try {
            $object = $this->storage->getBucket()->object($path);
            if ($object->exists()) {
                $object->delete();
            }
        } catch (\Exception $e) {
            // Puedes loggear el error si quieres, pero no detengas la ejecución
            // si el archivo no se encuentra en Firebase, igual queremos borrarlo de la DB.
        }

        $image->delete();

        return response()->json(null, 204);
    }

    public function update(Request $request, Image $image)
    {
        $request->validate([
            'description' => 'nullable|string',
            'is_in_gallery' => 'boolean',
        ]);

        $image->update($request->only(['description', 'is_in_gallery']));

        return response()->json($image);
    }
}
