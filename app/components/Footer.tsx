export default function Footer() {
    return (
      <footer className="bg-[#f4f4f2] pt-32 pb-12 px-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-20 mb-32">
            <div className="max-w-sm">
              <h3 className="text-2xl font-serif mb-6 italic text-zinc-800">Saskia Cleaning</h3>
              <p className="text-zinc-500 font-light leading-relaxed">
                Serving the world’s most discerning homeowners with a commitment to environmental purity and absolute discretion.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-900">Contact</span>
                <a href="#" className="text-zinc-500 text-sm hover:text-black">hello@Saskia.com</a>
                <a href="#" className="text-zinc-500 text-sm hover:text-black">+1 (212) 555-0198</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-900">Connect</span>
                <a href="#" className="text-zinc-500 text-sm hover:text-black">Instagram</a>
                <a href="#" className="text-zinc-500 text-sm hover:text-black">LinkedIn</a>
              </div>
            </div>
          </div>
  
          <div className="pt-12 border-t border-zinc-300/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">© 2026 Saskia GROUP INC.</p>
            <div className="flex gap-12">
               <span className="text-[10px] uppercase tracking-widest text-zinc-400">London</span>
               <span className="text-[10px] uppercase tracking-widest text-zinc-400">New York</span>
               <span className="text-[10px] uppercase tracking-widest text-zinc-400">Zurich</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }