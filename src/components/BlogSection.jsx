import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { mockBlogs } from '../api/mockBlogs';

// ── Skeleton Loader Card ────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="relative group overflow-visible mb-12 animate-pulse">
    <div className="aspect-[4/3] bg-gray-200 rounded-t-sm" />
    <div className="absolute left-0 bottom-0 transform translate-y-1/2 w-[85%] z-10">
      <div className="bg-white p-6 shadow-xl rounded-sm border-t-4 border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
    <div className="h-[90px]" />
  </div>
);

// ── Single Blog Card ────────────────────────────────────────────────────────
const BlogCard = ({ post, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.2 } },
  };

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative group overflow-visible mb-12">
      {/* Image */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={cardVariants}
        className="relative aspect-[4/3] overflow-hidden rounded-t-sm z-0"
      >
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        {post.isFeatured && (
          <span className="absolute top-3 left-3 bg-[#3ec1d3] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Featured
          </span>
        )}
      </motion.div>

      {/* Floating Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
        className="absolute left-0 bottom-0 transform translate-y-1/2 w-[85%] z-10"
      >
        <Link to={`/blog/${post.slug || post._id}`} className="block">
          <div className="bg-white p-6 shadow-xl rounded-sm border-t-4 border-[#3ec1d3] hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-2 text-[10px] text-gray-400 mb-3 uppercase font-bold tracking-[2px]">
              <span className="text-[#3ec1d3]">{post.category}</span>
              <span className="text-gray-300">|</span>
              <span>{formattedDate}</span>
              {post.readTimeMinutes && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{post.readTimeMinutes} min read</span>
                </>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#0c1c2b] leading-tight group-hover:text-[#3ec1d3] transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>
          </div>
        </Link>
      </motion.div>

      {/* Spacing */}
      <div className="h-[90px]" />
    </div>
  );
};

// ── Main BlogSection Component ───────────────────────────────────────────────
const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        setBlogs(mockBlogs.slice(0, 3));
      } catch (err) {
        console.error('BlogSection fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section className="bg-[#f8fbfb] py-24 pb-32">
      <div className="container mx-auto px-6 md:px-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h5 className="text-[#3ec1d3] font-bold tracking-[4px] uppercase text-xs mb-4">
            LATEST NEWS
          </h5>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0c1c2b] leading-tight">
            Our Insights &amp; Articles
          </h2>
        </motion.div>

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Could not load blog posts.</p>
            <p className="text-sm text-gray-400">Make sure the server is running at <code>localhost:5000</code></p>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : blogs.map((post, index) => (
                <BlogCard key={post._id} post={post} index={index} />
              ))}
        </div>

        {/* View All Button */}
        {!loading && !error && blogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-20"
          >
            <Link
              to="/blog"
              className="inline-block bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold px-10 py-4 rounded-md transition-all shadow-md hover:shadow-lg"
            >
              View All Articles →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
