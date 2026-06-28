import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Plus, Loader2, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './CustomerChat.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STEPS = {
  IDLE: 'IDLE',
  MENU: 'MENU',
  QUANTITY: 'QUANTITY',
  ADDRESS: 'ADDRESS',
  SUMMARY: 'SUMMARY',
  PAYMENT: 'PAYMENT',
  SUCCESS: 'SUCCESS',
};

const API_BASE = import.meta.env.VITE_API_URL;

const SUGGESTIONS = [
  "Hi, show me the menu",
  "I want Chicken Pickle",
  "Order Karivepaku Podi",
  "What's available today?",
];

const ROTATING_PHRASES = [
  "Ask about today's menu",
  "Order homemade pickles",
  "Browse traditional sweets",
  "Place an order instantly",
  "Discover fresh podis",
];

const categoryImages = {
  Pickle: 'https://images.unsplash.com/photo-1598511796432-32d7b7e2d1a1?w=400&h=280&fit=crop',
  Sweets: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=280&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=280&fit=crop',
  Oils: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=280&fit=crop',
  Powders: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=280&fit=crop',
  Default: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=280&fit=crop',
};

function getImageForItem(item) {
  if (item.image_url) return item.image_url;
  
  const cat = (item.category || '').toLowerCase();
  if (cat.includes('pickle')) {
    return categoryImages.Pickle;
  }
  if (cat.includes('sweet') || cat.includes('laddu') || cat.includes('kajjikayalu')) {
    return categoryImages.Sweets;
  }
  if (cat.includes('snack') || cat.includes('janthikalu') || cat.includes('chekkalu')) {
    return categoryImages.Snacks;
  }
  if (cat.includes('oil')) {
    return categoryImages.Oils;
  }
  if (cat.includes('podi') || cat.includes('powder') || cat.includes('masala') || cat.includes('spice')) {
    return categoryImages.Powders;
  }
  return categoryImages.Default;
}

// ─── MESSAGE FACTORY ──────────────────────────────────────────────────────────
let msgIdCounter = 1;
function createBotMessage(payload) {
  return { id: msgIdCounter++, sender: 'bot', ...payload };
}
function createUserMessage(text) {
  return { id: msgIdCounter++, sender: 'user', text };
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ item, onSelect, disabled, delay = 0 }) {
  return (
    <motion.div
      className="ai-product-card"
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ai-product-img-container">
        <img src={getImageForItem(item)} alt={item.name} className="ai-product-img" loading="lazy" />
        <span className="ai-product-badge">Available</span>
      </div>
      <div className="ai-product-info">
        <span className="ai-product-category">{item.category}</span>
        <h4 className="ai-product-title">{item.name}</h4>
        <p className="ai-product-price">₹{Number(item.price).toFixed(2)}</p>
        <button className="ai-select-btn" onClick={() => onSelect(item)} disabled={disabled}>
          Select Item →
        </button>
      </div>
    </motion.div>
  );
}

