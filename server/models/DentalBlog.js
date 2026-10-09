import mongoose from 'mongoose';

export const BLOG_CATEGORIES = [
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

/** Resolve a query/body category to the canonical enum value. "All" / empty → null (no filter). */
export function resolveBlogCategory(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || /^all$/i.test(trimmed)) return null;
  const match = BLOG_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

const dentalBlogSchema = new mongoose.Schema(
  {
    // ─── Content Identity ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
      maxlength: [400, 'Excerpt cannot exceed 400 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },

    // ─── Authorship ───────────────────────────────────────────────────────────────
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      default: null,
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    authorRole: {
      type: String,
      default: 'Dental Specialist',
      trim: true,
    },
    authorImage: {
      type: String,
      default: '',
    },

    // ─── Media ────────────────────────────────────────────────────────────────────
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
    },

    // ─── Taxonomy (Indexed for Instant Dynamic Filtering Speed) ──────────────────
    category: {
      type: String,
      enum: BLOG_CATEGORIES,
      default: 'General',
      index: true, // Single field index for instant category queries
    },
    tags: {
      type: [String],
      default: [],
    },

    // ─── Publishing ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      lowercase: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ─── Engagement ───────────────────────────────────────────────────────────────
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    readTimeMinutes: {
      type: Number,
      default: 3,
      min: 1,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── SEO ─────────────────────────────────────────────────────────────────────
    metaDescription: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Frontend-friendly aliases
dentalBlogSchema.virtual('image').get(function () {
  return this.coverImage;
});
dentalBlogSchema.virtual('author').get(function () {
  return this.authorName;
});

// Auto-generate slug & estimate read time
dentalBlogSchema.pre('save', function () {
  const canonical = resolveBlogCategory(this.category);
  if (canonical) this.category = canonical;

  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTimeMinutes = Math.max(1, Math.round(wordCount / 200));
  }
});

// Indexes for performance (Compound index for category filtering + status + sorting)
dentalBlogSchema.index({ category: 1, status: 1, createdAt: -1 });
dentalBlogSchema.index({ status: 1, createdAt: -1 });
dentalBlogSchema.index({ authorId: 1 });

const DentalBlog = mongoose.model('DentalBlog', dentalBlogSchema);
export default DentalBlog;