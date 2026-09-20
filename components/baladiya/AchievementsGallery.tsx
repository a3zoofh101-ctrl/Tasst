import Image from "next/image";
import { GalleryPhoto } from "@/lib/data/achievementsGallery";

export default function AchievementsGallery({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) return null;

  return (
    <section className="section-y">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
            لمحات من الميدان
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">معرض الإنجازات</h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:mt-14">
          {photos.map((photo) => (
            <figure
              key={photo.src}
              className="overflow-hidden rounded-2xl shadow-[0_16px_40px_-24px_rgba(6,60,40,0.4)]"
            >
              <div className="relative aspect-video">
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 600px, 100vw"
                />
              </div>
              <figcaption className="bg-white px-4 py-3 text-center text-sm text-emerald-950/70">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
