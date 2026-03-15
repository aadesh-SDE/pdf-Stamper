import { useState } from 'react';
import PdfUploader from './components/PdfUploader';
import { processPdfWithLogos } from './utils/pdfProcessor';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // <-- New loading state

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  // <-- New function to handle the button click
  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    
    // Call our utility function
    await processPdfWithLogos(selectedFile);
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">PDF Logo Stamper</h1>
          <p className="text-lg text-gray-600">Upload a report to instantly add your static lab headers.</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12">
          {!selectedFile ? (
            <PdfUploader onFileSelect={handleFileSelect} />
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">File Ready</h3>
              <p className="text-gray-500 mb-6">{selectedFile.name}</p>
              
              <button 
                onClick={() => setSelectedFile(null)}
                disabled={isProcessing}
                className="text-sm font-medium text-red-600 hover:text-red-500 mb-8 block mx-auto disabled:opacity-50"
              >
                Remove and select another file
              </button>
              
              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Stamping Logos...' : 'Process PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;