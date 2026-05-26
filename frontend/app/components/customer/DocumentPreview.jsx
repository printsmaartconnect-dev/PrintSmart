import React from 'react';
import { FileText } from 'lucide-react';

export default function DocumentPreview({ file, thumbnailUrl, isBW }) {
  const fileName = file?.customFileName || file?.originalFileName || 'Document';
  let fileExt = '';
  if (file?.originalFileName && file.originalFileName.includes('.')) {
    fileExt = file.originalFileName.substring(file.originalFileName.lastIndexOf('.')).toLowerCase();
  } else {
    fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  }
  const isWord = fileExt === '.docx' || fileExt === '.doc';
  const isPdf = fileExt === '.pdf';
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(fileExt);

  // Class for grayscale/contrast based on isBW print type setting
  const grayscaleClass = isBW ? 'grayscale contrast-125' : '';

  // 1. If thumbnail is present, render it
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={fileName}
        className={`w-full h-full object-cover transition-all duration-300 ${grayscaleClass}`}
      />
    );
  }

  // 2. If it is a Word Document (DOC/DOCX), render premium Word Preview fallback
  if (isWord) {
    return (
      <div className={`w-full h-full bg-slate-50 flex flex-col items-center justify-between p-6 text-center select-none ${grayscaleClass}`}>
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Custom Word document emblem */}
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 border border-blue-200 shadow-sm">
            <span className="text-blue-600 font-extrabold text-2xl font-brand">W</span>
          </div>
          <div className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase mb-1">
            Word Document
          </div>
          <div className="text-sm font-extrabold text-gray-800 line-clamp-2 px-2 max-w-full font-brand">
            {fileName}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 font-bold border-t border-gray-200 w-full pt-3">
          Microsoft Word Document • Ready
        </div>
      </div>
    );
  }

  // 3. If PDF (and no thumbnail was generated for some reason), render PDF fallback
  if (isPdf) {
    return (
      <div className={`w-full h-full bg-slate-50 flex flex-col items-center justify-between p-6 text-center select-none ${grayscaleClass}`}>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 border border-red-200 shadow-sm">
            <span className="text-red-600 font-extrabold text-xl font-brand">PDF</span>
          </div>
          <div className="text-[10px] font-extrabold tracking-wider text-red-600 uppercase mb-1">
            Adobe PDF
          </div>
          <div className="text-sm font-extrabold text-gray-800 line-clamp-2 px-2 max-w-full font-brand">
            {fileName}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 font-bold border-t border-gray-200 w-full pt-3">
          Portable Document Format • Ready
        </div>
      </div>
    );
  }

  // 4. If Image (and no thumbnail is present, fall back to URL)
  if (isImage && file?.fileUrl) {
    return (
      <img
        src={file.fileUrl}
        alt={fileName}
        className={`w-full h-full object-cover transition-all duration-300 ${grayscaleClass}`}
      />
    );
  }

  // 5. Generic Document Fallback
  return (
    <div className={`w-full h-full bg-slate-50 flex flex-col items-center justify-between p-6 text-center select-none ${grayscaleClass}`}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 border border-indigo-200 shadow-sm">
          <FileText size={32} className="text-indigo-600" />
        </div>
        <div className="text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase mb-1">
          Document File
        </div>
        <div className="text-sm font-extrabold text-gray-800 line-clamp-2 px-2 max-w-full font-brand">
          {fileName}
        </div>
      </div>
      <div className="text-[11px] text-gray-500 font-bold border-t border-gray-200 w-full pt-3">
        Print Document • Ready
      </div>
    </div>
  );
}
