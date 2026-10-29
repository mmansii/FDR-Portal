import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Upload, 
  FileText, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  FileCheck, 
  ArrowRight, 
  ArrowLeft,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { formatINR } from '../../../utils/currencyUtils';
import { DocumentMetadata } from '../../../types';

export const SubmissionWizardModal: React.FC = () => {
  const { 
    submissionWizardOpen, 
    closeSubmissionWizard, 
    institutions, 
    currentRole, 
    currentUser, 
    currentInstitution,
    submitFDR,
    fdrRecords,
    submissionPreselectedInstitutionId,
    submissionRenewalOfFdrId,
    setSelectedFdrId,
    setActiveModule
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  // Form Fields
  const [institutionId, setInstitutionId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [branchName, setBranchName] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [instrumentNumber, setInstrumentNumber] = useState<string>('');
  const [fdrAmount, setFdrAmount] = useState<number>(5000000);
  const [issueDate, setIssueDate] = useState<string>('2026-10-24');
  const [maturityDate, setMaturityDate] = useState<string>('2031-10-24');
  const [tenureMonths, setTenureMonths] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(7.10);
  const [purpose, setPurpose] = useState<any>('SECURITY_DEPOSIT');
  const [isReplacement, setIsReplacement] = useState<boolean>(false);
  const [replacesFDRId, setReplacesFDRId] = useState<string>('');

  // Documents
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or initialize on open
  useEffect(() => {
    if (submissionWizardOpen) {
      setStep(1);
      setSubmittedRefId(null);
      setErrors({});
      setDocUploadError(null);

      // Default institution
      if (currentRole === 'INSTITUTION' && currentInstitution) {
        setInstitutionId(currentInstitution.id);
      } else if (submissionPreselectedInstitutionId) {
        setInstitutionId(submissionPreselectedInstitutionId);
      } else if (institutions.length > 0) {
        setInstitutionId(institutions[0].id);
      }

      // Default replacement if passed
      if (submissionRenewalOfFdrId) {
        setIsReplacement(true);
        setReplacesFDRId(submissionRenewalOfFdrId);
        const original = fdrRecords.find(f => f.id === submissionRenewalOfFdrId);
        if (original) {
          setBankName(original.bankName);
          setFdrAmount(original.fdrAmount);
          setPurpose(original.purpose);
          setBranchName(original.branchName);
          setIfscCode(original.ifscCode);
        }
      } else {
        setIsReplacement(false);
        setReplacesFDRId('');
        setBranchName('Connaught Place Branch');
        setIfscCode('SBIN0000691');
        setInstrumentNumber(`SBI-${Math.floor(100000 + Math.random() * 900000)}`);
      }

      // Default sample document
      setDocuments([
        {
          id: `DOC-NEW-${Date.now()}`,
          fileName: 'FDR_Deposit_Receipt_Lien_Copy.pdf',
          fileSize: '2.1 MB',
          fileType: 'application/pdf',
          uploadDate: new Date().toISOString().slice(0, 10),
          category: 'FDR_RECEIPT',
          isLocallySelected: true,
          simulatedExtractedText: {
            bankName: 'State Bank of India',
            instrumentNumber: 'SBI-FDR-SAMPLE',
            amount: 5000000,
            confidenceScore: 0.96,
          }
        }
      ]);
    }
  }, [submissionWizardOpen, submissionPreselectedInstitutionId, submissionRenewalOfFdrId, currentRole, currentInstitution]);

  if (!submissionWizardOpen) return null;

  const selectedInst = institutions.find(i => i.id === institutionId);

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!institutionId) errs.institutionId = 'Institution selection is mandatory';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!bankName.trim()) errs.bankName = 'Bank name is mandatory';
    if (!branchName.trim()) errs.branchName = 'Branch name is mandatory';
    if (!ifscCode.trim()) errs.ifscCode = 'IFSC code is mandatory';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase().trim())) {
      errs.ifscCode = 'Invalid IFSC code format (e.g. SBIN0000691)';
    }
    if (!instrumentNumber.trim()) errs.instrumentNumber = 'Instrument/Receipt number is mandatory';
    if (!fdrAmount || fdrAmount <= 0) errs.fdrAmount = 'Amount must be greater than zero';
    if (!issueDate) errs.issueDate = 'Issue date is mandatory';
    if (!maturityDate) errs.maturityDate = 'Maturity date is mandatory';
    if (issueDate && maturityDate && new Date(maturityDate) <= new Date(issueDate)) {
      errs.maturityDate = 'Maturity date must be strictly after issue date';
    }
    if (isReplacement && !replacesFDRId) {
      errs.replacesFDRId = 'Please select the original FDR being replaced';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (documents.length === 0) {
      errs.documents = 'At least one supporting document (scanned FDR receipt) must be attached';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(extension)) {
      setDocUploadError('Unsupported file type. Please select PDF, PNG, or JPG document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDocUploadError('File size exceeds the 5 MB demonstration threshold limit.');
      return;
    }

    const newDoc: DocumentMetadata = {
      id: `DOC-NEW-${Date.now()}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.type || 'application/pdf',
      uploadDate: new Date().toISOString().slice(0, 10),
      category: 'FDR_RECEIPT',
      isLocallySelected: true,
      simulatedExtractedText: {
        bankName,
        instrumentNumber,
        amount: fdrAmount,
        confidenceScore: 0.95,
      }
    };

    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleFinalSubmit = () => {
    const newRefId = submitFDR({
      institutionId,
      bankName,
      branchName,
      ifscCode: ifscCode.toUpperCase().trim(),
      instrumentNumber,
      fdrAmount,
      issueDate,
      maturityDate,
      tenureMonths,
      interestRate,
      purpose,
      isReplacement,
      replacesFDRId: isReplacement ? replacesFDRId : undefined,
      documents,
    });

    setSubmittedRefId(newRefId);
  };

  const handleDone = () => {
    if (submittedRefId) {
      setSelectedFdrId(submittedRefId);
      setActiveModule('repository');
    }
    closeSubmissionWizard();
  };

  return (
    <Modal
      isOpen={submissionWizardOpen}
      onClose={closeSubmissionWizard}
      title={submittedRefId ? 'FDR Submission Completed' : 'Multi-Step FDR Submission Wizard'}
      subtitle={submittedRefId ? 'Reference generated and dispatched for scrutiny' : 'Step-by-step regulatory security deposit lodgement'}
      maxWidth="4xl"
      footer={
        submittedRefId ? (
          <button
            type="button"
            onClick={handleDone}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            View Record in Repository
          </button>
        ) : (
          <div className="w-full flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={handlePrev}
              className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 ${
                step === 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeSubmissionWizard}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-1.5 px-6 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" /> Final Submit to AICTE
                </button>
              )}
            </div>
          </div>
        )
      }
    >
      {/* SUCCESS SCREEN */}
      {submittedRefId ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lodgement Successfully Dispatched</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your FDR record has been assigned a unique regulatory tracking reference.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Generated Reference ID:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {submittedRefId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Institution:</span>
              <span className="font-semibold text-slate-800">{selectedInst?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Secured Amount:</span>
              <span className="font-bold text-emerald-700">{formatINR(fdrAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Initial Status:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending Verification
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The record has been injected into the bureau scrutiny queue and logged to the immutable audit trail.
          </p>
        </div>
      ) : (
        <div>
          {/* STEPPER BAR */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            {[
              { num: 1, label: 'Institution' },
              { num: 2, label: 'Instrument' },
              { num: 3, label: 'Documents' },
              { num: 4, label: 'Review & Lodgement' },
            ].map(s => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-xs hidden sm:inline ${isActive ? 'font-bold text-blue-900' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: Institution Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Technical Institution *
                </label>
                <select
                  disabled={currentRole === 'INSTITUTION'}
                  value={institutionId}
                  onChange={e => setInstitutionId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code}) - {inst.city}, {inst.state}
                    </option>
                  ))}
                </select>
                {errors.institutionId && (
                  <p className="text-red-600 text-[11px] mt-1">{errors.institutionId}</p>
                )}
              </div>

              {selectedInst && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{selectedInst.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                    <div>AICTE Approval Code: <span className="font-mono font-medium text-slate-900">{selectedInst.code}</span></div>
                    <div>Location: <span className="font-medium text-slate-900">{selectedInst.city}, {selectedInst.state}</span></div>
                    <div>Category: <span className="font-medium text-slate-900">{selectedInst.category}</span></div>
                    <div>Registered Head: <span className="font-medium text-slate-900">{selectedInst.headName}</span></div>
                    <div>Contact Email: <span className="font-medium text-slate-900">{selectedInst.contactEmail}</span></div>
                    <div>Contact Phone: <span className="font-medium text-slate-900">{selectedInst.contactPhone}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Instrument Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    placeholder="e.g. Connaught Place Branch"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2"
                  />
                  {errors.branchName && <p className="text-red-600 text-[11px] mt-1">{errors.branchName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0000691"
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2"
                  />
                  {errors.ifscCode && <p className="text-red-600 text-[11px] mt-1">{errors.ifscCode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    FDR / Instrument Receipt No *
                  </label>
                  <input
                    type="text"
                    value={instrumentNumber}
                    onChange={e => setInstrumentNumber(e.target.value)}
                    placeholder="e.g. SBI-FDR-981240"
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2"
                  />
                  {errors.instrumentNumber && <p className="text-red-600 text-[11px] mt-1">{errors.instrumentNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    FDR Face Amount (INR) *
                  </label>
                  <input
                    type="number"
                    value={fdrAmount}
                    onChange={e => setFdrAmount(Number(e.target.value))}
                    step="500000"
                    className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Formatted: {formatINR(fdrAmount)}</p>
                  {errors.fdrAmount && <p className="text-red-600 text-[11px] mt-1">{errors.fdrAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deposit Purpose Category
                  </label>
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="SECURITY_DEPOSIT">Security Deposit (Mandatory)</option>
                    <option value="PROGRAMME_ENDOWMENT">Programme Endowment Fund</option>
                    <option value="INFRASTRUCTURE_FUND">Infrastructure Development Deposit</option>
                    <option value="NEW_INSTITUTION_DEPOSIT">New Institution Establishment Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Issue *
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2"
                  />
                  {errors.issueDate && <p className="text-red-600 text-[11px] mt-1">{errors.issueDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maturity Date *
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={e => setMaturityDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2"
                  />
                  {errors.maturityDate && <p className="text-red-600 text-[11px] mt-1">{errors.maturityDate}</p>}
                </div>
              </div>

              {/* Renewal Linking Checkbox */}
              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReplacement}
                    onChange={e => setIsReplacement(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    This submission is a Replacement / Renewal for an existing maturing FDR
                  </span>
                </label>

                {isReplacement && (
                  <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      Link to Original / Maturing FDR Reference *
                    </label>
                    <select
                      value={replacesFDRId}
                      onChange={e => setReplacesFDRId(e.target.value)}
                      className="w-full text-xs rounded-lg border border-blue-300 p-2 bg-white"
                    >
                      <option value="">-- Select Maturing FDR to Rollover --</option>
                      {fdrRecords
                        .filter(f => f.institutionId === institutionId)
                        .map(f => (
                          <option key={f.id} value={f.id}>
                            {f.id} ({f.instrumentNumber}) - {formatINR(f.fdrAmount)} - Matures: {f.maturityDate}
                          </option>
                        ))}
                    </select>
                    {errors.replacesFDRId && <p className="text-red-600 text-[11px] mt-1">{errors.replacesFDRId}</p>}
                    <p className="text-[11px] text-blue-700 mt-1">
                      Linking maintains historical continuity and updates the renewal pipeline without deleting original records.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Supporting Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Select Demonstration Supporting Document
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF, PNG, JPG (Maximum 5 MB). Client-side simulated selection.
                </p>

                <label className="mt-3 inline-block cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUploadSim}
                  />
                </label>
              </div>

              {docUploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{docUploadError}</span>
                </div>
              )}

              {errors.documents && (
                <p className="text-red-600 text-xs font-medium">{errors.documents}</p>
              )}

              {/* Document List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Attached Documents ({documents.length})</p>
                {documents.map((doc, idx) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.fileName}</p>
                        <p className="text-[11px] text-slate-400">
                          {doc.fileSize} • Locally selected demonstration document • OCR simulation ready
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review and Lodgement */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold">Lodgement Verification Disclaimer:</span> Submitting this record registers it under AICTE statutory oversight. Ensure instrument details match bank deposit receipts accurately to avoid discrepancy flags.
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-800">
                  Submission Summary Checklist
                </div>

                <div className="p-4 grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Institution</span>
                    <span className="font-semibold">{selectedInst?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">AICTE Code</span>
                    <span className="font-mono font-semibold">{selectedInst?.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bank & Branch</span>
                    <span className="font-semibold">{bankName} - {branchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                    <span className="font-mono font-semibold">{ifscCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Instrument / Receipt Number</span>
                    <span className="font-mono font-semibold text-blue-700">{instrumentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">FDR Face Amount</span>
                    <span className="font-bold text-emerald-700 text-sm">{formatINR(fdrAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Issue & Maturity Dates</span>
                    <span className="font-semibold">{issueDate} → {maturityDate} (60 Months)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Renewal Lineage</span>
                    <span className="font-semibold">{isReplacement ? `Replacement for ${replacesFDRId}` : 'New Initial Deposit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Attached Documents</span>
                    <span className="font-semibold">{documents.length} File(s) Attached</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Submitted By</span>
                    <span className="font-semibold">{currentUser.name} ({currentRole})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
