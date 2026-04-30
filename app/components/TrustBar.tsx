export function TrustBar() {
    return (
      <div className="py-20 border-y border-stone-200/60 mt-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold w-full lg:w-auto mb-4 lg:mb-0">
            Featured Excellence
          </h4>
          {['Architectural Digest', 'Town & Country', 'The Cut', 'Vogue Living'].map((brand) => (
            <span key={brand} className="font-serif italic text-xl text-stone-300 hover:text-stone-500 transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </div>
      </div>
    );
  }