function MenuCarousel({ menuItems, onSelect, disabled }) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterCategories = ['All', 'Pickles', 'Sweets', 'Snacks', 'Oils', 'Powders'];

  const getFilteredItems = () => {
    if (selectedFilter === 'All') return menuItems;
    
    return menuItems.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const filter = selectedFilter.toLowerCase();
      
      if (filter === 'pickles') return cat.includes('pickle');
      if (filter === 'sweets') return cat.includes('sweet') || cat.includes('laddu') || cat.includes('kajjikayalu');
      if (filter === 'snacks') return cat.includes('snack') || cat.includes('janthikalu') || cat.includes('chekkalu');
      if (filter === 'oils') return cat.includes('oil');
      if (filter === 'powders') return cat.includes('podi') || cat.includes('powder') || cat.includes('masala') || cat.includes('spice');
      
      return false;
    });
  };

  const filtered = getFilteredItems();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Category Filter Pills */}
      <div className="carousel-filter-bar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.25rem 0.5rem 0.5rem 0', scrollbarWidth: 'none' }}>
        {filterCategories.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`example-chip ${selectedFilter === filter ? 'active-filter-pill' : ''}`}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: selectedFilter === filter ? '1px solid #fb923c' : '1px solid rgba(255,255,255,0.12)',
              background: selectedFilter === filter ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.05)',
              color: selectedFilter === filter ? '#fb923c' : 'rgba(255,255,255,0.6)',
              borderRadius: '99px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Carousel Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          No items available in this category today. 🍽️
        </div>
      ) : (
        <div className="ai-product-carousel">
          {filtered.map((item, idx) => (
            <ProductCard key={item.id} item={item} onSelect={onSelect} disabled={disabled} delay={idx * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message-wrapper">
      <div className="avatar bot-avatar" style={{ background: 'transparent', boxShadow: 'none' }}><img src="/logo.png" alt="AHF" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
      <div className="message-content">
        <div className="bot-bubble">
          <div className="typing-dots">
            <div className="dot" /><div className="dot" /><div className="dot" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROTATING TEXT ────────────────────────────────────────────────────────────
function RotatingText() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ROTATING_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rotating-text-container">
      <span className="rotating-label">Try: </span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={idx}
            className="rotating-word"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            "{ROTATING_PHRASES[idx]}"
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to prevent timeout resets on page re-renders

  return (
    <motion.div
      className="splash-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="splash-logo-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        <img src="/logo.png" alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
        <div className="splash-logo">Akshaya Homely Foods</div>
      </motion.div>
      <motion.div
        className="splash-bar-track"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="splash-bar-fill" />
      </motion.div>
    </motion.div>
  );
}


// ─── STABLE INPUT BOX COMPONENT ──────────────────────────────────────────────
const InputBox = React.forwardRef(function InputBox(
  { value, onChange, onKeyDown, onSend, placeholder, autoFocus },
  ref
) {
  React.useEffect(() => {
    if (autoFocus && ref && 'current' in ref) {
      const t = setTimeout(() => {
        ref.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus, ref]);

  return (
    <div className="input-glass-container">
      <textarea
        ref={ref}
        className="main-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        rows={1}
        aria-label="Type your message"
      />
      <div className="input-actions">
        <span className="input-hint">Press Enter to send</span>
        <button className="send-btn" disabled={!value.trim()} onClick={onSend} type="button" aria-label="Send message">
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

// Helper to safely load state from localStorage with corruption & 24hr expiration protection
const loadPersistedState = () => {
  const defaultState = {
    isChatActive: false,
    messages: [],
    currentStep: STEPS.IDLE,
    selectedItem: null,
    quantity: null,
    deliveryAddress: '',
  };

  try {
    const savedTime = localStorage.getItem('ahf_chat_timestamp');
    if (!savedTime) return defaultState;

    // Check 24 hour expiry (86,400,000 milliseconds)
    const now = Date.now();
    if (now - parseInt(savedTime, 10) > 24 * 60 * 60 * 1000) {
      const keys = [
        'ahf_chat_timestamp', 'ahf_chat_active', 'ahf_chat_messages',
        'ahf_chat_step', 'ahf_chat_selected_item', 'ahf_chat_quantity', 'ahf_chat_address'
      ];
      keys.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });
      return defaultState;
    }

    const savedActive = localStorage.getItem('ahf_chat_active');
    const savedMessages = localStorage.getItem('ahf_chat_messages');
    const savedStep = localStorage.getItem('ahf_chat_step');
    const savedItem = localStorage.getItem('ahf_chat_selected_item');
    const savedQty = localStorage.getItem('ahf_chat_quantity');
    const savedAddr = localStorage.getItem('ahf_chat_address');

    return {
      isChatActive: savedActive === 'true',
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      currentStep: savedStep || STEPS.IDLE,
      selectedItem: savedItem ? JSON.parse(savedItem) : null,
      quantity: savedQty ? parseInt(savedQty, 10) : null,
      deliveryAddress: savedAddr || '',
    };
  } catch (err) {
    console.error('Failed to parse or load persisted chat state:', err);
    return defaultState;
  }
};

// Client-side Prompt injection check
function detectPromptInjection(text) {
  const lowerText = (text || '').toLowerCase();
  const injectionPatterns = [
    'ignore all previous',
    'ignore previous instructions',
    'forget your instructions',
    'forget previous instructions',
    'system prompt',
    'you are now a',
    'act as a',
    'bypass',
    'override guidelines'
  ];
  return injectionPatterns.some(pattern => lowerText.includes(pattern));
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CustomerChat() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
  }, []);
  // Load state from localStorage on startup
  const persistedState = loadPersistedState();

  const [isChatActive, setIsChatActive] = useState(persistedState.isChatActive);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(persistedState.messages);
  const [menuItems, setMenuItems] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [menuFetchError, setMenuFetchError] = useState(false);

  const [currentStep, setCurrentStep] = useState(persistedState.currentStep);
  const [selectedItem, setSelectedItem] = useState(persistedState.selectedItem);
  const [quantity, setQuantity] = useState(persistedState.quantity);
  const [deliveryAddress, setDeliveryAddress] = useState(persistedState.deliveryAddress);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    try {
      const cust = JSON.parse(localStorage.getItem('customer') || '{}');
      return cust.name || localStorage.getItem('ahf_customer_name') || '';
    } catch {
      return '';
    }
  });
  const [customerWhatsapp, setCustomerWhatsapp] = useState(() => {
    try {
      const cust = JSON.parse(localStorage.getItem('customer') || '{}');
      return cust.whatsapp_number || localStorage.getItem('ahf_customer_whatsapp') || '';
    } catch {
      return '';
    }
  });
  const [isPaymentInitiating, setIsPaymentInitiating] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const inputRef = useRef(null);
  const interactionLocked = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const typingTimeoutRef = useRef(null);

  const setLock = useCallback((val) => {
    interactionLocked.current = val;
    setIsLocked(val);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  // Pruning logic to limit messages and preserve onboarding greeting
  const setMessagesPruned = useCallback((newMessagesOrFn) => {
    const LIMIT = 30;
    setMessages((prev) => {
      const resolvedMessages = typeof newMessagesOrFn === 'function' ? newMessagesOrFn(prev) : newMessagesOrFn;
      if (resolvedMessages.length > LIMIT) {
        const greeting = resolvedMessages[0];
        const recent = resolvedMessages.slice(resolvedMessages.length - (LIMIT - 1));
        return [greeting, ...recent];
      }
      return resolvedMessages;
    });
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ahf_chat_timestamp', Date.now().toString());
      localStorage.setItem('ahf_chat_active', isChatActive.toString());
      localStorage.setItem('ahf_chat_messages', JSON.stringify(messages));
      localStorage.setItem('ahf_chat_step', currentStep);
      localStorage.setItem('ahf_chat_selected_item', selectedItem ? JSON.stringify(selectedItem) : '');
      localStorage.setItem('ahf_chat_quantity', quantity !== null ? quantity.toString() : '');
      localStorage.setItem('ahf_chat_address', deliveryAddress || '');
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [isChatActive, messages, currentStep, selectedItem, quantity, deliveryAddress]);

  const clearPersistedState = useCallback(() => {
    try {
      const keys = [
        'ahf_chat_timestamp', 'ahf_chat_active', 'ahf_chat_messages',
        'ahf_chat_step', 'ahf_chat_selected_item', 'ahf_chat_quantity', 'ahf_chat_address'
      ];
      keys.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });
    } catch (e) {
      console.error('Failed to clear state from localStorage:', e);
    }
  }, []);

  // Reset scroll state when transitioning modes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsScrolled(false);
  }, [isChatActive]);

  // Window scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMessagesScroll = useCallback((e) => {
    if (e.target.scrollTop > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, []);

  // ── Auto greeting ──
  useEffect(() => {
    if (messages.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessagesPruned([
        createBotMessage({
          type: 'text',
          text: `Welcome to Akshaya Homely Foods 👋\n\nI am your AI Ordering Assistant. You can ask for the menu, browse items, and place your order directly here!\n\nTo get started, send a message like "Show menu" or "Start order".`
        })
      ]);
      setCurrentStep(STEPS.MENU);
    }
  }, [messages.length, setMessagesPruned]);

  // ── Fetch menu ──
  const loadMenu = useCallback(async () => {
    setIsMenuLoading(true);
    setMenuFetchError(false);
    try {
      const res = await fetch(`${API_BASE}/menu/available`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      setMenuItems(await res.json());
    } catch (e) {
      console.error(e);
      setMenuFetchError(true);
      toast.error("Failed to load today's menu. Please try again.", { id: 'menu-error' });
    } finally {
      setIsMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMenu();
  }, [loadMenu]);

  const scrollToBottom = useCallback(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 80);
  }, [messages, isTyping, scrollToBottom]);

  // Refocus input whenever chat is active or bot finishes typing
  useEffect(() => {
    if (isChatActive && !isTyping) {
      inputRef.current?.focus();
    }
  }, [isChatActive, isTyping]);

  // ── Stop responding handler ──
  const handleStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      setIsTyping(false);
      setLock(false);
      toast.success('AI generation stopped.', { id: 'stop-toast' });
    }
  }, [setLock]);

  // ── Add bot message after typing delay ──
  const addBotMessage = useCallback((payload, delay = 900) => {
    return new Promise((resolve) => {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
        const msg = createBotMessage(payload);
        setMessagesPruned((prev) => [...prev, msg]);
        setLock(false);
        resolve(msg);
      }, delay);
    });
  }, [setLock, setMessagesPruned]);

  // ── Item select ──
  const handleSelectItem = useCallback(async (item) => {
    if (interactionLocked.current) return;
    setLock(true);
    setSelectedItem(item);
    setQuantity(null);
    setCurrentStep(STEPS.QUANTITY);
    setMessagesPruned((prev) => [...prev, createUserMessage(`I'll take ${item.name}`)]);
    // Show a selected-item mini card + ask for quantity
    await addBotMessage({
      type: 'selected_item_card',
      item,
      text: `Excellent choice! 😊\n\nHow many quantities would you like to order?`,
    }, 900);
  }, [addBotMessage, setMessagesPruned, setLock]);

  // ── Core message processor ──
  const processMessage = useCallback(async (text) => {
    if (interactionLocked.current) return;
    setLock(true);
    setIsTyping(true);

    if (detectPromptInjection(text)) {
      await addBotMessage({
        type: 'text',
        text: "I'm sorry, but I can only assist with ordering food from Akshaya Homely Foods."
      }, 800);
      return;
    }

    // ── QUANTITY step: validate and process ──
    if (currentStep === STEPS.QUANTITY) {
      const trimmed = text.trim();
      const parsed = parseInt(trimmed, 10);
      const isValidNumber = /^\d+$/.test(trimmed) && !isNaN(parsed);

      if (!isValidNumber || parsed <= 0) {
        await addBotMessage({
          type: 'text',
          text: '⚠️ Please enter a valid quantity.\n\nExamples: 1, 2, 3\n(Must be a whole number greater than 0)',
        }, 700);
        return;
      }

      if (parsed > 50) {
        await addBotMessage({
          type: 'text',
          text: '⚠️ Maximum quantity per order is 50.\n\nPlease enter a quantity between 1 and 50. For bulk orders, please contact us on WhatsApp.',
        }, 700);
        return;
      }

      // Valid quantity — store it
      const qty = parsed;
      setQuantity(qty);
      const subtotal = Number(selectedItem.price) * qty;

      // Show subtotal confirmation card, then ask for address
      await addBotMessage({
        type: 'quantity_confirm',
        item: selectedItem,
        quantity: qty,
        subtotal,
      }, 800);

      // Transition to ADDRESS
      setCurrentStep(STEPS.ADDRESS);

      await addBotMessage({
        type: 'text',
        text: 'Perfect! 📍\n\nPlease enter your delivery address.',
      }, 900);
      return;
    }

    // ── ADDRESS step: validate and process ──
    if (currentStep === STEPS.ADDRESS) {
      const addr = text.trim();
      if (!addr || addr.length < 10) {
        await addBotMessage({
          type: 'text',
          text: '⚠️ Please enter a complete delivery address.',
        }, 700);
        return;
      }

      setDeliveryAddress(addr);
      const subtotal = Number(selectedItem.price) * quantity;

      // Transition to SUMMARY
      setCurrentStep(STEPS.SUMMARY);

      // Generate Order Summary Card
      await addBotMessage({
        type: 'order_summary_card',
        item: selectedItem,
        quantity,
        subtotal,
        deliveryAddress: addr,
      }, 900);
      return;
    }

    // ── MENU trigger ──
    if (
      currentStep === STEPS.IDLE ||
      /hi|hello|hey|menu|food|order|show|what|available|items|today|browse|start/i.test(text.toLowerCase())
    ) {
      setCurrentStep(STEPS.MENU);
      await addBotMessage({
        type: 'text',
        text: 'Welcome to Akshaya Homely Foods 👋\n\nHere is today\'s available menu. Tap any item to get started!',
      }, 900);

      if (menuItems.length === 0) {
        await addBotMessage({
          type: 'text',
          text: isMenuLoading ? 'Menu is still loading, one moment...' : 'No items available right now. Please check back soon!',
        }, 700);
      } else {
        setMessagesPruned((prev) => [...prev, createBotMessage({ type: 'menu_carousel', items: menuItems })]);
        setLock(false);
        setIsTyping(false);
      }
      return;
    }

    await addBotMessage({
      type: 'text',
      text: 'I can help you order! Say "Hi" or "Show menu" to browse our freshly prepared items. 🫙',
    });
  }, [currentStep, menuItems, isMenuLoading, selectedItem, quantity, addBotMessage, setLock, setMessagesPruned]);

  // ── Send ──
  const handleSend = useCallback(async (textOverride) => {
    const text = typeof textOverride === 'string' ? textOverride : inputText;
    if (!text.trim() || interactionLocked.current) return;
    if (!isChatActive) setIsChatActive(true);
    setMessagesPruned((prev) => [...prev, createUserMessage(text)]);
    setInputText('');
    setIsTyping(true);
    
    // Focus immediately after clearing text
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    await processMessage(text);
  }, [inputText, isChatActive, processMessage, setMessagesPruned]);

  const handleCollectDetailsAndPay = useCallback(async () => {
    if (!customerName.trim() || !customerWhatsapp.trim() || isPaymentInitiating) return;
    setIsPaymentInitiating(true);

    // Save profile details to localStorage
    localStorage.setItem('ahf_customer_name', customerName.trim());
    localStorage.setItem('ahf_customer_whatsapp', customerWhatsapp.trim());

    try {
      // 1. Create database order (in Pending status)
      const orderRes = await fetch(`${API_BASE}/chat/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: customerWhatsapp.trim(),
          name: customerName.trim(),
          address: deliveryAddress,
          items: [
            {
              name: selectedItem.name,
              quantity: quantity,
              price: selectedItem.price
            }
          ],
          total_amount: selectedItem.price * quantity
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order in database');
      }

      const orderData = await orderRes.json();
      const dbOrderId = orderData.orderId;

      // Close profile modal
      setShowDetailsModal(false);

      // Transition chat UI step
      setCurrentStep(STEPS.PAYMENT);
      setMessagesPruned((prev) => [...prev, createUserMessage('Confirm Order')]);

      await addBotMessage({
        type: 'text',
        text: 'Processing your order... 💳',
      }, 500);

      // Simulated payment processing delay for natural UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2. Mark payment as Paid (dummy payment mode)
      const updateRes = await fetch(`${API_BASE}/payment/order/${dbOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'Paid' })
      });

      if (!updateRes.ok) throw new Error('Failed to update payment status');

      await addBotMessage({
        type: 'order_success_card',
        orderId: dbOrderId,
        amountPaid: selectedItem.price * quantity,
        estimatedTime: '30-45 Minutes',
        text: `Thank you, ${customerName.trim()}! Your order has been placed successfully.\n\nWe will update you on WhatsApp at ${customerWhatsapp.trim()}!`,
      }, 1000);

      clearPersistedState();
      setCurrentStep(STEPS.SUCCESS);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Payment initialization failed. Please try again.');
      setLock(false);
    } finally {
      setIsPaymentInitiating(false);
    }
  }, [customerName, customerWhatsapp, isPaymentInitiating, deliveryAddress, selectedItem, quantity, addBotMessage, setLock, clearPersistedState, setMessagesPruned]);

  const handleConfirmOrder = useCallback(() => {
    handleCollectDetailsAndPay();
  }, [handleCollectDetailsAndPay]);

  const handleCancelOrder = useCallback(async () => {
    if (interactionLocked.current) return;
    setLock(true);

    setMessagesPruned((prev) => [...prev, createUserMessage('Cancel Order')]);

    setSelectedItem(null);
    setQuantity(null);
    setDeliveryAddress('');
    setCurrentStep(STEPS.MENU);
    clearPersistedState();

    await addBotMessage({
      type: 'text',
      text: 'Your order has been cancelled.\n\nWould you like to order something else? Here is today\'s available menu:',
    }, 800);

    if (menuItems.length === 0) {
      await addBotMessage({
        type: 'text',
        text: isMenuLoading ? 'Menu is still loading, one moment...' : 'No items available right now. Please check back soon!',
      }, 700);
    } else {
      setMessagesPruned((prev) => [...prev, createBotMessage({ type: 'menu_carousel', items: menuItems })]);
      setLock(false);
      setIsTyping(false);
    }
  }, [menuItems, isMenuLoading, addBotMessage, setLock, setMessagesPruned, clearPersistedState]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── RENDER MESSAGE ──────────────────────────────────────────────────────
  const renderMessage = (msg) => {
    if (msg.sender === 'user') {
      return (
        <div className="message-wrapper user-message-wrapper" key={msg.id}>
          <div className="message-content" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="user-bubble">{msg.text}</div>
          </div>
        </div>
      );
    }

    const isWide = msg.type === 'menu_carousel';

    return (
      <div className="message-wrapper" key={msg.id}>
        <div className="avatar bot-avatar" style={{ background: 'transparent', boxShadow: 'none' }}><img src="/logo.png" alt="AHF" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
        <div className="message-content" style={{ maxWidth: isWide ? '100%' : '85%', flex: isWide ? 1 : undefined }}>
          <div className="bot-bubble">
            {/* Plain text */}
            {msg.type === 'text' && (
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>
            )}

            {/* Menu carousel */}
            {msg.type === 'menu_carousel' && (
              <MenuCarousel menuItems={msg.items} onSelect={handleSelectItem} disabled={currentStep !== STEPS.MENU} />
            )}

            {/* Selected item mini-card + quantity question */}
            {msg.type === 'selected_item_card' && (
              <div>
                <motion.div
                  className="selected-item-card"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="sic-image">
                    <img src={getImageForItem(msg.item)} alt={msg.item.name} />
                  </div>
                  <div className="sic-info">
                    <span className="sic-label">Selected Item</span>
                    <h4 className="sic-name">{msg.item.name}</h4>
                    <span className="sic-cat">{msg.item.category}</span>
                    <span className="sic-price">₹{Number(msg.item.price).toFixed(2)}</span>
                  </div>
                </motion.div>
                <p style={{ margin: '0.875rem 0 0', whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.88)' }}>
                  {msg.text}
                </p>
              </div>
            )}

            {/* Quantity confirmation card */}
            {msg.type === 'quantity_confirm' && (
              <motion.div
                className="qty-confirm-card"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="qcc-header">
                  <span className="qcc-icon">🛒</span>
                  <span className="qcc-title">Order Preview</span>
                </div>
                <div className="qcc-row">
                  <span className="qcc-label">Item</span>
                  <span className="qcc-value">{msg.item.name}</span>
                </div>
                <div className="qcc-row">
                  <span className="qcc-label">Unit Price</span>
                  <span className="qcc-value">₹{Number(msg.item.price).toFixed(2)}</span>
                </div>
                <div className="qcc-row">
                  <span className="qcc-label">Quantity</span>
                  <span className="qcc-value">{msg.quantity}</span>
                </div>
                <div className="qcc-divider" />
                <div className="qcc-row qcc-total">
                  <span className="qcc-label">Subtotal</span>
                  <span className="qcc-subtotal">₹{msg.subtotal.toFixed(2)}</span>
                </div>
              </motion.div>
            )}

            {/* Order summary card */}
            {msg.type === 'order_summary_card' && (
              <motion.div
                className="order-summary-card"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="osc-header">
                  <span className="osc-icon">🛒</span>
                  <span className="osc-title">Order Summary</span>
                </div>
                <div className="osc-body">
                  <div className="osc-item-preview" style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={getImageForItem(msg.item)} alt={msg.item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(249,115,22,0.8)', fontWeight: '700', letterSpacing: '0.05em' }}>{msg.item.category}</span>
                      <h4 style={{ margin: '0', fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>{msg.item.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>₹{Number(msg.item.price).toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="osc-divider" />
                  <div className="osc-row">
                    <span className="osc-label">Quantity</span>
                    <span className="osc-value">{msg.quantity}</span>
                  </div>
                  <div className="osc-row">
                    <span className="osc-label">Subtotal</span>
                    <span className="osc-value osc-highlight">₹{msg.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="osc-divider" />
                  <div className="osc-address-section" style={{ textAlign: 'left' }}>
                    <span className="osc-address-label">📍 Delivery Address</span>
                    <p className="osc-address-text">{msg.deliveryAddress}</p>
                  </div>
                </div>

                {/* Show actions only if this summary card belongs to the active step */}
                {currentStep === STEPS.SUMMARY && (
                  <div className="osc-actions">
                    <button
                      className="osc-confirm-btn"
                      onClick={handleConfirmOrder}
                      disabled={isLocked}
                    >
                      ✅ Confirm Order
                    </button>
                    <button
                      className="osc-cancel-btn"
                      onClick={handleCancelOrder}
                      disabled={isLocked}
                    >
                      ❌ Cancel Order
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Order success card */}
            {msg.type === 'order_success_card' && (
              <motion.div
                className="order-summary-card"
                  style={{ background: 'rgba(20, 30, 25, 0.85)', borderColor: 'rgba(34, 197, 94, 0.25)', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 197, 94, 0.08)' }}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="success-animation-wrapper">
                  <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                  <h3 style={{ color: '#4ade80', margin: '0.5rem 0 0 0', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>Payment Successful!</h3>
                </div>
                
                <div className="osc-body" style={{ padding: '0 0 0.5rem 0' }}>
                  <div className="osc-divider" style={{ background: 'rgba(34, 197, 94, 0.15)' }} />
                  <div className="osc-row">
                    <span className="osc-label" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Order ID</span>
                    <span className="osc-value" style={{ fontWeight: '700', color: 'white' }}>#{msg.orderId}</span>
                  </div>
                  {msg.amountPaid && (
                    <div className="osc-row">
                      <span className="osc-label" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Amount Paid</span>
                      <span className="osc-value" style={{ fontWeight: '700', color: 'white' }}>₹{Number(msg.amountPaid).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="osc-row">
                    <span className="osc-label" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Est. Delivery Time</span>
                    <span className="osc-value" style={{ color: '#4ade80', fontWeight: '700' }}>{msg.estimatedTime}</span>
                  </div>
                  <div className="osc-divider" style={{ background: 'rgba(34, 197, 94, 0.15)' }} />
                  <p style={{ margin: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', lineHeight: '1.5' }}>
                    {msg.text}
                  </p>
                  
                  <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                    <a
                      href={`/track/${msg.orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="osc-confirm-btn"
                      style={{
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'inline-flex',
                        width: '100%',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '0.85rem',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: 'white',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      📍 Track My Order
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    localStorage.removeItem('ahf_customer_name');
    localStorage.removeItem('ahf_customer_whatsapp');
    toast.success('Logged out successfully', { icon: '👋' });
    navigate('/login', { replace: true });
  }, [navigate]);

  // Shared InputBox component is now defined at the top level to prevent focus loss bugs.

  // ─── ROOT RENDER ─────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onDone={handleSplashDone} />}
      </AnimatePresence>

      {!showSplash && (
        <div className="ai-page-container">
          {/* ── GRADIENT BLOBS ── */}
          <div className="bg-canvas" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
            <div className="blob blob-4" />
          </div>
          <div className="bg-overlay" aria-hidden="true" />

          {/* ── PERSISTENT STICKY NAVBAR ── */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`premium-navbar ${isScrolled ? 'scrolled' : ''}`}
          >
            {/* LEFT: Logo + Brand */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => navigate('/')}
            >
              <img
                src="/logo.png"
                alt="Akshaya Homely Foods"
                style={{ height: '38px', width: '38px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px' }}
              />
              <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                Akshaya Homely Foods
              </span>
            </div>

            {/* CENTER: Nav Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {[
                { label: 'Home', action: () => navigate('/') },
                { label: 'My Orders', action: () => navigate('/my-orders') },
                { label: 'Track Order', action: () => navigate('/order-tracking') },
                { label: 'AI Chat', action: () => { setIsChatActive(false); setMessages([]); setCurrentStep(STEPS.IDLE); } },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.72)',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'none'; }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* RIGHT: New Order (chat mode only) + Customer Info + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              {/* New Order button — only visible while chatting */}
              {isChatActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    setIsChatActive(false);
                    setMessages([]);
                    setInputText('');
                    setCurrentStep(STEPS.IDLE);
                    setSelectedItem(null);
                    setQuantity(null);
                    setDeliveryAddress('');
                    interactionLocked.current = false;
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.45rem 1rem',
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  New Order
                </motion.button>
              )}

              {customerName && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50px',
                  padding: '0.35rem 0.85rem 0.35rem 0.5rem',
                }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444, #ea580c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={13} color="white" strokeWidth={2.5} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: '600' }}>
                    {customerName}
                  </span>
                </div>
              )}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.45rem 1rem',
                  borderRadius: '50px',
                  border: '1.5px solid rgba(239,68,68,0.5)',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#fca5a5',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.8)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#fca5a5'; }}
              >
                <LogOut size={13} strokeWidth={2.5} />
                Logout
              </motion.button>
            </div>
          </motion.header>

          <AnimatePresence mode="wait">
            {/* ── HERO MODE ── */}
            {!isChatActive && (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -40, filter: 'blur(12px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="hero-container"
                style={{ paddingTop: '68px' }}
              >
                {/* Brand Logo */}
                <motion.div
                  className="hero-logo-container"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src="/logo.png" alt="Akshaya Homely Foods Logo" className="hero-logo" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Akshaya Homely Foods
                </motion.h1>

                {/* Subtitle / Short Tagline */}
                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', fontWeight: '400', maxWidth: '520px', margin: '0 0 2.5rem 0' }}
                >
                  Order freshly prepared homemade pickles, sweets, and podis instantly with our AI assistant.
                </motion.p>

                {/* Rotating Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <RotatingText />
                </motion.div>

                {/* Input */}
                <motion.div
                  className="input-wrapper"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'relative' }}
                >
                  {isTyping && (
                    <motion.button
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onClick={handleStop}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '1rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '99px',
                        padding: '0.5rem 1.25rem',
                        color: '#f87171',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        zIndex: 30
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', background: '#f87171', borderRadius: '1px' }} />
                      Stop Responding
                    </motion.button>
                  )}
                  <InputBox
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onSend={() => handleSend()}
                    placeholder="Ask for the menu or place an order..."
                    autoFocus
                  />
                </motion.div>

                {/* Menu loading hint */}
                {isMenuLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.35)', marginTop: '1rem', fontSize: '0.8rem' }}
                  >
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Fetching today's menu...
                  </motion.div>
                )}

                {/* Menu fetch error with retry */}
                {menuFetchError && !isMenuLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                      Could not load the menu. Please try again.
                    </span>
                    <button
                      onClick={loadMenu}
                      style={{
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.4)',
                        color: '#fb923c',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Retry Loading Menu
                    </button>
                  </motion.div>
                )}

                {/* Suggestion Chips */}
                <motion.div
                  className="examples-grid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {SUGGESTIONS.map((s, idx) => (
                    <motion.button
                      key={idx}
                      className="example-chip"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 + idx * 0.07 }}
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ── CHAT MODE ── */}
            {isChatActive && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="chat-layout"
                style={{ paddingTop: '68px' }}
              >
                {/* NO sub-header here — navigation is handled entirely by the main sticky navbar above */}

                <main className="messages-area" onScroll={handleMessagesScroll} role="log" aria-live="polite" ref={messagesAreaRef}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <div style={{ width: '100%', maxWidth: '800px' }}>
                        {renderMessage(msg)}
                      </div>
                    </motion.div>
                  ))}

                  {/* Render Quick Action Chips when conversation is just starting */}
                  {messages.length === 1 && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem', width: '100%', maxWidth: '800px' }}
                    >
                      {[
                        "Show Menu 🫙",
                        "How do I order? 📋",
                        "Check today's specials ✨"
                      ].map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim())}
                          className="example-chip"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <div style={{ width: '100%', maxWidth: '800px' }}>
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} style={{ height: '16px' }} />
                </main>

                <div className="chat-input-section">
                  <div className="chat-input-wrapper" style={{ position: 'relative' }}>
                    {isTyping && (
                      <motion.button
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        onClick={handleStop}
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: '1rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '99px',
                          padding: '0.5rem 1.25rem',
                          color: '#f87171',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          zIndex: 30
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', background: '#f87171', borderRadius: '1px' }} />
                        Stop Responding
                      </motion.button>
                    )}
                    <InputBox
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onSend={() => handleSend()}
                      placeholder="Message Akshaya Assistant..."
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── CUSTOMER PROFILE DETAILS MODAL ── */}
      {showDetailsModal && (
        <div className="osc-modal-overlay">
          <div className="osc-modal-content">
            <div className="osc-modal-header">
              <h4 className="osc-modal-title">📋 Complete Your Profile</h4>
            </div>
            <div className="osc-modal-body">
              <p className="osc-modal-desc">
                Please enter your details to proceed with your order and secure payment.
              </p>
              <div className="osc-modal-field">
                <label className="osc-field-label">Full Name</label>
                <input
                  type="text"
                  className="osc-modal-input"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="osc-modal-field">
                <label className="osc-field-label">WhatsApp Number</label>
                <input
                  type="tel"
                  className="osc-modal-input"
                  placeholder="Enter WhatsApp number (e.g. +91...)"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                />
              </div>
            </div>
            <div className="osc-modal-footer">
              <button
                className="osc-modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
                disabled={isPaymentInitiating}
              >
                Cancel
              </button>
              <button
                className="osc-modal-submit-btn"
                onClick={handleCollectDetailsAndPay}
                disabled={!customerName.trim() || !customerWhatsapp.trim() || isPaymentInitiating}
              >
                {isPaymentInitiating ? 'Initiating...' : 'Proceed to Payment 💳'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
