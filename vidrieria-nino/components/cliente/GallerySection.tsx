import Image from "next/image";

export default function GallerySection() {
  const images = [
    '/images/works/trabajo-vidrieria-nino-1.jpg',
    '/images/works/trabajo-vidrieria-nino-2.jpg',
    '/images/works/trabajo-vidrieria-nino-3.jpg',
    '/images/works/trabajo-vidrieria-nino-4.jpg',
    '/images/works/trabajo-vidrieria-nino-5.jpg',
    '/images/works/trabajo-vidrieria-nino-6.jpg',
    '/images/works/trabajo-vidrieria-nino-7.jpg',
    '/images/works/trabajo-vidrieria-nino-8.jpg',
    '/images/works/trabajo-vidrieria-nino-9.jpg',
    '/images/works/trabajo-vidrieria-nino-10.jpg',
    '/images/works/trabajo-vidrieria-nino-11.jpg',
    '/images/works/trabajo-vidrieria-nino-12.jpg',
    '/images/works/trabajo-vidrieria-nino-13.jpg',
    '/images/works/trabajo-vidrieria-nino-14.jpg',
    '/images/works/trabajo-vidrieria-nino-15.jpg',
    '/images/works/trabajo-vidrieria-nino-16.jpg',
  ];

  return (
    <section id="gallery" className="py-20 bg-base-100 dark:bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary dark:text-primary-content">Nuestros Trabajos</h2>
          <p className="mt-4 text-lg text-secondary dark:text-base-content">Un vistazo a la calidad y profesionalismo que nos caracteriza.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:scale-105 aspect-square">
              <Image 
                src={image} 
                alt={`Trabajo realizado ${index + 1}`} 
                width={400} 
                height={400} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
