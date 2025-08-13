import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Truck, LogOut, LayoutGrid, Users, MapPin, Package, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `inline-flex items-center gap-2 px-3 py-2 rounded-lg transition
       ${isActive ? 'bg-white text-brand-700 shadow-soft' : 'text-white/90 hover:bg-white/10'}`
    }
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </NavLink>
);

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <div className="font-semibold leading-tight">GreenCart Logistics</div>
              <div className="text-xs opacity-80 -mt-0.5">Demo Manager</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavItem to="/" icon={LayoutGrid} label="Dashboard" />
            <NavItem to="/simulation" icon={Activity} label="Simulation" />
            <NavItem to="/drivers" icon={Users} label="Drivers" />
            <NavItem to="/routes" icon={MapPin} label="Routes" />
            <NavItem to="/orders" icon={Package} label="Orders" />
          </nav>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
