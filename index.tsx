import React, { useState, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShoppingCart, 
  X, 
  Globe, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Trash2, 
  LayoutDashboard,
  Box,
  Truck,
  Home,
  Grid,
  User,
  ShoppingBag,
  Lock,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';

// --- TYPES ---
type Language = 'fa' | 'en';
type Currency = 'USD' | 'IRT';
type OrderStatus = 'Pending' | 'Approved' | 'Shipped' | 'Completed';
type ViewType = 'home' | 'product' | 'cart' | 'checkout' | 'admin' | 'success';

interface Product {
  id: string;
  name_fa: string;
  name_en: string;
  price_usd: number;
  discount: number;
  category: string;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  active: boolean;
}

interface Order {
  id: string;
  customer: any;
  items: any[];
  total_usd: number;
  total_irt: number;
  status: OrderStatus;
  createdAt: string;
}

// --- MOCK DATA ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name_fa: 'کت چرمی بالنسیاگا نئو',
    name_en: 'Balenciaga Neo Leather Jacket',
    price_usd: 1200,
    discount: 15,
    category: 'Jackets',
    stock: 5,
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'],
    active: true
  },
  {
    id: '2',
    name_fa: 'کتانی نایک ایر مکس ۲۰۲۵',
    name_en: 'Nike Air Max 2025 Future',
    price_usd: 210,
    discount: 0,
    category: 'Shoes',
    stock: 12,
    sizes: ['40', '41', '42', '43'],
    colors: ['Volt Glow', 'Obsidian'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
    active: true
  },
  {
    id: '3',
    name_fa: 'عینک آفتابی سایبرپانک',
    name_en: 'Cyberpunk Shield Shades',
    price_usd: 350,
    discount: 10,
    category: 'Accessories',
    stock: 20,
    sizes: ['One Size'],
    colors: ['Chrome', 'Neon'],
    images: ['https://images.unsplash.com/photo-1511499767390-90342f16b147?auto=format&fit=crop&q=80&w=800'],
    active: true
  },
  {
    id: '4',
    name_fa: 'هودی اورسایز مینیمال',
    name_en: 'Minimalist Oversized Hoodie',
    price_usd: 85,
    discount: 5,
    category: 'Clothing',
    stock: 30,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Off-White', 'Slate'],
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
    active: true
  }
];

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  fa: {
    home: 'خانه',
    categories: 'دسته‌بندی‌ها',
    cart: 'سبد خرید',
    admin: 'پنل مدیریت',
    currency: 'تومان',
    usd: 'دلار',
    search: 'جستجو در کالکشن...',
    addToCart: 'افزودن به سبد',
    sizes: 'سایز',
    total: 'مجموع کل',
    checkout: 'پرداخت نهایی',
    firstName: 'نام',
    address: 'آدرس تحویل',
    confirmOrder: 'تایید و ثبت سفارش',
    successMsg: 'سفارش شما با موفقیت ثبت شد!',
    adminLogin: 'ورود به بخش مدیریت',
    passcode: 'رمز عبور',
    login: 'ورود',
    logout: 'خروج',
    dashboard: 'داشبورد',
    products: 'محصولات',
    orders: 'سفارشات',
    emptyCart: 'سبد خرید شما خالی است',
    all: 'همه',
    jackets: 'ژاکت‌ها',
    shoes: 'کفش‌ها',
    accessories: 'اکسسوری‌ها',
    clothing: 'لباس‌ها'
  },
  en: {
    home: 'Home',
    categories: 'Categories',
    cart: 'Shopping Cart',
    admin: 'Admin Panel',
    currency: 'IRT',
    usd: 'USD',
    search: 'Search collection...',
    addToCart: 'Add to Cart',
    sizes: 'Sizes',
    total: 'Total Amount',
    checkout: 'Checkout Now',
    firstName: 'First Name',
    address: 'Shipping Address',
    confirmOrder: 'Confirm & Place Order',
    successMsg: 'Order placed successfully!',
    adminLogin: 'Secure Admin Login',
    passcode: 'Passcode',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    emptyCart: 'Your cart is empty',
    all: 'All',
    jackets: 'Jackets',
    shoes: 'Shoes',
    accessories: 'Accessories',
    clothing: 'Clothing'
  }
};

// --- 3D COMPONENTS ---
const HeroScene = () => (
  <mesh>
    <sphereGeometry args={[1, 64, 64]} />
    <MeshDistortMaterial
      color="#06b6d4"
      emissive="#06b6d4"
      emissiveIntensity={0.2}
      metalness={0.8}
      roughness={0.2}
      distort={0.4}
      speed={2}
    />
  </mesh>
);

