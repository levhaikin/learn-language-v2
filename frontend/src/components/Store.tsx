import React, { useRef, useState } from 'react';
import { StoreItem, UserProgress } from '../types';
import { useSound } from '../hooks/useSound';
import openSwoosh from '../assets/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-1-149889.mp3';
import closeSwoosh from '../assets/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-3-149888.mp3';

export const storeItems: StoreItem[] = [
  {
    id: 'wizard',
    name: 'Wise Wizard',
    image: '/icons/wizard.png',
    description: 'A magical character that helps you learn spells (words)',
    price: {
      accuracyPoints: 100,
      speedPoints: 50,
    },
    bonus: {
      accuracyPoints: 2,
      speedPoints: 1,
    },
  },
  {
    id: 'wooden-stick',
    name: 'Wooden Stick',
    image: '/icons/wooden-stick.png',
    description: 'A trusty wooden stick to help you poke at difficult words',
    price: {
      accuracyPoints: 50,
      speedPoints: 25,
    },
    bonus: {
      accuracyPoints: 1,
      speedPoints: 0,
    },
  },
  {
    id: 'dragon',
    name: 'Friendly Dragon',
    image: '/icons/dragon.png',
    description: 'A dragon that breathes knowledge instead of fire',
    price: {
      accuracyPoints: 150,
      speedPoints: 75,
    },
    bonus: {
      accuracyPoints: 0,
      speedPoints: 3,
    },
  },
  {
    id: 'harry',
    name: 'Harry Potter',
    image: '/icons/thunder.png',
    description: 'The Boy Who Lived, ready to help you master English spells!',
    price: {
      accuracyPoints: 250,
      speedPoints: 125,
    },
    bonus: {
      accuracyPoints: 4,
      speedPoints: 2,
    },
  },
  {
    id: 'percy',
    name: 'Percy Jackson',
    image: '/icons/wave.png',
    description: 'Son of Poseidon, making learning English as epic as Greek myths!',
    price: {
      accuracyPoints: 300,
      speedPoints: 150,
    },
    bonus: {
      accuracyPoints: 2,
      speedPoints: 4,
    },
  },
  {
    id: 'captain',
    name: 'Captain Underpants',
    image: '/icons/underwear.png',
    description: 'The superhero who makes learning English super fun!',
    price: {
      accuracyPoints: 175,
      speedPoints: 75,
    },
    bonus: {
      accuracyPoints: 1,
      speedPoints: 2,
    },
  },
  {
    id: 'mask',
    name: 'The Mask',
    image: '/icons/mask.png',
    description: 'SMOKIN\'! This character makes learning English wild and wacky!',
    price: {
      accuracyPoints: 225,
      speedPoints: 100,
    },
    bonus: {
      accuracyPoints: 3,
      speedPoints: 1,
    },
  },
  {
    id: 'steve',
    name: 'Steve from Minecraft',
    image: '/icons/tools.png',
    description: 'Ready to mine for knowledge and craft perfect sentences!',
    price: {
      accuracyPoints: 275,
      speedPoints: 125,
    },
    bonus: {
      accuracyPoints: 2,
      speedPoints: 2,
    },
  },
];

interface StoreProps {
  userProgress: UserProgress;
  onPurchase: (itemId: string) => void;
  onSell: (itemId: string) => void;
}

const Store: React.FC<StoreProps> = ({ userProgress, onPurchase, onSell }) => {
  const storeItemsRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [spinningItems, setSpinningItems] = useState<Set<string>>(new Set());
  const { play: playOpen } = useSound(openSwoosh);
  const { play: playClose } = useSound(closeSwoosh);

  const canAfford = (item: StoreItem) => {
    return (
      userProgress.accuracyPoints >= item.price.accuracyPoints &&
      userProgress.speedPoints >= item.price.speedPoints
    );
  };

  const getSellPrice = (item: StoreItem) => {
    // Return 70% of the original price (rounded down)
    return {
      accuracyPoints: Math.floor(item.price.accuracyPoints * 0.7),
      speedPoints: Math.floor(item.price.speedPoints * 0.7)
    };
  };

  const scrollLeft = () => {
    if (storeItemsRef.current) {
      storeItemsRef.current.scrollBy({
        left: -280,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (storeItemsRef.current) {
      storeItemsRef.current.scrollBy({
        left: 280,
        behavior: 'smooth'
      });
    }
  };

  const toggleDrawer = () => {
    if (isOpen) {
      playClose();
    } else {
      playOpen();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`store-drawer ${!isOpen ? 'closed' : ''}`}>
      <button className="store-drawer-tab" onClick={toggleDrawer}>
        <span>Character Store 🏪</span>
      </button>
      <div className="store">
        <h2>🏪 Character Store</h2>
        <div className="points-display">
          <p>⭐ {userProgress.accuracyPoints} Accuracy Points</p>
          <p>⚡ {userProgress.speedPoints} Speed Points</p>
        </div>
        <div
          className="store-items"
          ref={storeItemsRef}
          onWheel={(e) => {
            if (!storeItemsRef.current) return;
            // Prevent vertical page scroll when hovering over the store items
            e.preventDefault();
            storeItemsRef.current.scrollBy({
              left: e.deltaY < 0 ? -500 : 500,
              behavior: 'smooth',
            });
          }}
          style={{ overflowY: 'hidden' }}
        >
          {storeItems.map((item) => {
            const isOwned = userProgress.ownedItems.includes(item.id);
            const sellPrice = getSellPrice(item);

            return (
              <div key={item.id} className="store-item">
                <div
                  className={`item-image ${spinningItems.has(item.id) ? 'spin' : ''}`}
                  onClick={() => {
                    setSpinningItems(prev => new Set(prev).add(item.id));
                  }}
                  onAnimationEnd={() => {
                    setSpinningItems(prev => {
                      const updated = new Set(prev);
                      updated.delete(item.id);
                      return updated;
                    });
                  }}
                >
                  {item.image.startsWith('/') ? (
                    <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                  ) : (
                    item.image
                  )}
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                {item.bonus && (item.bonus.accuracyPoints || item.bonus.speedPoints) ? (
                  <div className="item-bonus" style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#2e7d32' }}>
                    <p style={{ margin: 0 }}>Bonus:</p>
                    {item.bonus.accuracyPoints ? (
                      <p style={{ margin: 0 }}>+⭐ {item.bonus.accuracyPoints}</p>
                    ) : null}
                    {item.bonus.speedPoints ? (
                      <p style={{ margin: 0 }}>+⚡ {item.bonus.speedPoints}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="item-price">
                  {isOwned ? (
                    <>
                      <p>Sell for:</p>
                      <p>⭐ {sellPrice.accuracyPoints}</p>
                      <p>⚡ {sellPrice.speedPoints}</p>
                    </>
                  ) : (
                    <>
                      <p>Buy for:</p>
                      <p>⭐ {item.price.accuracyPoints}</p>
                      <p>⚡ {item.price.speedPoints}</p>
                    </>
                  )}
                </div>
                {isOwned ? (
                  <button
                    onClick={() => onSell(item.id)}
                    className="sell-button"
                  >
                    Sell
                  </button>
                ) : (
                  <button
                    onClick={() => onPurchase(item.id)}
                    disabled={!canAfford(item)}
                  >
                    {canAfford(item) ? 'Purchase' : 'Not enough points'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="carousel-controls">
          <button onClick={scrollLeft}>←</button>
          <button onClick={scrollRight}>→</button>
        </div>
      </div>
    </div>
  );
};

export default Store;