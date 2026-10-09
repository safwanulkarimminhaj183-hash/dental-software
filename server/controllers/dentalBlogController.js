import mongoose from 'mongoose';
import DentalBlog, { BLOG_CATEGORIES, resolveBlogCategory } from '../models/DentalBlog.js';
import { getCache, setCache, deleteCachePattern } from '../utils/redisClient.js';

function mapArticleAliases(body = {}) {
  const payload = { ...body };
  if (payload.image && !payload.coverImage) payload.coverImage = payload.image;
  if (payload.author && !payload.authorName) payload.authorName = payload.author;
  if (payload.category) {
    const canonical = resolveBlogCategory(payload.category);
    if (canonical) payload.category = canonical;
  }
  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all published articles (public) or with category filter (req.query)
// @route   GET /api/blogs or GET /api/dental-blogs
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllBlogs = async (req, res) => {
  try {
    const {
      status,
      category,
      authorId,
      isFeatured,
      search,
      tag,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;

    // ─── 1. Redis Caching Check ─────────────────────────────────────────────
    const rawCategory = category ? String(category).trim() : 'All';
    const cacheKey = `blogs:cat=${rawCategory}:page=${pageNum}:limit=${limitNum}:status=${status || 'published'}:search=${search || ''}:tag=${tag || ''}`;

    const cachedPayload = await getCache(cacheKey);
    if (cachedPayload) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({
        ...cachedPayload,
        source: 'redis_cache',
      });
    }

    // ─── 2. Dynamic Query Construction ─────────────────────────────────────
    const filter = {};

    // Filter by status (default: published for public API)
    if (status) {
      filter.status = status.toLowerCase();
    } else {
      filter.status = 'published';
    }

    // Category Filtering: "All" or empty -> fetch all; specific category -> find({ category: req.query.category })
    const resolvedCategory = resolveBlogCategory(category);
    if (resolvedCategory) {
      filter.category = resolvedCategory;
    }

    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
      filter.authorId = authorId;
    }
    if (tag) filter.tags = { $elemMatch: { $regex: tag, $options: 'i' } };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    // ─── 3. Pagination & Sorting ────────────────────────────────────────────
    const skip = (pageNum - 1) * limitNum;
    const [blogs, total] = await Promise.all([
      DentalBlog.find(filter)
        .select('-content') // exclude full body content from category list view
        .sort({ createdAt: -1 }) // Sort latest blog posts first
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DentalBlog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    const responsePayload = {
      success: true,
      count: blogs.length,
      total,
      page: pageNum,
      pages: totalPages,
      data: blogs,
    };

    // ─── 4. Save to Redis Cache (TTL: 1 Hour) ────────────────────────────────
    await setCache(cacheKey, responsePayload, 3600);

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({
      ...responsePayload,
      source: 'database',
    });
  } catch (error) {
    console.error('getAllBlogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single article by ID or slug (increments view count)
// @route   GET /api/blogs/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const blog = isObjectId
      ? await DentalBlog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      : await DentalBlog.findOneAndUpdate({ slug: id }, { $inc: { views: 1 } }, { new: true });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new blog article (CMS) & invalidate Redis cache
// @route   POST /api/blogs
// @access  Protected (admin / doctor)
// ─────────────────────────────────────────────────────────────────────────────
export const createBlog = async (req, res) => {
  try {
    const payload = mapArticleAliases(req.body);
    const { title, content, authorName } = payload;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Blog content is required.' });
    }
    if (!authorName || !authorName.trim()) {
      return res.status(400).json({ success: false, message: 'Author name is required.' });
    }

    const blog = await DentalBlog.create(payload);

    // Invalidate blog category Redis caches
    await deleteCachePattern('blogs:*');

    return res.status(201).json({
      success: true,
      message: 'Article created successfully.',
      data: blog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An article with this title/slug already exists.',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update article (CMS edit) & invalidate Redis cache
// @route   PUT /api/blogs/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid article ID.' });
    }

    const existing = await DentalBlog.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    Object.assign(existing, mapArticleAliases(req.body));
    await existing.save();

    // Invalidate blog category Redis caches
    await deleteCachePattern('blogs:*');

    return res.status(200).json({
      success: true,
      message: 'Article updated successfully.',
      data: existing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Publish / unpublish / archive an article & invalidate Redis cache
// @route   PATCH /api/blogs/:id/status
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid article ID.' });
    }

    const { status } = req.body;
    const validStatuses = ['draft', 'published', 'archived'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const blog = await DentalBlog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    blog.status = status.toLowerCase();
    await blog.save();

    // Invalidate blog category Redis caches
    await deleteCachePattern('blogs:*');

    return res.status(200).json({
      success: true,
      message: `Article ${blog.status === 'published' ? 'published' : status}.`,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Like / upvote an article
// @route   PATCH /api/blogs/:id/like
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid article ID.' });
    }

    const blog = await DentalBlog.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true, select: 'title likes' }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    return res.status(200).json({ success: true, data: { likes: blog.likes } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all distinct categories + counts
// @route   GET /api/blogs/categories
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getBlogCategories = async (req, res) => {
  try {
    const counts = await DentalBlog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const data = BLOG_CATEGORIES.map((name) => ({
      _id: name,
      name,
      count: countMap[name] || 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete an article & invalidate Redis cache
// @route   DELETE /api/blogs/:id
// @access  Protected (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid article ID.' });
    }

    const deleted = await DentalBlog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    // Invalidate blog category Redis caches
    await deleteCachePattern('blogs:*');

    return res.status(200).json({ success: true, message: 'Article deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  likeBlog,
  getBlogCategories,
  deleteBlog,
};
