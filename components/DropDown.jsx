import React, { useState, useRef, useEffect } from 'react';

const DropDown = ({ label, options, selectedValue, setValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (option) => {
    setValue(option.toLowerCase()); // Update context with selected value
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="relative inline-block text-left font-poppins" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropDown}
        className="flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {selectedValue ? selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1) : label}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-20 top-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out transform"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
        >
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(option)}
                role="menuitem"
                tabIndex={0}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900 cursor-pointer ${
                  selectedValue.toLowerCase() === option.toLowerCase() ? 'bg-indigo-50 font-semibold' : ''
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDown;