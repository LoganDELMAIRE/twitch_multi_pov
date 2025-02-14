import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './CookieConsent.css';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieChoice = localStorage.getItem('cookie_choice');
    if (!cookieChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_choice', 'accepted');
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_choice', 'declined');
    // On supprime les cookies existants si l'utilisateur refuse
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('savedStreams');
    localStorage.removeItem('streamsPerRow');
    localStorage.removeItem('theme');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <div className="cookie-text">
          <h3>Utilisation des cookies</h3>
          <p>
            Nous utilisons des cookies pour :
          </p>
          <ul>
            <li>Sauvegarder vos préférences de disposition</li>
            <li>Mémoriser vos streams favoris</li>
            <li>Maintenir votre session Twitch</li>
            <li>Améliorer votre expérience utilisateur</li>
          </ul>
          <p className="cookie-note">
            Sans cookies, vos préférences seront réinitialisées à chaque visite.
          </p>
        </div>
        <div className="cookie-buttons">
          <button onClick={handleAccept} className="cookie-accept">
            Accepter
          </button>
          <button onClick={handleDecline} className="cookie-decline">
            Continuer sans accepter
          </button>
        </div>
        <button onClick={handleDecline} className="cookie-dismiss">
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent; 