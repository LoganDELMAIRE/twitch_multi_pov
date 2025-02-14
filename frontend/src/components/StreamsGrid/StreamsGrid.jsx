import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './StreamsGrid.css';

const StreamsGrid = ({ streams, streamsPerRow, onStreamRemove }) => {
  return (
    <Droppable droppableId="streams" direction="vertical">
      {(provided) => (
        <div 
          className="streams-container"
          style={{ gridTemplateColumns: `repeat(${streamsPerRow}, 1fr)` }}
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
                  className={`stream-window ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                  <div className="stream-header" {...provided.dragHandleProps}>
                    <div className="stream-drag-handle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6H16M8 12H16M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="stream-title">{stream.name}</span>
                    <button 
                      className="remove-stream"
                      onClick={() => onStreamRemove(stream.id)}
                      aria-label="Supprimer le stream"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <iframe
                    src={`https://player.twitch.tv/?channel=${stream.name}&parent=${window.location.hostname}`}
                    height="100%"
                    width="100%"
                    allowFullScreen={true}
                    title={stream.name}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default StreamsGrid; 