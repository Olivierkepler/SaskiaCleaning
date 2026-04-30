export default function BentoGrid() {
    return (
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
          
          {/* Large Card */}
          <div className="md:col-span-8 group relative overflow-hidden bg-zinc-900 aspect-video md:aspect-auto">
            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="relative p-12 h-full flex flex-col justify-between">
              <h3 className="text-3xl font-serif text-white">Estate Management</h3>
              <p className="max-w-xs text-sm text-gray-300 font-light">Full-spectrum cleaning for properties exceeding 10,000 sq ft.</p>
            </div>
          </div>
  
          {/* Tall Card */}
          <div className="md:col-span-4 bg-amber-200 text-black p-12 flex flex-col justify-between min-h-[400px]">
            <h3 className="text-3xl font-serif italic">White Glove <br /> Hospitality</h3>
            <p className="text-sm font-medium">Beyond cleaning: we manage laundry, floral arrangements, and pantry curation.</p>
          </div>
  
          {/* Small Card */}
          <div className="md:col-span-4 border border-white/10 p-12 hover:bg-white/5 transition">
            <h4 className="uppercase tracking-widest text-[10px] mb-4 text-amber-200">Post-Renovation</h4>
            <p className="text-xl font-serif">Deep restoration following architectural builds.</p>
          </div>
  
          {/* Medium Card */}
          <div className="md:col-span-8 bg-zinc-900 p-12 flex items-center justify-between border border-white/10">
            <div className="text-5xl font-serif tracking-tighter">0.01%</div>
            <p className="max-w-xs text-right text-xs uppercase tracking-widest text-gray-500">The tolerance for dust in our "Molecular Clean" protocol.</p>
          </div>
  
        </div>
      </section>
    );
  }