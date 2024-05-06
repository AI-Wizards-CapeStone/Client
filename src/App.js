import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [showSlogan, setShowSlogan] = useState(true); 
  const fileReader = useRef(null);

  useEffect(() => {
    if (pages.length > 0 && pages[0].id !== currentPage) {
      setCurrentPage(pages[0].id); 
    }
  }, [pages]);

  const addPage = () => {
    const newPage = { id: Date.now(), notes: [], images: [] };
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), pages];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setPages([newPage]);
    setCurrentPage(newPage.id);
    setShowSlogan(false); 
  };

  const addNote = () => {
    const updatedPages = pages.map(page => {
      if (page.id === currentPage) {
        return { ...page, notes: [...page.notes, { text: "", id: Date.now() }] };
      }
      return page;
    });
    updateHistory(updatedPages);
    setShowSlogan(false); 
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedPages = pages.map(page => {
          if (page.id === currentPage) {
            const newImages = [...page.images, { src: e.target.result, id: Date.now() }];
            return { ...page, images: newImages };
          }
          return page;
        });
        updateHistory(updatedPages);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const updateNote = (noteId, text) => {
    const updatedPages = pages.map(page => {
      if (page.id === currentPage) {
        const updatedNotes = page.notes.map(note => {
          if (note.id === noteId) {
            return { ...note, text };
          }
          return note;
        });
        return { ...page, notes: updatedNotes };
      }
      return page;
    });
    updateHistory(updatedPages);
    setShowSlogan(false); 
  };

  const updateHistory = (newPages) => {
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), newPages];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setPages(newPages);
    setShowSlogan(false); 
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      setPages(history[currentHistoryIndex - 1]);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setShowSlogan(false); 
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setPages(history[currentHistoryIndex + 1]);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setShowSlogan(false); 
    }
  };

  const saveNotes = () => {
    const fileData = JSON.stringify(pages);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pages.json';
    link.click();
    setShowSlogan(false); 
  };

  const loadFile = (event) => {
    const file = event.target.files[0];
    fileReader.current = new FileReader();
    fileReader.current.onloadend = handleFileRead;
    fileReader.current.readAsText(file);
    setShowSlogan(false); 
  };

  const handleFileRead = () => {
    const content = fileReader.current.result;
    let newPages = JSON.parse(content);
    // Ensure each page has notes and images array
    newPages = newPages.map(page => ({
      ...page,
      notes: page.notes || [],
      images: page.images || []
    }));
    updateHistory(newPages);
    if (newPages.length > 0) {
      setCurrentPage(newPages[0].id);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>MyNote</h1>
      </header>
      {showSlogan && <p>Make it easier to take notes!</p>}
      <div className="toolbar">
        <button onClick={addPage}>Add Page</button>
        <button onClick={() => document.querySelector('input[type="file"]').click()}>Load JSON</button>
        <button onClick={addNote} disabled={!currentPage}>Add TextBox</button>
        <button onClick={addImage} disabled={!currentPage}>Add Image</button>
        
        <input type="file" onChange={loadFile} style={{ display: 'none' }} />
        
        <button onClick={saveNotes}>Save Pages</button>
        <button onClick={undo} disabled={currentHistoryIndex <= 0}>Undo</button>
        <button onClick={redo} disabled={currentHistoryIndex >= history.length - 1}>Redo</button>
      </div>
      <div className="pages-container">
        {pages.filter(page => page.id === currentPage).map(page =>
          <div key={page.id} className="page">
            {page.notes.map(note => (
              <textarea
                key={note.id}
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                className="note-textarea"
              />
            ))}
            {page.images.map(image => (
              <img key={image.id} src={image.src} alt="" style={{ maxWidth: '100%', height: 'auto' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
