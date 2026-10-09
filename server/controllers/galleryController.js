const SmileCase = require('../models/SmileCase');

// GET: Fetch approved images for frontend (When user clicks "About Us -> Smile Gallery")
exports.getGalleryCases = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'Approved' }; // Only show approved cases on public website
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const cases = await SmileCase.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST: Create/Upload new case (Admin / Assistant Panel)
exports.createCase = async (req, res) => {
  try {
    const { title, category, doctorName, caseDetails, uploadedByRole } = req.body;
    
    if (!req.processedImages) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }

    // If uploaded by assistant, status is 'Pending'. If doctor, can directly be 'Approved'
    const status = uploadedByRole === 'Doctor' ? 'Approved' : 'Pending';

    const newCase = new SmileCase({
      title,
      category,
      doctorName,
      caseDetails,
      images: req.processedImages,
      status,
      uploadedByRole
    });

    await newCase.save();
    res.status(201).json({ success: true, message: 'Smile case uploaded successfully', data: newCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH: Doctor Approval System
exports.approveCase = async (req, res) => {
  try {
    const smileCase = await SmileCase.findById(req.params.id);
    if (!smileCase) return res.status(404).json({ success: false, error: 'Case not found' });

    smileCase.status = 'Approved';
    await smileCase.save();

    res.status(200).json({ success: true, message: 'Case approved and now live on website', data: smileCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE: Remove case
exports.deleteCase = async (req, res) => {
  try {
    const deletedCase = await SmileCase.findByIdAndDelete(req.params.id);
    if (!deletedCase) return res.status(404).json({ success: false, error: 'Case not found' });
    res.status(200).json({ success: true, message: 'Case deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};