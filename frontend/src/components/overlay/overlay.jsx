import React from 'react';
import { FiLogIn, FiX } from 'react-icons/fi';
import './overlay.css';

const Overlay = ({ onLogin, isVisible }) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="overlay">
      <div className="overlay-content">
        <span className="overlay-text">
          Connectez-vous avec Twitch pour bénéficier de vos avantages d'abonnement.
        </span>
        <div className="overlay-buttons">
          <button onClick={onLogin} className="overlay-login-button">
            <FiLogIn size={20} />
            Se connecter
          </button>
          <button onClick={handleDismiss} className="overlay-dismiss-button" title="Fermer">
            <FiX size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
