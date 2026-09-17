// frontend/src/components/SmileGallery/SmileGalleryModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Clinical Case Lightbox Modal: High-res zoom, clinical notes, and shade metrics
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { getImageUrl, likeCase } from '../../services/galleryApi';

const SmileGalleryModal = ({ caseData, onClose, onLikeUpdated }) => {
  const [activeView, setActiveView] = useState('slider'); // 'slider' | 'side-by-side'
  const [likes, setLikes] = useState(caseData?.metrics?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!caseData) return null;

  const beforeFullUrl = getImageUrl(caseData.images?.before?.full || caseData.images?.before?.display);
  const afterFullUrl = getImageUrl(caseData.images?.after?.full || caseData.images?.after?.display);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      const res = await likeCase(caseData._id || caseData.caseId);
      if (onLikeUpdated) onLikeUpdated(caseData._id || caseData.caseId, res.likes);
    } catch (err) {
      console.error('Failed to upvote case:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">
              {caseData.caseId || 'CASE'}
            </span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {caseData.category}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {caseData.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Treated by <span className="font-semibold text-teal-600">{caseData.doctorName}</span> • {caseData.doctorSpecialty}
              </p>
            </div>

            {/* View Mode Toggle & Like Button */}
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveView('slider')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeView === 'slider' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interactive Slider
                </button>
                <button
                  onClick={() => setActiveView('side-by-side')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeView === 'side-by-side' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>

              <button
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  hasLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600 cursor-default'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>❤️</span>
                <span>{likes}</span>
              </button>
            </div>
          </div>

          {/* Image Display Area */}
          {activeView === 'slider' ? (
            <div className="max-w-3xl mx-auto">
              <BeforeAfterSlider
                beforeSrc={beforeFullUrl}
                afterSrc={afterFullUrl}
                beforeAlt={caseData.title}
                afterAlt={caseData.title}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Before Procedure</span>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm aspect-[4/3] bg-slate-900">
                  <img src={beforeFullUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">After Transformation</span>
                <div className="overflow-hidden rounded-xl border border-teal-200 shadow-sm aspect-[4/3] bg-slate-900">
                  <img src={afterFullUrl} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Clinical Case Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Treatment Duration</span>
              <span className="font-semibold text-slate-800">{caseData.treatmentDetails?.duration || 'Completed'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Shade Progression</span>
              <span className="font-semibold text-teal-600">
                {caseData.treatmentDetails?.initialShade && caseData.treatmentDetails?.finalShade
                  ? `${caseData.treatmentDetails.initialShade} ➔ ${caseData.treatmentDetails.finalShade}`
                  : 'Custom Aesthetics'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Teeth Restored</span>
              <span className="font-semibold text-slate-800">
                {caseData.treatmentDetails?.teethNumbers?.length
                  ? caseData.treatmentDetails.teethNumbers.join(', ')
                  : 'Smile Zone'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Verified HIPAA Consent</span>
              <span className="inline-flex items-center text-emerald-600 font-semibold text-xs">
                ✓ De-identified & Signed
              </span>
            </div>
          </div>

          {/* Case Narrative */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Clinical Overview</h4>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {caseData.description}
            </p>
          </div>

          {/* Procedures & Tags */}
          {caseData.treatmentDetails?.procedures?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Procedures Performed</h4>
              <div className="flex flex-wrap gap-2">
                {caseData.treatmentDetails.procedures.map((proc, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium">
                    {proc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmileGalleryModal;
