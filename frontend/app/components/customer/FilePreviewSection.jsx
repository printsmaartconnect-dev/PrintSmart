import React from 'react';
import DocumentPreview from './DocumentPreview';

export default function FilePreviewSection({ file, thumbnailUrl, isBW, isLoading }) {
  const fileName = file?.customFileName || file?.originalFileName || file?.file?.name || 'Document';

  return (
    <div className="flex flex-col items-center justify-center mb-10 bg-slate-50/50 p-6 sm:p-8 rounded-[36px] border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 shadow-lg max-w-xl mx-auto w-full">
      <div className="text-xs uppercase tracking-wider text-indigo-600 font-extrabold mb-4 font-brand">
        File Preview
      </div>
      
      {/* A4 Aspect Ratio Container */}
      <div className="w-[70vw] sm:w-[340px] aspect-[1/1.414] bg-white rounded-[24px] shadow-md border border-gray-200 overflow-hidden flex items-center justify-center relative mb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-indigo-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
            <span className="text-[10px] uppercase font-bold text-gray-500 font-brand">Generating preview...</span>
          </div>
        ) : (
          <DocumentPreview
            file={file}
            thumbnailUrl={thumbnailUrl}
            isBW={isBW}
          />
        )}
      </div>
      
      <h3 className="font-semibold text-xl text-gray-900 text-center truncate max-w-[280px] sm:max-w-[420px] font-brand">
        {fileName}
      </h3>
      <p className="text-base text-gray-600 font-semibold mt-1">
        Preview pages before print
      </p>
    </div>
  );
}
