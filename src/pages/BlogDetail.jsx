import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { mockBlogs } from '../api/mockBlogs';

// ── Skeleton ─────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[420px] bg-gray-200 w-full" />
    <div className="container mx-auto px-6 md:px-16 py-12 max-w-4xl space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-10 bg-gray-200 rounded w-full" />
      <div className="h-10 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-6" />
      {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-full" />)}
    </div>
  </div>
);

// ── Related Post Card ─────────────────────────────────────────────────────────
const RelatedCard = ({ post }) => (
  <Link to={`/blog/${post.slug || post._id}`} className="group flex gap-4 items-start p-3 rounded-xl hover:bg-[#f0f9fa] transition-colors">
    <img
      src={post.coverImage || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=200&auto=format&fit=crop'}
      alt={post.title}
      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=200&auto=format&fit=crop'; }}
    />
    <div>
      <span className="text-[10px] text-[#3ec1d3] font-bold uppercase tracking-wider">{post.category}</span>
      <h4 className="text-sm font-bold text-[#0c1c2b] group-hover:text-[#3ec1d3] transition-colors leading-snug line-clamp-2 mt-1">
        {post.title}
      </h4>
      <span className="text-xs text-gray-400 mt-1 block">{post.readTimeMinutes} min read</span>
    </div>
  </Link>
);

// ── Main BlogDetail Component ──────────────────────────────────────────────────
const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const found = mockBlogs.find(b => b.slug === slug || b._id === slug);
        if (!found) {
          navigate('/blog');
          return;
        }
        setBlog(found);
        setLikeCount(found.likes || 0);

        // Mock related posts
        const relatedPosts = mockBlogs
          .filter(p => p.category === found.category && p._id !== found._id)
          .slice(0, 3);
        setRelated(relatedPosts);
      } catch (err) {
        console.error('BlogDetail error:', err);
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBlog();
  }, [slug, navigate]);

  const handleLike = async () => {
    if (liked || !blog) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLikeCount(prev => prev + 1);
      setLiked(true);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <DetailSkeleton />
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center py-20">
          <div>
            <div className="text-6xl mb-4">🦷</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Article not found</h2>
            <Link to="/blog" className="text-[#3ec1d3] font-bold hover:underline">← Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden bg-[#0c1c2b]">
        <img
          src={blog.coverImage || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop'}
          alt={blog.title}
          className="w-full h-full object-cover opacity-60"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop'; }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block bg-[#3ec1d3] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              {blog.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
              <span>✍️ {blog.authorName}</span>
              <span>·</span>
              <span>📅 {formattedDate}</span>
              <span>·</span>
              <span>⏱ {blog.readTimeMinutes} min read</span>
              <span>·</span>
              <span>👁 {blog.views} views</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#f8fbfb] border-b border-gray-100 py-3 px-6">
        <div className="container mx-auto max-w-6xl text-sm text-gray-500">
          <Link to="/" className="hover:text-[#3ec1d3] transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-[#3ec1d3] transition-colors">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-[#3ec1d3] font-semibold line-clamp-1">{blog.title}</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto max-w-6xl px-6 md:px-10 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-[#3ec1d3] pl-5 italic">
                {blog.excerpt}
              </p>
            )}

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map(tag => (
                  <span key={tag} className="bg-[#3ec1d3]/10 text-[#3ec1d3] text-xs font-bold px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Blog Body */}
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                prose-headings:text-[#0c1c2b] prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:mb-5 prose-li:mb-2
                prose-strong:text-[#0c1c2b]
                prose-a:text-[#3ec1d3] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Like Button */}
            <div className="mt-12 flex items-center gap-4 py-6 border-t border-gray-100">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  liked
                    ? 'bg-red-50 text-red-400 border border-red-200 cursor-default'
                    : 'bg-[#3ec1d3]/10 text-[#3ec1d3] border border-[#3ec1d3]/20 hover:bg-[#3ec1d3] hover:text-white'
                }`}
              >
                {liked ? '❤️' : '🤍'} {likeCount} {liked ? 'Liked!' : 'Like this article'}
              </button>
              <Link
                to="/blog"
                className="text-sm text-gray-500 hover:text-[#3ec1d3] font-semibold transition-colors"
              >
                ← Back to all articles
              </Link>
            </div>

            {/* Author Box */}
            <div className="mt-8 bg-[#f8fbfb] rounded-2xl p-6 flex items-start gap-5 border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[#3ec1d3] flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                {blog.authorName?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Written by</p>
                <h4 className="text-lg font-bold text-[#0c1c2b]">{blog.authorName}</h4>
                <p className="text-sm text-gray-500">{blog.authorRole}</p>
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 space-y-8">

            {/* Meta */}
            <div className="bg-[#f8fbfb] rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-[#0c1c2b] uppercase tracking-wider mb-4">Article Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Category</dt>
                  <dd className="font-bold text-[#3ec1d3]">{blog.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Published</dt>
                  <dd className="font-semibold text-gray-600">{formattedDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Read Time</dt>
                  <dd className="font-semibold text-gray-600">{blog.readTimeMinutes} minutes</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Views</dt>
                  <dd className="font-semibold text-gray-600">{blog.views?.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-[#0c1c2b] uppercase tracking-wider mb-4">Related Articles</h3>
                <div className="space-y-2">
                  {related.map(post => <RelatedCard key={post._id} post={post} />)}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[#0c1c2b] rounded-2xl p-6 text-white text-center">
              <div className="text-4xl mb-3">🦷</div>
              <h3 className="font-bold text-lg mb-2">Need a Consultation?</h3>
              <p className="text-gray-400 text-sm mb-4">Our specialists are ready to help you.</p>
              <Link
                to="/book"
                className="block bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                Book Appointment
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;
