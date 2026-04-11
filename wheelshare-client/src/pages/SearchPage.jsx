import { useState, useEffect } from 'react';
import { SlidersHorizontal, Grid3X3, List, ArrowUpDown, Search, MapPin } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import SearchBar from '../components/search/SearchBar';
import FilterSidebar from '../components/search/FilterSidebar';
import VehicleCard from '../components/search/VehicleCard';
import { useVehicleSearch } from '../hooks/useVehicleSearch';
import { useLocation_ } from '../context/LocationContext';
import LocationModal from '../components/LocationModal';

// Default date = today, time = current time
function getDefaults() {
  const now  = new Date();
  const date = now.toISOString().split('T')[0];
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  const savedCity = localStorage.getItem('userCity') || '';
  return { date, time: `${hh}:${mm}`, city: savedCity };
}

const { date: TODAY, time: NOW, city: SAVED_CITY } = getDefaults();

const DEFAULT_FILTERS = {
  type: 'all', city: SAVED_CITY, date: TODAY, time: NOW,
  priceMin: 0, priceMax: 5000,
  minRating: 0,
  fuel: [], tags: [],
  availableOnly: false,
  availableNow: false,
  bookingType: 'all',
  duration: 0,
  sort: 'recommended',
};

export default function SearchPage() {
  const { location } = useLocation_();
  const [showLocModal, setShowLocModal] = useState(false);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    city: location?.city || SAVED_CITY,
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode,         setViewMode]         = useState('grid');

  // Sync global location → city filter
  useEffect(() => {
    if (location?.city) setFilters(f => ({ ...f, city: location.city }));
  }, [location?.city]);

  const { results, loading: searchLoading, usingApi } = useVehicleSearch(filters);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black text-gray-900">Find a Vehicle 🔍</h1>
              {/* Global location pill */}
              <button onClick={() => setShowLocModal(true)}
                className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 text-xs font-bold hover:bg-orange-100 transition-all">
                <MapPin size={13} className="text-orange-500" />
                {location ? `${location.city}${location.state ? `, ${location.state}` : ''}` : 'Select City'}
              </button>
            </div>
            <SearchBar filters={filters} setFilters={setFilters} onSearch={() => {}} />
          </div>
        </div>
        {showLocModal && <LocationModal onClose={() => setShowLocModal(false)} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6">
            {/* Filter sidebar */}
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              total={results.length}
              onReset={resetFilters}
              mobileOpen={mobileFilterOpen}
              setMobileOpen={setMobileFilterOpen}
            />

            {/* Results panel */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <span className="font-black text-gray-900">{results.length} vehicle{results.length !== 1 ? 's' : ''}</span>
                  <span className="text-gray-500 text-sm ml-1">
                    {filters.city
                      ? <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-orange-400" />{filters.city}</span>
                      : 'across India'}
                  </span>
                  {usingApi && (
                    <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">● Live</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile filter */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-300 transition-all"
                  >
                    <SlidersHorizontal size={15} /> Filters
                  </button>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2">
                    <ArrowUpDown size={14} className="text-gray-400" />
                    <select
                      value={filters.sort}
                      onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                      className="text-sm font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="distance">Nearest First</option>
                    </select>
                  </div>

                  {/* View toggle */}
                  <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Grid3X3 size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(filters.type !== 'all' || filters.city || filters.fuel.length > 0 || filters.tags.length > 0 || filters.minRating > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.type !== 'all' && (
                    <Chip label={filters.type === 'bike' ? '🏍️ Bikes' : '🚗 Cars'} onRemove={() => setFilters(f => ({ ...f, type: 'all' }))} />
                  )}
                  {filters.city && (
                    <Chip label={`📍 ${filters.city}`} onRemove={() => setFilters(f => ({ ...f, city: '' }))} />
                  )}
                  {filters.minRating > 0 && (
                    <Chip label={`⭐ ${filters.minRating}+`} onRemove={() => setFilters(f => ({ ...f, minRating: 0 }))} />
                  )}
                  {filters.fuel.map(f => (
                    <Chip key={f} label={f} onRemove={() => setFilters(prev => ({ ...prev, fuel: prev.fuel.filter(x => x !== f) }))} />
                  ))}
                  {filters.tags.map(t => (
                    <Chip key={t} label={t} onRemove={() => setFilters(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }))} />
                  ))}
                  <button onClick={resetFilters} className="text-xs text-orange-500 font-bold hover:underline px-1">
                    Clear all
                  </button>
                </div>
              )}

              {/* Results grid / list */}
              {results.length === 0 ? (
                <EmptyState filters={filters} onReset={resetFilters} />
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }>
                  {results.map(v => (
                    <VehicleCard key={v.id} vehicle={v} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-orange-900 leading-none">×</button>
    </span>
  );
}

function EmptyState({ filters, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-black text-gray-900 mb-2">No vehicles found</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        {filters.city
          ? `No vehicles available in ${filters.city}. Try a different city or clear filters.`
          : 'Try adjusting your filters.'}
      </p>
      <button onClick={onReset} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm flex items-center gap-2">
        <Search size={15} /> Reset Filters
      </button>
    </div>
  );
}
