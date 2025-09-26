'use client'
import {
  PackageIcon,
  Search,
  ShoppingCart,
  MoreVertical,
  ChevronDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";
import Image from "next/image";
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const cartCount = useSelector((state) => state.cart.total);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const searchRef = useRef(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!search) return;
    router.push(`/shop?search=${encodeURIComponent(search)}`);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const goToCategory = (slug) => {
    setMobileMenuOpen(false);
    setMobileProductsOpen(false);
    router.push(`/shop?category=${encodeURIComponent(slug)}`);
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-3 md:py-4 transition-all">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-[160px]">
              <Image src={logo} alt="logo" width={160} height={48} style={{ objectFit: 'contain' }} />
            </div>
          </Link>

          {/* Desktop menu: Home, Hair Care, Skin Care, About, Contact */}
          <div className="hidden sm:flex items-center gap-6 md:gap-8">
            <nav className="flex items-center gap-6 text-slate-700">
              <Link href="/" className="relative group">
                Home
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-700 transition-all group-hover:w-full" />
              </Link>
              <Link href="/shop?category=hair-care" className="relative group">
                Hair Care
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-700 transition-all group-hover:w-full" />
              </Link>
              <Link href="/shop?category=skin-care" className="relative group">
                Skin Care
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-700 transition-all group-hover:w-full" />
              </Link>
              <Link href="/about" className="relative group">
                About
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-700 transition-all group-hover:w-full" />
              </Link>
              <Link href="/contact" className="relative group">
                Contact
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-700 transition-all group-hover:w-full" />
              </Link>
            </nav>

            {/* desktop search */}
            <form onSubmit={handleSearch} className="hidden xl:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <Search size={18} className="text-slate-600" />
              <input
                className="w-56 bg-transparent outline-none placeholder-slate-600 text-sm"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>

          {/* Right area */}
          <div className="flex items-center gap-3">
            {/* mobile: NO category buttons (removed) */}

            {/* Search icon (always visible) */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-slate-100"
                onClick={() => { setMobileSearchOpen((s) => !s); setMobileMenuOpen(false); }}
                aria-label="Open search"
              >
                {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {mobileSearchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-10 z-50 w-64 bg-white border rounded-md shadow-md p-2 flex items-center gap-2"
                >
                  <input
                    ref={searchRef}
                    className="w-full outline-none text-sm"
                    type="text"
                    placeholder="Search products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Go</button>
                </form>
              )}
            </div>

            {/* Cart (always visible, outside 3-dot) */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-100">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-0.5 text-[10px] text-white bg-slate-700 px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            </Link>

            {/* Desktop: Login / UserMenu */}
            <div className="hidden sm:flex items-center">
              {!user ? (
                <button onClick={openSignIn} className="ml-2 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm">
                  Login
                </button>
              ) : (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() => router.push("/orders")} />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </div>

            {/* 3-dot mobile menu */}
            <div className="sm:hidden relative">
              <button
                onClick={() => { setMobileMenuOpen((p) => !p); setMobileSearchOpen(false); }}
                className="p-2 rounded-full hover:bg-slate-100"
                aria-label="Open menu"
              >
                <MoreVertical size={22} />
              </button>

              {mobileMenuOpen && (
                <div className="absolute right-0 top-12 bg-white border shadow-lg rounded-lg w-56 z-50 p-2 flex flex-col text-sm">
                  {/* Products dropdown */}
                  <button
                    onClick={() => setMobileProductsOpen((v) => !v)}
                    className="flex items-center justify-between w-full p-2 hover:bg-slate-100 rounded"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className="flex items-center gap-2 font-medium">Products</span>
                    <ChevronDown size={16} className={`${mobileProductsOpen ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </button>

                  {mobileProductsOpen && (
                    <div className="pl-4 flex flex-col gap-1 mb-1">
                      <button onClick={() => goToCategory('hair-care')} className="text-sm p-2 text-left hover:bg-slate-100 rounded">Hair Care</button>
                      <button onClick={() => goToCategory('skin-care')} className="text-sm p-2 text-left hover:bg-slate-100 rounded">Skin Care</button>
                    </div>
                  )}

                  <Link href="/" className="p-2 hover:bg-slate-100 rounded">Home</Link>
                  <Link href="/about" className="p-2 hover:bg-slate-100 rounded">About</Link>
                  <Link href="/contact" className="p-2 hover:bg-slate-100 rounded">Contact</Link>

                  <div className="border-t my-1" />

                  <Link href="/cart" className="p-2 hover:bg-slate-100 rounded flex items-center gap-2">
                    <ShoppingCart size={16} /> Cart
                    <span className="ml-auto text-xs bg-slate-600 text-white px-1.5 py-0.5 rounded-full">{cartCount}</span>
                  </Link>

                  {user ? (
                    <button onClick={() => { setMobileMenuOpen(false); router.push('/orders'); }} className="p-2 hover:bg-slate-100 rounded flex items-center gap-2">
                      <PackageIcon size={16} /> My Orders
                    </button>
                  ) : (
                    <button onClick={() => { setMobileMenuOpen(false); openSignIn(); }} className="p-2 hover:bg-indigo-500 hover:text-white rounded">
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <hr className="border-gray-200" />
    </nav>
  );
};

export default Navbar;
