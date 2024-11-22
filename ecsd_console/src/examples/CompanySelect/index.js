import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function PopupSelection() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  const items = ['Option 1', 'Option 2', 'Option 3'];

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleSelect = (event) => {
    setSelectedItem(event.target.value);
  };

  return (
    <div>
      <button onClick={togglePopup}>GUI Select
      </button>
      {showPopup && (
        <div style={popupStyles.overlay}>
          <div style={popupStyles.popup}>
            <h2>Select an Item</h2>
            <select value={selectedItem} onChange={handleSelect} style={popupStyles.select}>
              <option value="" disabled>
                Choose an option
              </option>
              {items.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p>Selected: {selectedItem}</p>
            <button onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

  

const popupStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
  },
  select: {
    margin: '10px 0',
    padding: '5px',
    width: '100%',
  },
};

export default PopupSelection;

// To render the component
ReactDOM.render(<PopupSelection />, document.getElementById('root'));