// --- MAIN APPLICATION ---
export default function App() {
  const [lang, setLang] = useState<Language>('fa');
  const [view, setView] = useState<ViewType>('home');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [exchangeRate] = useState(65000);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    document.body.className = isRTL ? 'rtl' : 'ltr';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang]);

  const convertToIRT = (usd: number) => usd * exchangeRate;
  const formatPrice = (usd: number) => {
    const val = convertToIRT(usd);
    return val.toLocaleString(isRTL ? 'fa-IR' : 'en-US') + ' ' + t.currency;
  };

  const products = INITIAL_PRODUCTS;
  const cartItems = cart.map(item => ({
    product: products.find(p => p.id === item.productId)!,
    quantity: item.quantity
  })).filter(i => i.product);

  const cartTotalUsd = cartItems.reduce((acc, curr) => acc + (curr.product.price_usd * (1 - curr.product.discount/100) * curr.quantity), 0);

  const handleAddToCart = (id: string) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === id);
      if (exists) return prev.map(i => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: id, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleAdminLogin = () => {
    if (passcode === '2025') {
      const token = Math.random().toString(36).substring(7).toUpperCase();
      setAdminToken(token);
      setShowAdminLogin(false);
      setView('admin');
      setPasscode('');
    } else {
      alert(isRTL ? 'رمز اشتباه است' : 'Incorrect passcode');
    }
  };

  const placeOrder = () => {
    const newOrder: Order = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      customer: {},
      items: cart,
      total_usd: cartTotalUsd,
      total_irt: convertToIRT(cartTotalUsd),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('success');
  };

  // --- VIEWS ---
  const HomeView = () => (
    <div className="pt-20">
      {/* 3D Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
            <Suspense fallback={null}>
              <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <HeroScene />
              </Float>
            </Suspense>
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
        <div className="relative z-10 text-center space-y-4 px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter"
          >
            FUTURE <span className="text-gradient">FASHION</span>
          </motion.h2>
          <p className={`text-slate-500 uppercase text-xs font-bold ${isRTL ? '' : 'tracking-widest'}`}>
            {isRTL ? 'کالکشن جدید ۲۰۲۵ - بوتیک آینده' : 'New Collection 2025 - The Future Boutique'}
          </p>
          <button 
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className={`mt-6 px-10 py-3 btn-gradient rounded-full font-bold uppercase text-[10px] ${isRTL ? '' : 'tracking-widest'}`}
          >
            {isRTL ? 'مشاهده محصولات' : 'Explore Catalog'}
          </button>
        </div>
      </section>

      {/* Product Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-12 pb-32">
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {['All', 'Jackets', 'Shoes', 'Accessories', 'Clothing'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${category === cat ? 'btn-gradient' : 'bg-white border border-slate-200 text-slate-500 hover:border-cyan-500'}`}
            >
              {t[cat.toLowerCase() as keyof typeof t] || cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => category === 'All' || p.category === category).map(p => (
            <motion.div 
              key={p.id}
              whileHover={{ y: -5 }}
              className="glass p-2 rounded-2xl group cursor-pointer"
              onClick={() => { setSelectedProductId(p.id); setView('product'); window.scrollTo(0,0); }}
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-200 relative">
                <img src={p.images[0]} alt={p.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {p.discount > 0 && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">-{p.discount}%</span>}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{isRTL ? p.name_fa : p.name_en}</h3>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-cyan-600 font-bold">{formatPrice(p.price_usd * (1 - p.discount/100))}</p>
                    {p.discount > 0 && <p className="text-slate-400 text-xs line-through">{formatPrice(p.price_usd)}</p>}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(p.id); }}
                    className="p-2 bg-slate-100 rounded-full hover:bg-cyan-100 hover:text-cyan-600 transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );

  const ProductView = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return null;

    return (
      <div className="pt-24 px-6 max-w-6xl mx-auto pb-32">
        <button onClick={() => setView('home')} className="mb-6 flex items-center text-slate-500 hover:text-cyan-600">
          {isRTL ? <ArrowRight className="ml-2" size={16} /> : <ChevronRight className="mr-2" size={16} />}
          {isRTL ? 'بازگشت' : 'Back'}
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-200">
            <img src={product.images[0]} alt={product.name_en} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-black">{isRTL ? product.name_fa : product.name_en}</h1>
            <div className="text-2xl font-bold text-cyan-600">
              {formatPrice(product.price_usd * (1 - product.discount/100))}
            </div>
            
            <div>
              <h4 className="font-bold mb-2">{t.sizes}</h4>
              <div className="flex gap-2">
                {product.sizes.map(s => (
                  <button key={s} className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold hover:border-cyan-500">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleAddToCart(product.id)}
              className="w-full py-4 btn-gradient rounded-xl font-bold text-lg mt-8"
            >
              {t.addToCart}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CartSidebar = () => (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
            onClick={() => setCartOpen(false)}
          />
          <motion.div 
            initial={{ x: isRTL ? '-100%' : '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: isRTL ? '-100%' : '100%' }}
            className={`fixed top-0 bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col`}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> {t.cart}</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">{t.emptyCart}</div>
              ) : (
                cartItems.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center bg-slate-50 p-2 rounded-xl">
                    <img src={item.product.images[0]} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{isRTL ? item.product.name_fa : item.product.name_en}</h4>
                      <p className="text-cyan-600 font-bold text-sm">{formatPrice(item.product.price_usd * (1 - item.product.discount/100))}</p>
                      <div className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</div>
                    </div>
                    <button 
                      onClick={() => setCart(prev => prev.filter(i => i.productId !== item.product.id))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t bg-slate-50">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>{t.total}</span>
                  <span className="text-cyan-600">{formatPrice(cartTotalUsd)}</span>
                </div>
                <button 
                  onClick={() => { setCartOpen(false); setView('checkout'); }}
                  className="w-full py-4 btn-gradient rounded-xl font-bold"
                >
                  {t.checkout}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const CheckoutView = () => (
    <div className="pt-24 px-6 max-w-3xl mx-auto pb-32">
      <h1 className="text-3xl font-black mb-8">{t.checkout}</h1>
      <div className="glass p-8 rounded-3xl space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t.firstName}</label>
          <input type="text" className="w-full p-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">{t.address}</label>
          <textarea className="w-full p-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none" rows={3}></textarea>
        </div>
        <div className="pt-6 border-t">
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>{t.total}</span>
            <span className="text-cyan-600">{formatPrice(cartTotalUsd)}</span>
          </div>
          <button onClick={placeOrder} className="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
            {t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="pt-32 px-6 text-center max-w-md mx-auto h-[70vh] flex flex-col items-center justify-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 mb-6">
        <CheckCircle size={80} />
      </motion.div>
      <h1 className="text-3xl font-black mb-4">{t.successMsg}</h1>
      <button onClick={() => setView('home')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold">
        {isRTL ? 'بازگشت به خانه' : 'Back to Home'}
      </button>
    </div>
  );

  const AdminView = () => {
    if (!adminToken) return null;
    return (
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-32 flex gap-8">
        <div className="w-64 hidden md:block space-y-2">
          <div className="p-4 bg-slate-900 text-white rounded-xl mb-6 font-bold flex items-center gap-2">
            <ShieldCheck /> {t.admin}
          </div>
          <button className="w-full text-left p-3 rounded-lg bg-cyan-50 text-cyan-700 font-bold flex items-center gap-2">
            <LayoutDashboard size={18} /> {t.dashboard}
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 font-bold flex items-center gap-2">
            <Box size={18} /> {t.products}
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 font-bold flex items-center gap-2">
            <ShoppingBag size={18} /> {t.orders}
          </button>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">{t.orders}</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-slate-500">No orders yet.</p>
            ) : (
              orders.map(o => (
                <div key={o.id} className="glass p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Order #{o.id}</p>
                    <p className="text-slate-500 text-sm">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-600">{formatPrice(o.total_usd)}</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold mt-2">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2"
            onClick={() => setView('home')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white">
              <Box size={18} />
            </div>
            buymina
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(l => l === 'fa' ? 'en' : 'fa')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{lang === 'fa' ? 'EN' : 'FA'}</span>
            </button>
            
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <User size={18} />
            </button>

            <button 
              onClick={() => setCartOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItems.reduce((a, c) => a + c.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative"
            >
              <button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X size={18}/></button>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-900">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-black mb-6">{t.adminLogin}</h2>
              <input 
                type="password" 
                placeholder={t.passcode}
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none mb-4 text-center tracking-widest text-lg"
              />
              <p className="text-xs text-slate-500 mb-6 text-center">Hint: 2025</p>
              <button onClick={handleAdminLogin} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">
                {t.login}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CartSidebar />

      {/* Main Content Area */}
      <main>
        {view === 'home' && <HomeView />}
        {view === 'product' && <ProductView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'success' && <SuccessView />}
        {view === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2025 buymina. All rights reserved.</p>
          <p className="mt-2 text-xs">Premium Futuristic Fashion E-commerce</p>
        </div>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
