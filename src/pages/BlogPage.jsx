import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { mockBlogs } from '../api/mockBlogs';

const CATEGORIES = [
  'All',
  'Oral Hygiene',
  'Cosmetic Dentistry',
  'Orthodontics',
  'Pediatric Dentistry',
  'Implants',
  'Root Canal',
  'Teeth Whitening',
  'Gum Disease',
  'Dental Technology',
  'Patient Tips',
  'General',
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-5 bg-gray-200 rounded w-full" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-4" />
    </div>
  </div>
);

// ─── Blog Card ────────────────────────────────────────────────────────────────
const BlogCard = ({ post, index }) => {
  const formattedDate = new Date(
    post.publishedAt || post.createdAt
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col group"
    >
      <Link to={`/blog/${post.slug || post._id}`} className="block overflow-hidden relative">
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop'}
          alt={post.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop';
          }}
        />
        {post.isFeatured && (
          <span className="absolute top-3 left-3 bg-[#3ec1d3] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Featured
          </span>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 uppercase font-bold tracking-widest mb-3 flex-wrap">
          <span className="text-[#3ec1d3]">{post.category}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          {post.readTimeMinutes && (
            <>
              <span>·</span>
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>

        <Link to={`/blog/${post.slug || post._id}`}>
          <h3 className="text-lg font-bold text-[#0c1c2b] leading-snug group-hover:text-[#3ec1d3] transition-colors duration-200 mb-3 line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3ec1d3]/20 flex items-center justify-center text-[#3ec1d3] font-bold text-sm">
              {(post.authorName || 'D').charAt(0)}
            </div>
            <span className="text-xs text-gray-500 font-medium">{post.authorName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>👁 {post.views || 0}</span>
            <span>❤ {post.likes || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main BlogPage ────────────────────────────────────────────────────────────
const BlogPage = () => {
  // Core data state
  const [blogs, setBlogs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state — single source of truth, no URL sync complications
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput]       = useState('');
  const [appliedSearch, setAppliedSearch]   = useState('');

  const LIMIT = 9;
  const abortRef = useRef(null);

  // ── Fetch whenever filters/page change ─────────────────────────────────────
  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      setBlogs([]);
      setTotal(0);

      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filteredBlogs = mockBlogs;
        
        if (activeCategory && activeCategory !== 'All') {
          filteredBlogs = filteredBlogs.filter(b => b.category === activeCategory);
        }
        
        if (appliedSearch.trim()) {
          const query = appliedSearch.trim().toLowerCase();
          filteredBlogs = filteredBlogs.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.excerpt.toLowerCase().includes(query)
          );
        }
        
        const totalCount = filteredBlogs.length;
        const totalPagesCount = Math.ceil(totalCount / LIMIT) || 1;
        
        const start = (page - 1) * LIMIT;
        const paginatedBlogs = filteredBlogs.slice(start, start + LIMIT);

        setBlogs(paginatedBlogs);
        setTotal(totalCount);
        setTotalPages(totalPagesCount);
      } catch (err) {
        if (err.name === 'AbortError') return; // ignore cancelled requests
        console.error('[BlogPage] fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();

    return () => controller.abort();
  }, [page, activeCategory, appliedSearch]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCategoryClick = (cat) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    setPage(1);
    // Don't reset search when switching categories
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearAll = () => {
    setActiveCategory('All');
    setAppliedSearch('');
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilter = activeCategory !== 'All' || appliedSearch !== '';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fbfb]">
      <Navbar />

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0c1c2b] text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-[#3ec1d3] font-bold tracking-[4px] uppercase text-xs mb-4"
          >
            OUR INSIGHTS
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight"
          >
            Dental Health <span className="text-[#3ec1d3]">Blog</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8"
          >
            Expert tips, treatment guides, and oral health insights from our specialist team.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26 }}
            className="flex max-w-lg mx-auto shadow-xl rounded-xl overflow-hidden"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles, topics, treatments..."
              className="flex-1 px-5 py-4 bg-white text-[#0c1c2b] text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold px-7 py-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* ── Category Filter Strip ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-[80px] md:top-[90px] z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`
                  whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold
                  transition-all duration-200 cursor-pointer border
                  ${activeCategory === cat
                    ? 'bg-[#3ec1d3] text-white border-[#3ec1d3] shadow-md scale-105'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-[#3ec1d3]/10 hover:text-[#3ec1d3] hover:border-[#3ec1d3]/30'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results Area ──────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-6">
        <div className="container mx-auto">

          {/* Status bar */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <p className="text-gray-500 text-sm">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-[#3ec1d3] border-t-transparent rounded-full animate-spin" />
                  Loading articles...
                </span>
              ) : error ? (
                <span className="text-red-400">Failed to load articles</span>
              ) : (
                <>
                  <span className="font-bold text-[#0c1c2b]">{total}</span>
                  {' '}article{total !== 1 ? 's' : ''} found
                  {appliedSearch && (
                    <span> for <span className="text-[#3ec1d3] font-semibold">"{appliedSearch}"</span></span>
                  )}
                  {activeCategory !== 'All' && (
                    <span> in <span className="text-[#3ec1d3] font-semibold">{activeCategory}</span></span>
                  )}
                </>
              )}
            </p>

            {hasActiveFilter && !loading && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-600 font-semibold cursor-pointer transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>

          {/* ── Error State ─────────────────────────────────────────────────── */}
          {error && !loading && (
            <div className="text-center py-24 text-gray-400">
              <div className="text-7xl mb-5">🦷</div>
              <p className="text-xl font-bold text-gray-600 mb-2">Could not load articles</p>
              <p className="text-sm text-gray-400 mb-6">
                Make sure the backend server is running at{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-[#3ec1d3] font-mono">
                  localhost:5000
                </code>
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setPage((p) => p); // re-trigger effect by forcing re-render
                  setActiveCategory((c) => c);
                }}
                className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold px-8 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Content Grid ────────────────────────────────────────────────── */}
          {!error && (
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : blogs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-24 text-gray-400"
                >
                  <div className="text-7xl mb-5">📭</div>
                  <p className="text-xl font-bold text-gray-600 mb-2">No articles found</p>
                  <p className="text-sm mb-6">
                    {activeCategory !== 'All'
                      ? `No articles in "${activeCategory}" yet.`
                      : 'Try a different search term.'}
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="bg-[#3ec1d3] text-white font-bold px-7 py-3 rounded-xl hover:bg-[#34adb9] transition-colors cursor-pointer"
                  >
                    Show All Articles
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${activeCategory}-${appliedSearch}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {blogs.map((post, i) => (
                    <BlogCard key={post._id} post={post} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-14">
              <button
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#3ec1d3] hover:text-[#3ec1d3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    p === page
                      ? 'bg-[#3ec1d3] text-white shadow-md scale-105'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#3ec1d3] hover:text-[#3ec1d3]'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === totalPages}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#3ec1d3] hover:text-[#3ec1d3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
