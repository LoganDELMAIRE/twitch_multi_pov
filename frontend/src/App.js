import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } from './config';
import './components/styles/variables.css';
import './components/styles/common.css';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import { MdDragIndicator, MdClose } from 'react-icons/md';
import Overlay from './components/overlay/overlay';
import { FiMessageSquare, FiMessageCircle } from 'react-icons/fi';
import CookieConsent from './components/CookieConsent/CookieConsent';

const TWITCH_AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=token&scope=user:read:follows user:read:subscriptions`;

// Composant Stream séparé
const Stream = React.memo(({ streamName, userAccessToken }) => {
  const iframeRef = useRef(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      const params = new URLSearchParams({
        channel: streamName,
        parent: window.location.hostname,
        ...(userAccessToken && { auth_token: userAccessToken })
      });

      iframeRef.current.src = `https://player.twitch.tv/?${params.toString()}`;
    }
  }, [streamName, userAccessToken]);

  return (
    <div className={`stream-content ${showChat ? 'with-chat' : ''}`}>
      <div className="stream-player">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          allowFullScreen={true}
          title={streamName}
        />
      </div>
      {showChat && (
        <div className="stream-chat">
          <iframe
            src={`https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${userAccessToken ? `&token=${userAccessToken}` : ''}`}
            height="100%"
            width="100%"
            title={`Chat ${streamName}`}
          />
        </div>
      )}
      <button 
        className="chat-toggle"
        onClick={() => setShowChat(!showChat)}
        title={showChat ? "Masquer le chat" : "Afficher le chat"}
      >
        {showChat ? <FiMessageSquare size={20} /> : <FiMessageCircle size={20} />}
      </button>
    </div>
  );
});

function App() {
  // Fonction utilitaire pour vérifier si on peut utiliser le localStorage
  const canUseStorage = () => {
    const cookieChoice = localStorage.getItem('cookie_choice');
    return cookieChoice === 'accepted';
  };

  const [streams, setStreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [streamsPerRow, setStreamsPerRow] = useState(2);
  const [accessToken, setAccessToken] = useState(null);
  const [userAccessToken, setUserAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (canUseStorage()) {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const authenticate = async () => {
      try {
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: TWITCH_CLIENT_ID,
            client_secret: TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
          })
        });
        
        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
      }
    };

    authenticate();
  }, []);

  // Charger les streams sauvegardés au démarrage
  useEffect(() => {
    if (canUseStorage()) {
      const savedStreams = localStorage.getItem('savedStreams');
      if (savedStreams) {
        setStreams(JSON.parse(savedStreams));
      }
    }
  }, []);

  // Sauvegarder les streams quand ils changent
  useEffect(() => {
    if (canUseStorage()) {
      localStorage.setItem('savedStreams', JSON.stringify(streams));
    }
  }, [streams]);

  // Sauvegarder la disposition des colonnes
  useEffect(() => {
    if (canUseStorage()) {
      localStorage.setItem('streamsPerRow', streamsPerRow);
    }
  }, [streamsPerRow]);

  // Charger la disposition des colonnes au démarrage
  useEffect(() => {
    if (canUseStorage()) {
      const savedLayout = localStorage.getItem('streamsPerRow');
      if (savedLayout) {
        setStreamsPerRow(Number(savedLayout));
      }
    }
  }, []);

  // Mettre à jour la variable CSS pour le nombre de colonnes
  useEffect(() => {
    document.documentElement.style.setProperty('--streams-per-row', streamsPerRow);
  }, [streamsPerRow]);

  // Vérifier le hash de l'URL pour le token après connexion
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.match(/access_token=([^&]*)/)?.[1];
      if (token) {
        setUserAccessToken(token);
        window.location.hash = '';
        localStorage.setItem('twitch_token', token);
      }
    } else {
      const savedToken = localStorage.getItem('twitch_token');
      if (savedToken) {
        setUserAccessToken(savedToken);
      }
    }
  }, []);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userAccessToken) return;

      try {
        const response = await fetch('https://api.twitch.tv/helix/users', {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${userAccessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data[0]);
        } else if (response.status === 401) {
          // Token expiré ou invalide
          handleLogout();
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos utilisateur:', error);
      }
    };

    fetchUserInfo();
  }, [userAccessToken]);

  // Appliquer le thème au chargement et quand il change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (canUseStorage()) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // D'abord, rechercher les chaînes
      const searchResponse = await fetch(
        `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=10`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();
      const channels = searchData.data;

      // Récupérer les informations de stream pour ces chaînes
      const streamsResponse = await fetch(
        `https://api.twitch.tv/helix/streams?${channels.map(channel => `user_id=${channel.id}`).join('&')}`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const streamsData = await streamsResponse.json();
      const liveStreams = new Set(streamsData.data.map(stream => stream.user_id));

      // Combiner et trier les résultats (live en premier)
      const sortedResults = channels
        .map(channel => ({
          id: channel.id,
          name: channel.display_name,
          isLive: liveStreams.has(channel.id),
          profileImage: channel.thumbnail_url
        }))
        .sort((a, b) => {
          if (a.isLive && !b.isLive) return -1;
          if (!a.isLive && b.isLive) return 1;
          return 0;
        });

      setSuggestions(sortedResults);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSuggestions([]);
    }
  };

  const handleStreamSelect = (stream) => {
    if (!streams.find(s => s.id === stream.id)) {
      const newStreams = [...streams, stream];
      setStreams(newStreams);
    }
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleStreamRemove = (streamId) => {
    setStreams(streams.filter(stream => stream.id !== streamId));
  };

  const handleClearAll = () => {
    setStreams([]);
    localStorage.removeItem('savedStreams');
    localStorage.removeItem('streamsPerRow');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(streams);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setStreams(items);
  };

  const handleLogin = () => {
    window.location.href = TWITCH_AUTH_URL;
  };

  const handleLogout = () => {
    setUserAccessToken(null);
    setUserInfo(null);
    localStorage.removeItem('twitch_token');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="App">
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        suggestions={suggestions}
        onStreamSelect={handleStreamSelect}
        streamsPerRow={streamsPerRow}
        onStreamsPerRowChange={setStreamsPerRow}
        onClearAll={handleClearAll}
        streamsCount={streams.length}
        userInfo={userInfo}
        onLogin={handleLogin}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <div className="streams-wrapper">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" direction="vertical">
            {(provided) => (
              <div 
                className="streams-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {streams.map((stream, index) => (
                  <Draggable 
                    key={stream.id} 
                    draggableId={stream.id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="stream-wrapper"
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div className={`stream-window ${snapshot.isDragging ? 'dragging' : ''}`}>
                          <div className="stream-header" {...provided.dragHandleProps}>
                            <div className="stream-drag-handle">
                              <MdDragIndicator size={20} />
                            </div>
                            <span className="stream-title">{stream.name}</span>
                            <button 
                              className="remove-stream"
                              onClick={() => handleStreamRemove(stream.id)}
                              aria-label="Supprimer le stream"
                            >
                              <MdClose size={20} />
                            </button>
                          </div>
                          <Stream 
                            streamName={stream.name} 
                            userAccessToken={userAccessToken}
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <Overlay 
        onLogin={handleLogin} 
        isVisible={!userAccessToken && streams.length > 0}
      />
      <CookieConsent />
    </div>
  );
}

export default App;
