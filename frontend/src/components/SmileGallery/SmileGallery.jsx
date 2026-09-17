// frontend/src/components/SmileGallery/SmileGallery.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Smile Gallery Main Component (About Us → Smile Gallery)
// Dynamic category filtering, search, interactive sliders, and error states
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import SmileGalleryModal from './SmileGalleryModal';
import {
  fetchGalleryCases,
  fetchGalleryCategories,
  getImageUrl,
  likeCase,
  API_BASE_URL,
} from '../../services/galleryApi';

const SmileGallery = () => {
  // State
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  // 1. Fetch available categories on mount
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchGalleryCategories();
        if (isMounted && res.success) {
          setCategories([
            { name: 'All', count: res.totalPublished },
            ...res.categories,
          ]);
        }
      } catch (err) {
        console.warn('Could not load categories:', err.message);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch cases whenever activeCategory, sortOrder, or currentPage changes
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchGalleryCases({
        category: activeCategory,
        search: searchQuery,
        sort: sortOrder,
        page: currentPage,
        limit: 9,
      });

      if (res.success && res.data) {
        setCases(res.data.cases || []);
        setPagination(res.data.pagination || null);
      } else {
        throw new Error(res.message || 'Failed to retrieve cases.');
      }
    } catch (err) {
      console.error('[SmileGallery] Fetch error:', err);
      setError(
        err.message ||
          `Cannot reach the backend server at ${API_BASE_URL}. Please ensure the Node.js service is running.`
      );
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortOrder, currentPage]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Handle live like/upvote
  const handleLike = async (caseId, e) => {
    e.stopPropagation();
    try {
      const res = await likeCase(caseId);
      setCases((prevCases) =>
        prevCases.map((c) =>
          (c._id === caseId || c.caseId === caseId)
            ? { ...c, metrics: { ...c.metrics, likes: res.likes } }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to like case:', err);
    }
  };

  const handleModalLikeUpdated = (caseId, newLikes) => {
    setCases((prevCases) =>
      prevCases.map((c) =>
        (c._id === caseId || c.caseId === caseId)
          ? { ...c, metrics: { ...c.metrics, likes: newLikes } }
          : c
      )
    );
  };

  return (
    <section
      id="smile-gallery"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 font-sans"
    >
      {/* ── Section Header ── */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-block px-3.5 py-1 text-xs font-bold tracking-wider text-teal-700 uppercase bg-teal-50 border border-teal-200 rounded-full mb-3">
          About Us • Verified Transformations
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Smile Gallery & Real Patient Cases
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Explore authentic, unedited before-and-after transformations treated by our dental specialists.
          All clinical photography is protected, watermarked, and HIPAA-anonymized.
        </p>
      </div>

      {/* ── Controls: Search, Sort & Categories ── */}
      <div className="space-y-6 mb-10">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search treatments (e.g., Veneers, Implants, Shade BL1)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Sort By:
            </label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
            >
              <option value="newest">Newest Transformations</option>
              <option value="popular">Most Popular</option>
              <option value="featured">Featured First</option>
              <option value="oldest">Earliest Cases</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {(categories.length > 0
            ? categories
            : [
                { name: 'All' },
                { name: 'Teeth Whitening' },
                { name: 'Dental Implants' },
                { name: 'Braces' },
                { name: 'Veneers' },
                { name: 'Smile Makeover' },
              ]
          ).map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-teal-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-teal-800/40 text-teal-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area: Loading / Error / Grid / Empty ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          {/* Animated Dental Tooth Spinner */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 border border-teal-200 animate-pulse">
            <span className="text-3xl animate-bounce">🦷</span>
          </div>
          <p className="text-sm font-semibold text-slate-600 tracking-wide">
            Loading smile transformations from server...
          </p>
        </div>
      ) : error ? (
        /* Error Alert Banner */
        <div className="max-w-2xl mx-auto p-6 bg-red-50/80 border border-red-200 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 text-2xl">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-red-900">
            Cannot reach the dental backend server
          </h3>
          <p className="text-sm text-red-700 leading-relaxed">
            {error}
          </p>
          <div className="text-xs text-red-600 font-mono bg-white/70 p-2 rounded-lg border border-red-100">
            Endpoint: GET {API_BASE_URL}/api/gallery
          </div>
          <button
            onClick={loadCases}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/20"
          >
            Retry Connection
          </button>
        </div>
      ) : cases.length === 0 ? (
        /* Empty Results */
        <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-md mx-auto">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-bold text-slate-800">No Transformations Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No published cases found matching "{activeCategory}" or query "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Grid of Transformation Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((item) => {
            const beforeUrl = getImageUrl(item.images?.before?.display || item.images?.before?.thumbnail);
            const afterUrl = getImageUrl(item.images?.after?.display || item.images?.after?.thumbnail);

            return (
              <div
                key={item._id || item.caseId}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header Info */}
                <div className="p-4 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {item.caseId}
                  </span>
                </div>

                {/* Interactive Slider Area */}
                <div className="p-3 bg-slate-900/5">
                  <BeforeAfterSlider
                    beforeSrc={beforeUrl}
                    afterSrc={afterUrl}
                    beforeAlt={`${item.title} - Before`}
                    afterAlt={`${item.title} - After`}
                  />
                  <div className="text-center mt-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      ↔ Drag slider horizontally to compare
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Doctor: <span className="font-semibold text-slate-700">{item.doctorName}</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights Bar */}
                  {item.treatmentDetails && (
                    <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg text-slate-600 font-medium">
                      <span>⏱️ {item.treatmentDetails.duration || '2-3 visits'}</span>
                      {item.treatmentDetails.finalShade && (
                        <span className="text-teal-600 font-bold">
                          ✨ Shade: {item.treatmentDetails.finalShade}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={(e) => handleLike(item._id || item.caseId, e)}
                      className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 transition-colors px-2 py-1 rounded-md hover:bg-rose-50"
                      title="Like transformation"
                    >
                      <span className="text-base">❤️</span>
                      <span className="font-semibold">{item.metrics?.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCase(item)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1 group-hover:translate-x-0.5 duration-200"
                    >
                      <span>View Full Details</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-700"
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 px-3">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-700"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {selectedCase && (
        <SmileGalleryModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onLikeUpdated={handleModalLikeUpdated}
        />
      )}
    </section>
  );
};

export default SmileGallery;
