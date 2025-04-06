import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FaVideo } from "react-icons/fa"; // Video Icon Import Karo

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(false);
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]'>
      {/* Logo */}
      <img onClick={() => navigate('/')} className='w-60 cursor-pointer' src={assets.logo} alt="Logo" />

      {/* Navbar Links */}
      <ul className='md:flex items-center gap-5 font-large hidden'>
        <NavLink to='/'><li className='py-1'>HOME</li></NavLink>
        <NavLink to='/doctors'><li className='py-1'>ALL DOCTORS</li></NavLink>
        <NavLink to='/about'><li className='py-1'>ABOUT</li></NavLink>
        <NavLink to='/contact'><li className='py-1'>CONTACT</li></NavLink>
        <NavLink to='/img-ocr'><li className='py-1'>OCR</li></NavLink>

        {/* Separator (|) */}
        <span className='text-gray-400'>|</span>

        {/* Video Call Button */}
        <NavLink to="/video-call">
          <li className="py-1 flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800">
            <FaVideo size={18} />
            VIDEO CALL
          </li>
        </NavLink>
      </ul>

      {/* Right Side Section */}
      <div className='flex items-center gap-4'>
        {token && userData ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full' src={userData.image} alt="User" />
            <img className='w-2.5' src={assets.dropdown_icon} alt="Dropdown" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-gray-50 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-gray-800 text-white px-8 py-3 rounded-full font-light hidden md:block'>
            Create account
          </button>
        )}
        
        {/* Mobile Menu Icon */}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="Menu" />
      </div>

      {/* ---- Mobile Menu ---- */}
      <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
        <div className='flex items-center justify-between px-5 py-6'>
          <img src={assets.logo} className='w-36' alt="Logo" />
          <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="Close Menu" />
        </div>
        <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
          <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2'>HOME</p></NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-4 py-2'>ALL DOCTORS</p></NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2'>ABOUT</p></NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-4 py-2'>CONTACT</p></NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/img-ocr' ><p className='px-4 py-2'>OCR</p></NavLink>
          
          {/* Separator */}
          <span className='text-gray-400'>|</span>

          {/* Video Call Option in Mobile Menu */}
          <NavLink onClick={() => setShowMenu(false)} to='/video-call'>
            <p className='px-4 py-2 flex items-center gap-2 text-blue-600'>
              <FaVideo size={20} /> VIDEO CALL
            </p>
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
