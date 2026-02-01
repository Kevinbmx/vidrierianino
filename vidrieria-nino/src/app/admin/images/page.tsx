// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import axios from '@/lib/axios';
// import { Button, Card, CardBody, Image, Input, Switch, Textarea, CardFooter, CardHeader } from '@heroui/react';
// import { toast } from '@heroui/toast';
// import { debounce } from 'lodash';

// interface IImage {
//   id: number;
//   url: string;
//   description: string | null;
//   is_in_gallery: boolean;
// }

// const ImageManagerPage = () => {
//   const [images, setImages] = useState<IImage[]>([]);
//   const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const fetchImages = async () => {
//     try {
//       const { data } = await axios.get('/api/images');
//       setImages(data);
//     } catch (error) {
//       toast({ title: "Error", message: "No se pudieron cargar las imágenes.", type: "error" });
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchImages();
//   }, []);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedFiles(e.target.files);
//   };

//   const handleUpload = async () => {
//     if (!selectedFiles || selectedFiles.length === 0) {
//       toast({ title: "Atención", message: "Selecciona al menos una imagen para subir.", type: "warning" });
//       return;
//     }

//     const formData = new FormData();
//     Array.from(selectedFiles).forEach(file => {
//       formData.append('images[]', file);
//     });

//     setUploading(true);
//     try {
//       await axios.post('/api/images', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       toast({ title: "Éxito", message: "Imágenes subidas correctamente.", type: "success" });
//       fetchImages(); // Refresh list
//       const fileInput = document.getElementById('file-input') as HTMLInputElement;
//       if(fileInput) fileInput.value = "";
//       setSelectedFiles(null);
//     } catch (error) {
//       toast({ title: "Error de Subida", message: "No se pudieron subir las imágenes.", type: "error" });
//     }
//     setUploading(false);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.')) return;

//     try {
//       await axios.delete(`/api/images/${id}`);
//       setImages(images.filter(img => img.id !== id));
//       toast({ title: "Eliminada", message: "La imagen ha sido eliminada.", type: "success" });
//     } catch (error) {
//       toast({ title: "Error", message: "No se pudo eliminar la imagen.", type: "error" });
//     }
//   };

//   const debouncedUpdate = useCallback(
//     debounce(async (id: number, data: Partial<IImage>) => {
//       try {
//         await axios.put(`/api/images/${id}`, data);
//         toast({ title: "Actualizado", message: "Cambios guardados.", type: "default", duration: 2000 });
//       } catch (error) {
//         toast({ title: "Error", message: "No se pudo guardar el cambio.", type: "error" });
//       }
//     }, 500), // 500ms delay
//     []
//   );

//   const handleDescriptionChange = (id: number, description: string) => {
//     setImages(images.map(img => img.id === id ? { ...img, description } : img));
//     debouncedUpdate(id, { description });
//   };

//   const handleGalleryToggle = (id: number, is_in_gallery: boolean) => {
//     setImages(images.map(img => img.id === id ? { ...img, is_in_gallery } : img));
//     debouncedUpdate(id, { is_in_gallery });
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Gestión de Imágenes y Galería</h1>

//       <Card className="mb-8">
//         <CardHeader><h2 className="text-xl font-semibold">Subir Nuevas Imágenes</h2></CardHeader>
//         <CardBody>
//           <div className="flex items-center gap-4">
//             <Input id="file-input" type="file" multiple onChange={handleFileChange} className="flex-grow" />
//             <Button color="primary" onClick={handleUpload} isLoading={uploading}>Subir</Button>
//           </div>
//         </CardBody>
//       </Card>

//       <h2 className="text-2xl font-bold mb-4">Imágenes Subidas</h2>
//       {loading ? <p>Cargando imágenes...</p> : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {images.map(image => (
//             <Card key={image.id}>
//               <CardBody className="p-0">
//                 <Image src={image.url} alt={`Imagen ${image.id}`} width={400} height={300} className="object-cover w-full h-48" />
//                 <div className="p-4 space-y-4">
//                   <Textarea
//                     label="Descripción"
//                     placeholder="Añade una breve descripción..."
//                     value={image.description || ''}
//                     onChange={(e) => handleDescriptionChange(image.id, e.target.value)}
//                     minRows={2}
//                   />
//                   <Switch
//                     isSelected={image.is_in_gallery}
//                     onValueChange={(isSelected) => handleGalleryToggle(image.id, isSelected)}
//                   >
//                     Mostrar en Galería Principal
//                   </Switch>
//                 </div>
//               </CardBody>
//               <CardFooter>
//                 <Button size="sm" color="danger" variant="flat" onClick={() => handleDelete(image.id)}>
//                   Eliminar
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageManagerPage;
