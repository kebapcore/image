
import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import { MenuIcon, CircleIcon, DocumentTextIcon, PlusIcon, XMarkIcon, InfinityIcon, SparklesIcon } from './components/Icon';
import ImageGeneratorTab from './components/ImageGeneratorTab';
import InfinityImageGeneratorTab from './components/InfinityImageGeneratorTab'; // Import the new tab

const initialTabs: Tab[] = [
  { id: 'get-started', title: 'Image Studio', icon: SparklesIcon, type: 'imageGenerator', content: ImageGeneratorTab },
  { id: 'infinity-mode', title: 'Infinity Mode', icon: InfinityIcon, type: 'infinityGenerator', content: InfinityImageGeneratorTab },
];

const appScrollbarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0].id);
  const [nextTabNumber, setNextTabNumber] = useState(1);

  useEffect(() => {
    const styleId = 'app-noscrollbar-styles';
    if (!document.getElementById(styleId) && typeof window !== 'undefined') {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.type = "text/css";
      styleSheet.innerText = appScrollbarStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);


  const addTab = (type: 'imageGenerator' | 'infinityGenerator' | 'placeholder' = 'placeholder') => {
    const newTabId = `tab-${Date.now()}-${nextTabNumber}`;
    setNextTabNumber(prev => prev + 1);
    
    let newTab: Tab;
    switch (type) {
        case 'imageGenerator':
            newTab = { id: newTabId, title: `Image Studio ${nextTabNumber}`, icon: SparklesIcon, type: 'imageGenerator', content: ImageGeneratorTab };
            break;
        case 'infinityGenerator':
            newTab = { id: newTabId, title: `Infinity ${nextTabNumber}`, icon: InfinityIcon, type: 'infinityGenerator', content: InfinityImageGeneratorTab };
            break;
        default:
             newTab = { id: newTabId, title: `New Tab ${nextTabNumber}`, icon: CircleIcon, type: 'placeholder' };
    }
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
  };


  const closeTab = (tabIdToClose: string, event: React.MouseEvent) => {
    event.stopPropagation(); 
    
    if (tabs.length <= 1) return; // Prevent closing the very last tab

    const tabIndex = tabs.findIndex(tab => tab.id === tabIdToClose);
    const newTabs = tabs.filter(tab => tab.id !== tabIdToClose);
    setTabs(newTabs);

    if (activeTabId === tabIdToClose) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[Math.max(0, tabIndex - 1)].id);
      }
      // If newTabs is empty, the earlier "tabs.length <= 1" check should prevent this state.
      // But as a safeguard:
      else if (initialTabs.length > 0) {
         setTabs([...initialTabs]); // Re-initialize with default
         setActiveTabId(initialTabs[0].id);
      }
    }
  };

  const renderActiveTabContent = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) {
        if (tabs.length > 0) { // Fallback if activeTabId is somehow invalid
            setActiveTabId(tabs[0].id);
            const firstTab = tabs[0];
            if (firstTab.content) return <firstTab.content />;
        }
        return <div className="p-8 text-center text-slate-400">No active tab content available. Try adding a new tab.</div>;
    }

    if (activeTab.content) {
      const ContentComponent = activeTab.content;
      return <ContentComponent />;
    }
    
    // Placeholder for tabs without a dedicated content component
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400 bg-slate-800/80">
        <activeTab.icon className="w-16 h-16 opacity-30 mb-4" />
        Content for <span className="font-semibold text-slate-300">{activeTab.title}</span>
        <p className="text-sm mt-2 text-slate-500">(This is a placeholder tab content)</p>
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col h-screen bg-cover bg-center bg-no-repeat text-slate-100" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531300049993-f60098802900?q=80&w=2000&auto=format&fit=crop')" }} // Changed background
    >
      <header className="flex items-center bg-slate-900/80 backdrop-blur-lg shadow-xl h-14 shrink-0 z-10 select-none">
        <button className="p-4 h-full flex items-center justify-center text-slate-400 hover:text-sky-300 hover:bg-slate-700/60 transition-colors" title="Menu (Not Implemented)">
          <MenuIcon className="w-5 h-5" />
        </button>
        
        <nav className="flex-grow h-full flex items-end overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              title={tab.title}
              className={`flex items-center justify-between h-full px-3 sm:px-4 pt-1 border-l border-r border-t-2 sm:border-t-4
                cursor-pointer transition-all duration-200 ease-in-out group min-w-[140px] sm:min-w-[160px] max-w-[220px] relative
                ${activeTabId === tab.id 
                  ? 'bg-slate-800/80 border-slate-700/50 border-t-sky-500 text-sky-300' 
                  : 'bg-slate-850/50 border-slate-700/30 border-t-transparent hover:bg-slate-750/50 hover:text-slate-200 text-slate-400'
                }`}
                style={activeTabId === tab.id ? { borderTopLeftRadius: '6px', borderTopRightRadius: '6px' } : {borderTopLeftRadius: '4px', borderTopRightRadius: '4px'}}
            >
              <div className="flex items-center overflow-hidden mr-1">
                <tab.icon className={`w-4 h-4 mr-1.5 sm:mr-2 shrink-0 ${activeTabId === tab.id ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}`} />
                <span className="text-xs sm:text-sm truncate font-medium">{tab.title}</span>
              </div>
              {tabs.length > 1 && ( 
                 <button 
                    onClick={(e) => closeTab(tab.id, e)} 
                    className={`ml-auto p-0.5 rounded-full hover:bg-slate-600/80 transition-opacity shrink-0
                      ${activeTabId === tab.id ? 'text-sky-300/70 hover:text-sky-300' : 'text-slate-500/70 hover:text-slate-300 opacity-0 group-hover:opacity-100'}`} // Hide on non-active, show on hover
                    aria-label={`Close ${tab.title} tab`}
                  >
                   <XMarkIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                 </button>
              )}
            </div>
          ))}
        </nav>

        <button onClick={() => addTab('imageGenerator')} className="p-4 h-full flex items-center justify-center text-slate-400 hover:text-sky-300 hover:bg-slate-700/60 transition-colors" title="Add new Image Studio tab">
          <PlusIcon className="w-5 h-5" />
        </button>
      </header>
      
      {/* Custom scrollbar style for main content area if needed - applied in index.html globally */}
      <main className="flex-grow overflow-y-auto bg-transparent"> 
        {renderActiveTabContent()}
      </main>
    </div>
  );
};

export default App;
