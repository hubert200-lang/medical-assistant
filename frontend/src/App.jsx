import { useState, useEffect } from 'react';

// Main App Component
function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Current active tab: 'welcome', 'chat', 'analysis', 'research'
  const [activeTab, setActiveTab] = useState('welcome');
  
  // API health status
  const [apiHealth, setApiHealth] = useState(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLanguage, setChatLanguage] = useState('en');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Analysis state
  const [analysisSubTab, setAnalysisSubTab] = useState('text'); // 'text' or 'image'
  const [analysisTextInput, setAnalysisTextInput] = useState('');
  const [analysisContext, setAnalysisContext] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  
  // Research state
  const [researchQuery, setResearchQuery] = useState('');
  const [researchNumResults, setResearchNumResults] = useState(5);
  const [researchResults, setResearchResults] = useState(null);
  const [researchLoading, setResearchLoading] = useState(false);
  
  // Error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // API Base URL
  const API_BASE_URL = 'http://localhost:8000';
  
  // ============================================
  // API HELPER FUNCTIONS
  // ============================================
  
  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);
  
  // Function to check API health
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      setApiHealth(data);
    } catch (error) {
      setApiHealth({ status: 'error', message: 'Cannot connect to API' });
    }
  };
  
  // Function to send chat message
  const handleSendMessage = async () => {
    // Validate input
    if (!chatInput.trim()) {
      setErrorMessage('Please enter a message');
      return;
    }
    
    // Add user message to chat
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          language: chatLanguage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = { role: 'assistant', content: data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setChatLoading(false);
    }
  };
  
  // Function to analyze text
  const handleAnalyzeText = async () => {
    // Validate input
    if (!analysisTextInput.trim()) {
      setErrorMessage('Please enter text to analyze');
      return;
    }
    
    setAnalysisLoading(true);
    setErrorMessage('');
    setAnalysisResults(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: analysisTextInput,
          context: analysisContext || undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setAnalysisResults(data);
      setSuccessMessage('Analysis complete!');
      
    } catch (error) {
      setErrorMessage('Failed to analyze text. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to analyze image
  const handleAnalyzeImage = async () => {
    // Validate input
    if (!selectedImage) {
      setErrorMessage('Please select an image to analyze');
      return;
    }
    
    setAnalysisLoading(true);
    setErrorMessage('');
    setAnalysisResults(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Image analysis failed');
      }
      
      const data = await response.json();
      setAnalysisResults(data);
      setSuccessMessage('Image analysis complete!');
      
    } catch (error) {
      setErrorMessage('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // Function to extract text from image
  const handleExtractText = async () => {
    if (!selectedImage) {
      setErrorMessage('Please select an image first');
      return;
    }
    
    setAnalysisLoading(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const response = await fetch(`${API_BASE_URL}/api/analyze-image-text`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Text extraction failed');
      }
      
      const data = await response.json();
      setExtractedText(data.extracted_text);
      setSuccessMessage('Text extracted successfully!');
      
    } catch (error) {
      setErrorMessage('Failed to extract text. Please try again.');
      console.error('Text extraction error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // Function to perform research
  const handleResearch = async () => {
    // Validate input
    if (!researchQuery.trim()) {
      setErrorMessage('Please enter a research query');
      return;
    }
    
    setResearchLoading(true);
    setErrorMessage('');
    setResearchResults(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: researchQuery,
          num_results: researchNumResults
        })
      });
      
      if (!response.ok) {
        throw new Error('Research failed');
      }
      
      const data = await response.json();
      setResearchResults(data);
      setSuccessMessage('Research complete!');
      
    } catch (error) {
      setErrorMessage('Failed to perform research. Please try again.');
      console.error('Research error:', error);
    } finally {
      setResearchLoading(false);
    }
  };
  
  // Function to copy analysis results
  const copyResults = () => {
    if (!analysisResults) return;
    
    const text = `
Summary: ${analysisResults.summary}
Key Findings: ${analysisResults.key_findings.join(', ')}
Recommendations: ${analysisResults.recommendations.join(', ')}
Next Steps: ${analysisResults.next_steps.join(', ')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setSuccessMessage('Results copied to clipboard!');
  };
  
  // Function to clear analysis
  const clearAnalysis = () => {
    setAnalysisTextInput('');
    setAnalysisContext('');
    setAnalysisResults(null);
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText('');
    setSuccessMessage('Analysis cleared!');
  };
  
  // ============================================
  // RENDER COMPONENTS
  // ============================================
  
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#1A9A8B]">TeleMed AI Assistant</h1>
          <p className="text-sm text-[#1F2937] mt-1">Your intelligent medical companion</p>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'welcome'
                  ? 'border-[#1A9A8B] text-[#1A9A8B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#1A9A8B] text-[#1A9A8B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat with AI
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analysis'
                  ? 'border-[#1A9A8B] text-[#1A9A8B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Medical Analysis
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'research'
                  ? 'border-[#1A9A8B] text-[#1A9A8B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Research Assistant
            </button>
          </div>
        </div>
      </nav>
      
      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* WELCOME TAB */}
        {activeTab === 'welcome' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
                Welcome to TeleMed AI Assistant
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Your intelligent healthcare companion powered by AI
              </p>
              <p className="text-gray-500">
                Chat with our AI, analyze medical reports, and research health topics - all in one place.
              </p>
              
              {/* API Health Status */}
              <div className="mt-6 inline-block">
                {apiHealth ? (
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    apiHealth.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    API Status: {apiHealth.status === 'healthy' ? '✓ Online' : '✗ Offline'}
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Checking API...
                  </div>
                )}
              </div>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Chat Card */}
              <button
                onClick={() => setActiveTab('chat')}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-[#1A9A8B] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-[white] mb-2">Chat with AI</h3>
                <p className="text-gray-500">
                  Ask medical questions and get intelligent responses in English or French.
                </p>
              </button>
              
              {/* Analysis Card */}
              <button
                onClick={() => setActiveTab('analysis')}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-[green] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-semibold text-[white] mb-2">Medical Analysis</h3>
                <p className="text-gray-500">
                  Analyze medical reports from text or images with AI-powered insights.
                </p>
              </button>
              
              {/* Research Card */}
              <button
                onClick={() => setActiveTab('research')}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-[#1A9A8B] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-[white] mb-2">Research Assistant</h3>
                <p className="text-gray-500">
                  Search medical literature and get summarized research findings.
                </p>
              </button>
            </div>
          </div>
        )}
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="bg-gray-300 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Chat with AI</h2>
              
              {/* Language Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Language:</span>
                <button
                  onClick={() => setChatLanguage('en')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    chatLanguage === 'en'
                      ? 'bg-[#1A9A8B] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setChatLanguage('fr')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    chatLanguage === 'fr'
                      ? 'bg-[#1A9A8B] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Français
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto mb-4 p-4 bg-white-50 rounded-lg space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-[#1A9A8B] text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#1F2937]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading Indicator */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9A8B]"
                disabled={chatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-2 bg-[#1A9A8B] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        )}
        
        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-gray-400 rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Medical Report Analysis</h2>
              
              {/* Sub-tabs */}
              <div className="flex space-x-4 mb-6 border-b border-[#E5E7EB]">
                <button
                  onClick={() => setAnalysisSubTab('text')}
                  className={`pb-2 px-4 font-medium transition-colors ${
                    analysisSubTab === 'text'
                      ? 'border-b-2 border-[#1A9A8B] text-[#1A9A8B]'
                      : 'text-gray-500'
                  }`}
                >
                  Text Analysis
                </button>
                <button
                  onClick={() => setAnalysisSubTab('image')}
                  className={`pb-2 px-4 font-medium transition-colors ${
                    analysisSubTab === 'image'
                      ? 'border-b-2 border-[#1A9A8B] text-[#1A9A8B]'
                      : 'text-gray-500'
                  }`}
                >
                  Image Analysis
                </button>
              </div>
              
              {/* Text Analysis Sub-tab */}
              {analysisSubTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Medical Report Text *
                    </label>
                    <textarea
                      value={analysisTextInput}
                      onChange={(e) => setAnalysisTextInput(e.target.value)}
                      placeholder="Paste your medical report text here..."
                      rows={6}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9A8B]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Additional Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={analysisContext}
                      onChange={(e) => setAnalysisContext(e.target.value)}
                      placeholder="e.g., patient age, symptoms, etc."
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9A8B]"
                    />
                  </div>
                  
                  <button
                    onClick={handleAnalyzeText}
                    disabled={analysisLoading}
                    className="w-full py-3 bg-[#2F80ED] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {analysisLoading ? 'Analyzing...' : 'Analyze Text'}
                  </button>
                </div>
              )}
              
              {/* Image Analysis Sub-tab */}
              {analysisSubTab === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Upload Medical Report Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9A8B]"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="border border-[#E5E7EB] rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAnalyzeImage}
                      disabled={analysisLoading || !selectedImage}
                      className="flex-1 py-3 bg-[#2F80ED] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {analysisLoading ? 'Analyzing...' : 'Analyze Image'}
                    </button>
                    <button
                      onClick={handleExtractText}
                      disabled={analysisLoading || !selectedImage}
                      className="flex-1 py-3 bg-[#1A9A8B] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Extract Text
                    </button>
                  </div>
                  
                  {/* Extracted Text Display */}
                  {extractedText && (
                    <div className="bg-gray-50 border border-[#E5E7EB] rounded-lg p-4">
                      <h4 className="font-medium text-[#1F2937] mb-2">Extracted Text:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Analysis Results */}
            {analysisResults && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#1F2937]">Analysis Results</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyResults}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                      Copy Results
                    </button>
                    <button
                      onClick={clearAnalysis}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-[#1F2937] mb-2">Summary</h4>
                  <p className="text-gray-700">{analysisResults.summary}</p>
                </div>
                
                {/* Key Findings */}
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-[#1F2937] mb-2">Key Findings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResults.key_findings.map((finding, index) => (
                      <li key={index} className="text-gray-700">{finding}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Recommendations */}
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-[#1F2937] mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResults.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Next Steps */}
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-[#1F2937] mb-2">Next Steps</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResults.next_steps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Disclaimer */}
                {analysisResults.disclaimer && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-[#1F2937] mb-2">⚠️ Disclaimer</h4>
                    <p className="text-gray-700 text-sm">{analysisResults.disclaimer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* RESEARCH TAB */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="bg-gray-400 rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Medical Research Assistant</h2>
              
              <div className="space-y-4">
                {/* Research Query Input */}
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Research Query *
                  </label>
                  <input
                    type="text"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="e.g., latest treatments for diabetes"
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9A8B]"
                  />
                </div>
                
                {/* Number of Results Slider */}
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Number of Results: {researchNumResults}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={researchNumResults}
                    onChange={(e) => setResearchNumResults(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
                
                {/* Search Button */}
                <button
                  onClick={handleResearch}
                  disabled={researchLoading}
                  className="w-full py-3 bg-[#1A9A8B] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {researchLoading ? 'Searching...' : 'Search Medical Literature'}
                </button>
              </div>
            </div>
            
            {/* Research Results */}
            {researchResults && (
              <div className="space-y-6">
                {/* AI Summary */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">AI Summary</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700">{researchResults.summary}</p>
                  </div>
                </div>
                
                {/* Research Results Cards */}
                {researchResults.results && researchResults.results.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4">
                      Research Findings ({researchResults.results.length})
                    </h3>
                    <div className="space-y-4">
                      {researchResults.results.map((result, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                          {/* Result Title */}
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-[#1F2937] flex-1">
                              {result.title}
                            </h4>
                            {result.relevance_score && (
                              <span className="ml-4 px-3 py-1 bg-[#1A9A8B] bg-opacity-10 text-[#1A9A8B] rounded-full text-sm font-medium">
                                {Math.round(result.relevance_score * 100)}% Relevant
                              </span>
                            )}
                          </div>
                          
                          {/* Result Excerpt */}
                          <p className="text-gray-600 mb-4">{result.excerpt}</p>
                          
                          {/* Result Link */}
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[#2F80ED] hover:underline font-medium"
                            >
                              Read Full Article
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <p className="text-gray-500">No research results found. Try a different query.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Loading State */}
            {researchLoading && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#1A9A8B] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Searching medical literature...</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            TeleMed AI Assistant - Always consult with healthcare professionals for medical decisions
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;