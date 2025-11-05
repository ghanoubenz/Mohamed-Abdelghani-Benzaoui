import React, { useState, useEffect, useRef } from 'react';
import { Lead } from '../types';
import { UploadIcon } from './Icons';
import { Spinner } from './Spinner';
import { INTEREST_OPTIONS } from '../config';

interface LeadFormProps {
  initialData: Lead;
  onFormSubmit: (lead: Lead) => void;
  onCardSelect: (file: File) => void;
  isProcessingCard: boolean;
  isSubmitting: boolean;
  triggerFileUpload: boolean;
  captureMode?: 'environment';
}

const translations = {
  en: {
    leadDetails: 'Lead Details',
    subHeader: 'Enter details or upload a business card.',
    subHeaderOffline: 'Works offline & syncs automatically.',
    uploadCard: 'Upload a business card',
    uploadHint: 'PNG, JPG or take a photo',
    selectedFile: 'Selected',
    manualEntry: 'OR ENTER MANUALLY',
    fullName: 'Full Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    country: 'Country',
    interest: 'Product/Service Interest',
    selectInterest: 'Select an interest',
    notes: 'Notes',
    saveLead: 'Save Lead',
    processingCard: 'Extracting info...',
    requiredError: (field: string) => `${field} is required`,
    invalidEmail: 'Email is invalid',
  },
  ar: {
    leadDetails: 'تفاصيل العميل المحتمل',
    subHeader: 'أدخل التفاصيل أو قم بتحميل بطاقة عمل.',
    subHeaderOffline: 'يعمل دون اتصال بالإنترنت والمزامنة تلقائيًا.',
    uploadCard: 'تحميل بطاقة عمل',
    uploadHint: 'PNG, JPG أو التقط صورة',
    selectedFile: 'الملف المختار',
    manualEntry: 'أو أدخل يدويًا',
    fullName: 'الاسم الكامل',
    company: 'الشركة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    country: 'الدولة',
    interest: 'الاهتمام بالمنتج/الخدمة',
    selectInterest: 'اختر اهتمامًا',
    notes: 'ملاحظات',
    saveLead: 'حفظ العميل',
    processingCard: 'جاري استخلاص المعلومات...',
    requiredError: (field: string) => `${field} مطلوب`,
    invalidEmail: 'البريد الإلكتروني غير صالح',
  },
};

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent sm:text-sm bg-white/70";

export const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onFormSubmit,
  onCardSelect,
  isProcessingCard,
  isSubmitting,
  triggerFileUpload,
  captureMode,
}) => {
  const [lead, setLead] = useState<Lead>(initialData);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Lead, string>>>({});
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    setLead(initialData);
    setLanguage('en'); 
    setFileName(null);
  }, [initialData]);

  useEffect(() => {
    if (fileInputRef.current) {
      if (captureMode) {
        fileInputRef.current.setAttribute('capture', captureMode);
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
    }
  }, [captureMode]);

  useEffect(() => {
    if (triggerFileUpload) {
      fileInputRef.current?.click();
    }
  }, [triggerFileUpload]);
  
  const validate = () => {
    const newErrors: Partial<Record<keyof Lead, string>> = {};
    if (!lead.name) newErrors.name = t.requiredError(t.fullName);
    if (!lead.company) newErrors.company = t.requiredError(t.company);
    if (!lead.email) {
      newErrors.email = t.requiredError(t.email);
    } else if (!/\S+@\S+\.\S+/.test(lead.email)) {
      newErrors.email = t.invalidEmail;
    }
    if (!lead.phone) newErrors.phone = t.requiredError(t.phone);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (language === 'en' && isArabic(value)) {
        setLanguage('ar');
    }
    setLead(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onCardSelect(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onFormSubmit(lead);
    }
  };
  
  const isFormInvalid = !lead.name || !lead.company || !lead.email || !lead.phone;

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-800">{t.leadDetails}</h2>
        <p className="text-center text-gray-500 mt-2 text-sm">{t.subHeader}<br/>{t.subHeaderOffline}</p>
      </div>

      <div className="relative border-2 border-dashed border-gray-400/50 rounded-lg p-6 text-center hover:border-[#003366] transition-colors duration-200 bg-white/20">
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/*"
          ref={fileInputRef}
          disabled={isProcessingCard || isSubmitting}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            {isProcessingCard ? (
              <>
                <Spinner size="md" />
                <p className="mt-2 text-sm font-medium text-gray-600">{t.processingCard}</p>
              </>
            ) : (
              <>
                <UploadIcon />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  <span className="font-bold text-[#003366]">{t.uploadCard}</span>
                </p>
                <p className="text-xs text-gray-500">{t.uploadHint}</p>
                {fileName && !isProcessingCard && <p className="text-xs text-green-600 mt-2">{t.selectedFile}: {fileName}</p>}
              </>
            )}
          </div>
        </label>
      </div>

      <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 font-semibold text-sm">{t.manualEntry}</span>
          <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.fullName} *</label>
          <input type="text" id="name" name="name" value={lead.name} onChange={handleChange} required className={inputStyle} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">{t.company} *</label>
          <input type="text" id="company" name="company" value={lead.company} onChange={handleChange} required className={inputStyle} />
          {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.email} *</label>
          <input type="email" id="email" name="email" value={lead.email} onChange={handleChange} required className={inputStyle} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phone} *</label>
          <input type="tel" id="phone" name="phone" value={lead.phone} onChange={handleChange} required className={inputStyle} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">{t.country}</label>
          <input type="text" id="country" name="country" value={lead.country} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label htmlFor="interest" className="block text-sm font-medium text-gray-700">{t.interest}</label>
          <select id="interest" name="interest" value={lead.interest} onChange={handleChange} className={inputStyle}>
            <option value="">{t.selectInterest}</option>
            {INTEREST_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">{t.notes}</label>
          <textarea id="notes" name="notes" value={lead.notes} onChange={handleChange} rows={3} className={inputStyle} />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || isProcessingCard || isFormInvalid}
          className="w-full flex justify-center items-center btn-primary text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {isSubmitting ? <Spinner size="sm" /> : t.saveLead}
        </button>
      </div>
    </form>
  );
};