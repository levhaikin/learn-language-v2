import React, { useRef, useState } from 'react';
import { StoreItem, UserProgress } from '../types';
import { useSound } from '../hooks/useSound';
import { swooshSound } from '../assets/sounds/swoosh';

export const storeItems: StoreItem[] = [
  {
    id: 'wizard',
    name: 'Wise Wizard',
    image: '🧙‍♂️',
    description: 'A magical character that helps you learn spells (words)',
    price: {
      accuracyPoints: 100,
      speedPoints: 50,
    },
  },
  {
    id: 'dragon',
    name: 'Friendly Dragon',
    image: '🐉',
    description: 'A dragon that breathes knowledge instead of fire',
    price: {
      accuracyPoints: 150,
      speedPoints: 75,
    },
  },
  {
    id: 'unicorn',
    name: 'Grammar Unicorn',
    image: '🦄',
    description: 'A magical unicorn that helps you perfect your grammar',
    price: {
      accuracyPoints: 200,
      speedPoints: 100,
    },
  },
  {
    id: 'harry',
    name: 'Harry Potter',
    image: '⚡',
    description: 'The Boy Who Lived, ready to help you master English spells!',
    price: {
      accuracyPoints: 250,
      speedPoints: 125,
    },
  },
  {
    id: 'percy',
    name: 'Percy Jackson',
    image: '🌊',
    description: 'Son of Poseidon, making learning English as epic as Greek myths!',
    price: {
      accuracyPoints: 300,
      speedPoints: 150,
    },
  },
  {
    id: 'captain',
    name: 'Captain Underpants',
    image: '🦸‍♂️',
    description: 'The superhero who makes learning English super fun!',
    price: {
      accuracyPoints: 175,
      speedPoints: 75,
    },
  },
  {
    id: 'mask',
    name: 'The Mask',
    image: '😈',
    description: 'SMOKIN\'! This character makes learning English wild and wacky!',
    price: {
      accuracyPoints: 225,
      speedPoints: 100,
    },
  },
  {
    id: 'steve',
    name: 'Steve from Minecraft',
    image: '⛏️',
    description: 'Ready to mine for knowledge and craft perfect sentences!',
    price: {
      accuracyPoints: 275,
      speedPoints: 125,
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
  const { play: playSwoosh } = useSound(swooshSound);

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
    setIsOpen(!isOpen);
    playSwoosh();
  };

  return (
    <div className={`store-drawer ${!isOpen ? 'closed' : ''}`}>
      <button className="store-drawer-tab" onClick={toggleDrawer}>
        <span>Character Store 🏪</span>
        <span className="arrow">{isOpen ? '↓' : '↑'}</span>
      </button>
      <div className="store">
        <h2>🏪 Character Store</h2>
        <div className="points-display">
          <p>⭐ {userProgress.accuracyPoints} Accuracy Points</p>
          <p>⚡ {userProgress.speedPoints} Speed Points</p>
        </div>
        <div className="store-items" ref={storeItemsRef}>
          {storeItems.map((item) => {
            const isOwned = userProgress.ownedItems.includes(item.id);
            const sellPrice = getSellPrice(item);

            return (
              <div key={item.id} className="store-item">
                <div className="item-image">{item.image}</div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
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