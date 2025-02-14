import React from 'react';
import './Home.css';

const Home = ({ streams, streamsPerRow }) => {
  return (
    <div className="home">
      <div className="streams-container" style={{ gridTemplateColumns: `repeat(${streamsPerRow}, 1fr)` }}>
        {streams.map((stream) => (
          <div key={stream.id} className="stream-window">
            <iframe
              src={`https://player.twitch.tv/?channel=${stream.name}&parent=${window.location.hostname}`}
              height="100%"
              width="100%"
              allowFullScreen={true}
              title={stream.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 