import React, { useState, useMemo, useRef, useEffect } from 'react';
import { INITIAL_CHATS, ChatThread, MessageItem } from './data/mockMessengerData';
import { ListingThumbnail } from './components/ListingThumbnail';
import {
  Search,
  MoreVertical,
  MoreHorizontal,
  Pin,
  BellOff,
  Archive,
  Trash2,
  Flag,
  Reply,
  Copy,
  Pencil,
  Languages,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Calendar,
  MapPin,
  Banknote,
  X,
  MailCheck,
  MailOpen,
  FileText,
  User,
  LayoutGrid,
  Briefcase,
  Heart,
  SlidersHorizontal,
  Star,
  Bell,
  Settings,
  LogOut,
  MessageCircle,
  Plus,
  ArrowDown,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

type ChatFilterTab = 'all' | 'unread' | 'buying' | 'selling' | 'archived';
type CurrencyCode = 'THB' | 'EUR' | 'USD';
type TranslationDisplayMode = 'stacked' | 'replace';

interface ActiveChatMenuState {
  chatId: string;
  x: number;
  y: number;
}

interface ActiveMessageMenuState {
  messageId: string;
  sender: 'me' | 'them';
  x: number;
  y: number;
}

export default function App() {
  // Global Marketplace Header State
  const [currency, setCurrency] = useState<CurrencyCode>('THB');
  const [uiLang, setUiLang] = useState<'RU' | 'ES'>('RU');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('messages');
  const [favoritesCount, setFavoritesCount] = useState<number>(8);
  const [notificationsCount, setNotificationsCount] = useState<number>(38);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [showNewAdModal, setShowNewAdModal] = useState<boolean>(false);

  // Messenger Core State
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string>('c1');
  const [chatFilter, setChatFilter] = useState<ChatFilterTab>('all');
  const [selectedListingFilter, setSelectedListingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Conversation Window State
  const [inChatSearchOpen, setInChatSearchOpen] = useState<boolean>(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState<string>('');
  const [translationMode, setTranslationMode] = useState<TranslationDisplayMode>('stacked');
  const [expandedLongMessages, setExpandedLongMessages] = useState<Record<string, boolean>>({});
  const [expandFullListingTitle, setExpandFullListingTitle] = useState<boolean>(false);
  const [showListingDetailsModal, setShowListingDetailsModal] = useState<boolean>(false);
  const [isTypingReply, setIsTypingReply] = useState<boolean>(false);

  // Composer State
  const [messageInput, setMessageInput] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<MessageItem | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  // Context Menus State (Chat & Individual Message)
  const [chatMenu, setChatMenu] = useState<ActiveChatMenuState | null>(null);
  const [messageMenu, setMessageMenu] = useState<ActiveMessageMenuState | null>(null);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportModalTarget, setReportModalTarget] = useState<{
    type: 'chat' | 'message';
    title: string;
  } | null>(null);
  const [priceOfferModalOpen, setPriceOfferModalOpen] = useState<boolean>(false);
  const [customOfferAmount, setCustomOfferAmount] = useState<string>('80 000');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);

  const triggerToast = (text: string) => {
    setToastMessage(text);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Close floating menus on click outside or Escape
  useEffect(() => {
    const handleGlobalClick = () => {
      setChatMenu(null);
      setMessageMenu(null);
      setShowAttachmentMenu(false);
      setShowNotificationsPopover(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChatMenu(null);
        setMessageMenu(null);
        setShowAttachmentMenu(false);
        setShowNotificationsPopover(false);
        setReportModalTarget(null);
        setPriceOfferModalOpen(false);
        setShowNewAdModal(false);
        setShowListingDetailsModal(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Currency formatter helper
  const formatPrice = (priceInThb: number): string => {
    if (currency === 'THB') {
      return `${priceInThb.toLocaleString('ru-RU')} ฿`;
    }
    if (currency === 'EUR') {
      const eur = Math.round(priceInThb * 0.027);
      return `${eur.toLocaleString('ru-RU')} €`;
    }
    const usd = Math.round(priceInThb * 0.029);
    return `${usd.toLocaleString('ru-RU')} $`;
  };

  const activeChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) || chats[0],
    [chats, selectedChatId]
  );

  const totalUnreadChatsCount = useMemo(
    () => chats.filter((c) => !c.isArchived && c.unreadCount > 0).length,
    [chats]
  );

  const totalUnreadMessagesSum = useMemo(
    () => chats.filter((c) => !c.isArchived).reduce((acc, c) => acc + c.unreadCount, 0),
    [chats]
  );

  // Filtered and sorted chat list
  const filteredChats = useMemo(() => {
    return chats
      .filter((chat) => {
        if (chatFilter === 'archived') {
          if (!chat.isArchived) return false;
        } else {
          if (chat.isArchived) return false;
        }
        if (chatFilter === 'unread' && chat.unreadCount === 0) return false;
        if (chatFilter === 'buying' && chat.role !== 'buying') return false;
        if (chatFilter === 'selling' && chat.role !== 'selling') return false;
        if (selectedListingFilter !== 'all' && chat.listing.id !== selectedListingFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName =
            chat.interlocutorName.toLowerCase().includes(q) ||
            chat.interlocutorSubtitle.toLowerCase().includes(q);
          const matchListing = chat.listing.title.toLowerCase().includes(q);
          const matchMsg = chat.messages.some(
            (m) =>
              m.text.toLowerCase().includes(q) ||
              (m.originalText && m.originalText.toLowerCase().includes(q))
          );
          return matchName || matchListing || matchMsg;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [chats, chatFilter, selectedListingFilter, searchQuery]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setReplyingTo(null);
    setEditingMessageId(null);
    setExpandFullListingTitle(false);
    setChatMenu(null);
    setMessageMenu(null);
  };

  // Toggle "Show Original (Spanish)" on a single message
  const handleToggleMessageOriginal = (messageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;
        return {
          ...chat,
          messages: chat.messages.map((m) =>
            m.id === messageId ? { ...m, showOriginal: !m.showOriginal } : m
          ),
        };
      })
    );
    setMessageMenu(null);
  };

  // Toggle all messages original in active chat
  const handleToggleAllOriginalsInChat = () => {
    const anyShowingOriginal = activeChat.messages.some((m) => m.isTranslated && m.showOriginal);
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;
        return {
          ...chat,
          messages: chat.messages.map((m) =>
            m.isTranslated ? { ...m, showOriginal: !anyShowingOriginal } : m
          ),
        };
      })
    );
    triggerToast(
      !anyShowingOriginal
        ? 'Показан оригинал на испанском (ES) для всех сообщений чата'
        : 'Возвращён автоматический перевод на русский (RU)'
    );
  };

  // Chat Context Menu Actions
  const handleToggleChatUnread = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const nextUnread = c.unreadCount > 0 ? 0 : 1;
        return {
          ...c,
          unreadCount: nextUnread,
          messages: c.messages.map((m, idx) =>
            idx === c.messages.length - 1 ? { ...m, isUnread: nextUnread > 0 } : m
          ),
        };
      })
    );
    setChatMenu(null);
    triggerToast('Статус прочтения чата обновлён');
  };

  const handleMarkActiveChatRead = () => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        return {
          ...c,
          unreadCount: 0,
          messages: c.messages.map((m) => ({ ...m, isUnread: false })),
        };
      })
    );
    triggerToast('Сообщения отмечены как прочитанные');
  };

  const handleToggleChatPin = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
    setChatMenu(null);
    triggerToast('Закрепление диалога обновлено');
  };

  const handleToggleChatMute = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isMuted: !c.isMuted } : c))
    );
    setChatMenu(null);
    triggerToast('Параметры уведомлений для диалога изменены');
  };

  const handleToggleChatArchive = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isArchived: !c.isArchived, isPinned: false } : c))
    );
    setChatMenu(null);
    triggerToast('Диалог перемещён в архив');
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== chatId);
      if (selectedChatId === chatId && remaining.length > 0) {
        setSelectedChatId(remaining[0].id);
      }
      return remaining;
    });
    setChatMenu(null);
    triggerToast('Переписка удалена');
  };

  // Single Message Context Menu Actions
  const handleCopyMessageText = (msg: MessageItem) => {
    const textToCopy = msg.showOriginal && msg.originalText ? msg.originalText : msg.text;
    navigator.clipboard?.writeText(textToCopy).catch(() => {});
    setMessageMenu(null);
    triggerToast('Текст сообщения скопирован');
  };

  const handleStartReply = (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReplyingTo(msg);
    setEditingMessageId(null);
    setMessageMenu(null);
    setTimeout(() => composerInputRef.current?.focus(), 40);
  };

  const handleStartEditMessage = (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (msg.sender !== 'me') return;
    setEditingMessageId(msg.id);
    setReplyingTo(null);
    setMessageInput(msg.text);
    setMessageMenu(null);
    setTimeout(() => composerInputRef.current?.focus(), 40);
  };

  const handleTogglePinMessage = (msgId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === msgId ? { ...m, isPinned: !m.isPinned } : { ...m, isPinned: false }
          ),
        };
      })
    );
    setMessageMenu(null);
    triggerToast('Закреплённое сообщение в чате обновлено');
  };

  const handleDeleteMessage = (msgId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        return {
          ...c,
          messages: c.messages.filter((m) => m.id !== msgId),
        };
      })
    );
    setMessageMenu(null);
    triggerToast('Сообщение удалено');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send or Save Edited Message + Simulated Spanish Auto-Reply
  const handleSendMessage = (customText?: string, customAttachment?: MessageItem['attachment']) => {
    const text = (customText !== undefined ? customText : messageInput).trim();
    if (!text && !customAttachment) return;

    if (editingMessageId) {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChat.id) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === editingMessageId ? { ...m, text, isEdited: true } : m
            ),
          };
        })
      );
      setEditingMessageId(null);
      setMessageInput('');
      triggerToast('Изменения в сообщении сохранены');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      timestamp: nowTime,
      dateGroup: '20 октября 2026 г.',
      text: text || (customAttachment ? customAttachment.title : ''),
      readStatus: 'read',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.sender === 'me' ? 'Вы' : activeChat.interlocutorName,
            text: replyingTo.text,
          }
        : undefined,
      attachment: customAttachment,
    };

    const targetChatId = activeChat.id;

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== targetChatId) return c;
        return {
          ...c,
          unreadCount: 0,
          lastUpdatedDate: 'Сегодня',
          lastUpdatedTime: nowTime,
          messages: [...c.messages.map((m) => ({ ...m, isUnread: false })), newMsg],
        };
      })
    );

    setMessageInput('');
    setReplyingTo(null);
    setShowAttachmentMenu(false);
    setTimeout(scrollToBottom, 50);

    // Simulate realistic Spanish reply with automatic translation after 1.1s
    setIsTypingReply(true);
    setTimeout(() => {
      setIsTypingReply(false);
      const replyMsg: MessageItem = {
        id: `msg-reply-${Date.now()}`,
        sender: 'them',
        timestamp: nowTime,
        dateGroup: '20 октября 2026 г.',
        text: 'Договорились! Я подготовлю комплект документов и буду ждать вас на объекте в назначенное время.',
        originalText:
          '¡De acuerdo! Prepararé toda la documentación y le esperaré en la propiedad a la hora acordada.',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      };
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== targetChatId) return c;
          return {
            ...c,
            lastUpdatedTime: nowTime,
            messages: [...c.messages, replyMsg],
          };
        })
      );
      setTimeout(scrollToBottom, 60);
    }, 1100);
  };

  const pinnedMessage = useMemo(
    () => activeChat.messages.find((m) => m.isPinned),
    [activeChat.messages]
  );

  const visibleMessages = useMemo(() => {
    if (!inChatSearchOpen || !inChatSearchQuery.trim()) return activeChat.messages;
    const q = inChatSearchQuery.toLowerCase();
    return activeChat.messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        (m.originalText && m.originalText.toLowerCase().includes(q))
    );
  }, [activeChat.messages, inChatSearchOpen, inChatSearchQuery]);

  const firstUnreadIndex = useMemo(
    () => visibleMessages.findIndex((m) => m.isUnread),
    [visibleMessages]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-slate-900">
      {/* =====================================================================
          1. TOP MARKETPLACE HEADER (Верхнее меню площадки объявлений)
         ===================================================================== */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shrink-0">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Navigation Cluster: Каталог объявлений + Вакансии */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => triggerToast('Открыт каталог категорий объявлений')}
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <span>Каталог объявлений</span>
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => triggerToast('Переход в раздел «Вакансии»')}
              className="text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Вакансии</span>
            </button>
          </div>

          {/* Right Action Cluster: Currency, Language, Разместить объявление, Icons, Profile */}
          <div className="flex items-center gap-3">
            {/* Currency Switcher (฿ / € / $) */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as CurrencyCode);
                  triggerToast(`Валюта отображения цен изменена на ${e.target.value}`);
                }}
                aria-label="Выбор валюты"
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="THB">฿</option>
                <option value="EUR">€</option>
                <option value="USD">$</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Switcher (RU / ES) */}
            <div className="relative">
              <select
                value={uiLang}
                onChange={(e) => {
                  setUiLang(e.target.value as 'RU' | 'ES');
                  triggerToast(
                    e.target.value === 'RU'
                      ? 'Язык интерфейса: Русский (Автоперевод ES → RU активен)'
                      : 'Idioma de interfaz: Español (ES)'
                  );
                }}
                aria-label="Выбор языка"
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="RU">🇷🇺 RU</option>
                <option value="ES">🇪🇸 ES</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Orange Primary CTA: + Разместить объявление */}
            <button
              onClick={() => setShowNewAdModal(true)}
              className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Разместить объявление</span>
            </button>

            {/* Header Quick Icons: Messages, Favorites, Notifications, Profile Avatar */}
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={() => {
                  setActiveSidebarItem('messages');
                  setChatFilter('all');
                }}
                className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="Сообщения"
              >
                <MessageCircle className="w-[19px] h-[19px]" />
                {totalUnreadMessagesSum > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {totalUnreadMessagesSum}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setFavoritesCount((c) => (c === 8 ? 9 : 8));
                  triggerToast('Открыт список избранных объявлений');
                }}
                className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="Избранное"
              >
                <Heart className="w-[19px] h-[19px]" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#f97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {favoritesCount}
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotificationsPopover(!showNotificationsPopover);
                  }}
                  className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Системные уведомления"
                >
                  <Bell className="w-[19px] h-[19px]" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 min-w-[18px] h-4 px-1 bg-[#2563eb] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {showNotificationsPopover && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Уведомления ({notificationsCount})</span>
                      <button
                        onClick={() => {
                          setNotificationsCount(0);
                          setShowNotificationsPopover(false);
                          triggerToast('Все системные уведомления прочитаны');
                        }}
                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Сбросить все
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      <div
                        onClick={() => {
                          setSelectedChatId('c2');
                          setShowNotificationsPopover(false);
                        }}
                        className="p-2 rounded-lg bg-blue-50/60 hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="font-semibold text-slate-900">Новое сообщение от Собеседник 2</div>
                        <div className="text-slate-600 truncate">«Когда можно посмотреть объект?»</div>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedChatId('c4');
                          setShowNotificationsPopover(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="font-semibold text-slate-900">Вопрос по вашему объявлению</div>
                        <div className="text-slate-600 truncate">Собеседник 4: «Можно уточнить условия?»</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveSidebarItem('profile')}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Профиль пользователя"
              >
                П
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN WORKSPACE: LEFT PROFILE SIDEBAR + "СООБЩЕНИЯ" (LIST + CHAT)
         ===================================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 pt-6 pb-8 flex gap-6 items-start">
        {/* LEFT PROFILE SIDEBAR (Левый сайдбар личного кабинета из макета) */}
        <aside className="w-[248px] shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[680px]">
          <div className="space-y-4">
            {/* Profile Avatar & Title */}
            <div className="pt-2 pb-3 flex flex-col items-center text-center border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-200/90 text-slate-600 font-bold text-lg flex items-center justify-center mb-2.5 shadow-inner">
                П
              </div>
              <h2 className="text-base font-bold text-slate-900">Профиль</h2>
              <span className="text-[11px] text-slate-400 mt-0.5">ID 492018 · Верифицирован</span>
            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="space-y-0.5 text-xs">
              <button
                onClick={() => {
                  setActiveSidebarItem('profile');
                  triggerToast('Раздел «Профиль»');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'profile'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Профиль</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('my-ads');
                  setChatFilter('selling');
                  triggerToast('В списке чатов отфильтрованы диалоги по вашим объявлениям');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'my-ads'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Мои объявления</span>
                </span>
                <span className="px-2 py-0.5 bg-slate-500 text-white text-[10px] font-bold rounded-full tabular-nums">
                  99+
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('messages');
                  setChatFilter('all');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'messages'
                    ? 'bg-blue-50/90 text-[#2563eb] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-[#2563eb]" />
                  <span>Сообщения</span>
                </span>
                {totalUnreadMessagesSum > 0 && (
                  <span className="px-2 py-0.5 bg-[#2563eb] text-white text-[10px] font-bold rounded-full tabular-nums">
                    {totalUnreadMessagesSum}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('favorites');
                  setChatFilter('buying');
                  triggerToast('Показаны диалоги по интересующим вас объявлениям («Покупаю»)');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'favorites'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Избранное</span>
                </span>
                <span className="px-2 py-0.5 bg-slate-500 text-white text-[10px] font-bold rounded-full tabular-nums">
                  {favoritesCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('filters');
                  triggerToast('Сохранённые поисковые фильтры');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'filters'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>Мои фильтры</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('reviews');
                  triggerToast('Отзывы и рейтинг (4.9 ★)');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'reviews'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-slate-400" />
                  <span>Отзывы</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('notifications');
                  setChatFilter('unread');
                  triggerToast('Включён фильтр непрочитанных сообщений');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'notifications'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Уведомления</span>
                </span>
                <span className="px-2 py-0.5 bg-[#2563eb] text-white text-[10px] font-bold rounded-full tabular-nums">
                  {notificationsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem('settings');
                  triggerToast('Настройки аккаунта и автоперевода чатов');
                }}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeSidebarItem === 'settings'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Настройки</span>
                </span>
              </button>
            </nav>
          </div>

          {/* Logout Button at Bottom of Profile Card */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => triggerToast('Выход из аккаунта')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Выйти из аккаунта</span>
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA: "Сообщения" Title + Messenger Card */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-3.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Сообщения</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Автоматический перевод: Испанский (ES) ↔ Русский (RU)</span>
            </div>
          </div>

          {/* =================================================================
              MESSENGER UNIFIED WORKSPACE (Список чатов + Окно переписки)
             ================================================================= */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden grid grid-cols-12 h-[640px] relative">
            {/* ---------------------------------------------------------------
                COLUMN A: SEPARATE CHAT LIST (Отдельный список чатов - 5 cols)
               --------------------------------------------------------------- */}
            <section className="col-span-5 border-r border-slate-200 flex flex-col h-full overflow-hidden bg-white">
              {/* Search & Listing Filter Header */}
              <div className="p-3.5 border-b border-slate-100 space-y-2.5 shrink-0">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Найти собеседника или объявление"
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter by Specific Listing Dropdown ("По объявлению") */}
                <div className="relative">
                  <select
                    value={selectedListingFilter}
                    onChange={(e) => setSelectedListingFilter(e.target.value)}
                    aria-label="По объявлению"
                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600 transition-colors cursor-pointer truncate"
                  >
                    <option value="all">По объявлению: Все объявления ({chats.length})</option>
                    {chats.map((c) => (
                      <option key={c.listing.id} value={c.listing.id}>
                        {c.role === 'selling' ? 'Моё объявление: ' : 'Покупаю: '}
                        {c.listing.title.slice(0, 36)}... ({formatPrice(c.listing.priceNumeric)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Filter Tabs: Все | Непрочитанные | Покупаю | Продаю | Архив */}
                <div className="flex items-center gap-1 border-b border-slate-100 pt-0.5 -mx-3.5 px-3.5 overflow-x-auto">
                  <button
                    onClick={() => setChatFilter('all')}
                    className={`pb-2 px-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'all'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setChatFilter('unread')}
                    className={`pb-2 px-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'unread'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Непрочитанные</span>
                    {totalUnreadChatsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#2563eb] text-white text-[10px] font-mono font-bold rounded-full tabular-nums">
                        {totalUnreadChatsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setChatFilter('buying')}
                    className={`pb-2 px-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'buying'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Покупаю
                  </button>
                  <button
                    onClick={() => setChatFilter('selling')}
                    className={`pb-2 px-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'selling'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Мои объявления
                  </button>
                  <button
                    onClick={() => setChatFilter('archived')}
                    className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'archived'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Архив
                  </button>
                </div>
              </div>

              {/* Scrollable Chat List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center space-y-2.5">
                    <p className="text-sm font-semibold text-slate-700">Чаты не найдены</p>
                    <p className="text-xs text-slate-500">
                      Попробуйте изменить параметры поиска или переключить вкладку фильтра.
                    </p>
                    <button
                      onClick={() => {
                        setChatFilter('all');
                        setSelectedListingFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isSelected = chat.id === activeChat.id;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const hasUnread = chat.unreadCount > 0;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMessageMenu(null);
                          setChatMenu({
                            chatId: chat.id,
                            x: Math.min(e.clientX, window.innerWidth - 260),
                            y: Math.min(e.clientY, window.innerHeight - 310),
                          });
                        }}
                        className={`group relative px-3.5 py-3 transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-50/80 hover:bg-blue-50'
                            : hasUnread
                            ? 'bg-slate-50/70 hover:bg-slate-100/70'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar Circle (С1, С2, С3...) + Online indicator */}
                          <div className="relative shrink-0 mt-0.5">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#2563eb] text-white'
                                  : 'bg-slate-200/90 text-slate-700'
                              }`}
                            >
                              {chat.interlocutorCode}
                            </div>
                            {chat.interlocutorOnline && (
                              <span
                                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                                title="В сети"
                              />
                            )}
                          </div>

                          {/* Center Info Block */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* Line 1: Interlocutor Name + Pin/Mute + Date */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`text-xs truncate ${
                                    hasUnread || isSelected
                                      ? 'font-bold text-slate-900'
                                      : 'font-semibold text-slate-800'
                                  }`}
                                >
                                  {chat.interlocutorName}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate hidden xl:inline">
                                  · {chat.interlocutorSubtitle}
                                </span>
                                {chat.isPinned && (
                                  <Pin className="w-3 h-3 text-slate-400 shrink-0 rotate-45" />
                                )}
                                {chat.isMuted && (
                                  <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                                )}
                              </div>

                              <span
                                className={`text-[11px] font-mono tabular-nums shrink-0 group-hover:opacity-0 transition-opacity ${
                                  hasUnread ? 'text-[#2563eb] font-semibold' : 'text-slate-400'
                                }`}
                              >
                                {chat.lastUpdatedDate}
                              </span>
                            </div>

                            {/* Line 2: Role Badge ("Моё объявление") + Listing Title (Handles Long Titles!) + Price */}
                            <div
                              className="flex items-center gap-1.5 text-[11px]"
                              title={`${chat.listing.title} — ${formatPrice(chat.listing.priceNumeric)}`}
                            >
                              {chat.role === 'selling' && (
                                <span className="text-[#2563eb] font-semibold shrink-0">
                                  Моё объявление
                                </span>
                              )}
                              <span className="text-slate-600 truncate font-medium">
                                {chat.listing.title}
                              </span>
                              <span className="text-slate-300 shrink-0">·</span>
                              <span className="font-mono font-semibold text-slate-800 tabular-nums shrink-0">
                                {formatPrice(chat.listing.priceNumeric)}
                              </span>
                            </div>

                            {/* Line 3: Last Message Preview + Unread Counter */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <p
                                className={`text-xs truncate ${
                                  hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'
                                }`}
                              >
                                {lastMsg ? (
                                  <>
                                    {lastMsg.sender === 'me' && (
                                      <span className="text-slate-400 font-normal">Вы: </span>
                                    )}
                                    {lastMsg.attachment && !lastMsg.text
                                      ? 'Фото'
                                      : lastMsg.text}
                                  </>
                                ) : (
                                  'Нет сообщений'
                                )}
                              </p>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {hasUnread && (
                                  <span className="min-w-[19px] h-[19px] px-1.5 bg-[#2563eb] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center tabular-nums">
                                    {chat.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Small Listing Visual Thumbnail on the Right for Instant Disambiguation */}
                          <div className="shrink-0 hidden sm:block">
                            <ListingThumbnail
                              category={chat.listing.category}
                              size="sm"
                              status={chat.listing.status}
                            />
                          </div>
                        </div>

                        {/* Context Menu Button (`⋯`) on Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMessageMenu(null);
                            setChatMenu({
                              chatId: chat.id,
                              x: Math.min(rect.left, window.innerWidth - 260),
                              y: Math.min(rect.bottom + 4, window.innerHeight - 310),
                            });
                          }}
                          title="Контекстное меню чата (или нажмите ПКМ)"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-2 right-2 w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-opacity cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ---------------------------------------------------------------
                COLUMN B: CONVERSATION WINDOW (Окно переписки - 7 cols)
               --------------------------------------------------------------- */}
            <section className="col-span-7 flex flex-col h-full overflow-hidden bg-[#f8fafc] relative">
              {/* 1. Top Interlocutor Header */}
              <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {activeChat.interlocutorCode}
                    </div>
                    {activeChat.interlocutorOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {activeChat.interlocutorName}
                      </h2>
                      <span className="text-xs text-slate-500 truncate">
                        ({activeChat.interlocutorSubtitle})
                      </span>
                      <span className="text-xs text-amber-600 font-mono tabular-nums shrink-0">
                        ★ {activeChat.interlocutorRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{activeChat.interlocutorRoleLabel}</span>
                      <span>·</span>
                      <span
                        className={
                          activeChat.interlocutorOnline ? 'text-emerald-600 font-medium' : 'text-slate-400'
                        }
                      >
                        {activeChat.interlocutorLastSeen}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Right Actions: Auto-Translation Pill (ES->RU), Search, Chat Context Menu (⋮) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {activeChat.autoTranslateEnabled && (
                    <div className="flex items-center bg-blue-50/90 border border-blue-200/80 rounded-lg p-0.5 text-xs">
                      <button
                        onClick={handleToggleAllOriginalsInChat}
                        className="px-2.5 py-1 rounded-md font-medium text-blue-800 hover:bg-blue-100/70 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        title="Показать оригинал (Испанский) или вернуться к переводу для всех сообщений"
                      >
                        <Languages className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                        <span>ES → RU</span>
                      </button>
                      <button
                        onClick={() =>
                          setTranslationMode((prev) => (prev === 'stacked' ? 'replace' : 'stacked'))
                        }
                        className="px-2 py-1 text-[11px] font-mono text-blue-700 hover:text-blue-950 border-l border-blue-200 cursor-pointer whitespace-nowrap"
                        title="Переключить режим просмотра оригинала: Параллельно (Сверка) или Замена текста"
                      >
                        {translationMode === 'stacked' ? 'Сверка' : 'Замена'}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setInChatSearchOpen(!inChatSearchOpen);
                      setInChatSearchQuery('');
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      inChatSearchOpen
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Поиск по сообщениям"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMessageMenu(null);
                      setChatMenu({
                        chatId: activeChat.id,
                        x: Math.min(rect.right - 245, window.innerWidth - 260),
                        y: rect.bottom + 6,
                      });
                    }}
                    className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="Контекстное меню чата"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional In-Chat Search Input Bar */}
              {inChatSearchOpen && (
                <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={inChatSearchQuery}
                    onChange={(e) => setInChatSearchQuery(e.target.value)}
                    placeholder="Поиск по русскому переводу или испанскому оригиналу..."
                    className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    Найдено: {visibleMessages.length}
                  </span>
                  <button
                    onClick={() => {
                      setInChatSearchOpen(false);
                      setInChatSearchQuery('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>
              )}

              {/* 2. Pinned Listing Context Bar (Складское помещение 600 м² · 85 000 ฿) */}
              <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-col gap-1.5 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ListingThumbnail
                      category={activeChat.listing.category}
                      size="sm"
                      status={activeChat.listing.status}
                    />
                    <div className="min-w-0">
                      <div
                        onClick={() => setExpandFullListingTitle(!expandFullListingTitle)}
                        className="cursor-pointer group/adtitle"
                        title="Нажмите, чтобы показать/скрыть полное название объявления"
                      >
                        <div
                          className={`text-xs font-bold text-slate-900 group-hover/adtitle:text-blue-600 transition-colors ${
                            expandFullListingTitle ? '' : 'line-clamp-1'
                          }`}
                        >
                          {activeChat.listing.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                          {formatPrice(activeChat.listing.priceNumeric)}
                        </span>
                        {activeChat.listing.priceNote && (
                          <span className="text-[11px] text-slate-500">
                            · {activeChat.listing.priceNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Context Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPriceOfferModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Торг / Цена
                    </button>
                    <button
                      onClick={() => setShowListingDetailsModal(true)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Объявление</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Pinned Message Banner (if any) */}
                {pinnedMessage && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Pin className="w-3 h-3 text-[#2563eb] shrink-0 rotate-45" />
                      <span className="font-semibold text-[#2563eb] shrink-0">Закреплено:</span>
                      <span className="truncate">{pinnedMessage.text}</span>
                    </div>
                    <button
                      onClick={() => handleTogglePinMessage(pinnedMessage.id)}
                      className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                    >
                      Открепить
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Messages Stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 relative"
              >
                {visibleMessages.map((msg, index) => {
                  const isMe = msg.sender === 'me';
                  const isLongMessage = msg.text.length > 220;
                  const isExpanded = expandedLongMessages[msg.id] ?? true;
                  const showUnreadDivider = index === firstUnreadIndex;

                  return (
                    <React.Fragment key={msg.id}>
                      {/* Unread Messages Divider */}
                      {showUnreadDivider && (
                        <div className="flex items-center gap-3 my-3">
                          <div className="h-px bg-blue-300 flex-1" />
                          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-[#2563eb]">
                            <span>Непрочитанные сообщения</span>
                            <button
                              onClick={handleMarkActiveChatRead}
                              className="underline hover:text-blue-900 font-normal cursor-pointer"
                            >
                              Прочитано
                            </button>
                          </div>
                          <div className="h-px bg-blue-300 flex-1" />
                        </div>
                      )}

                      <div
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setChatMenu(null);
                          setMessageMenu({
                            messageId: msg.id,
                            sender: msg.sender,
                            x: Math.min(e.clientX, window.innerWidth - 255),
                            y: Math.min(e.clientY, window.innerHeight - 275),
                          });
                        }}
                        onDoubleClick={() => handleStartReply(msg)}
                        className={`group/msg flex flex-col ${
                          isMe ? 'items-end' : 'items-start'
                        } relative`}
                      >
                        <div
                          className={`flex items-start gap-1.5 max-w-[82%] ${
                            isMe ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {/* Message Bubble */}
                          <div
                            className={`relative rounded-2xl px-3.5 py-2 shadow-2xs transition-colors ${
                              isMe
                                ? 'bg-[#eef4ff] text-slate-900 border border-blue-200/80 rounded-br-xs'
                                : msg.isUnread
                                ? 'bg-white text-slate-900 border-2 border-[#2563eb] rounded-bl-xs'
                                : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                            }`}
                          >
                            {/* Reply Quote Block */}
                            {msg.replyTo && (
                              <div className="mb-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border-l-2 border-[#2563eb] text-[11px] text-slate-600">
                                <div className="font-semibold text-slate-800">
                                  {msg.replyTo.senderName}
                                </div>
                                <div className="truncate">{msg.replyTo.text}</div>
                              </div>
                            )}

                            {/* Attachment Block */}
                            {msg.attachment && (
                              <div className="mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-[#2563eb] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                                  {msg.attachment.type === 'offer' ? '฿' : 'FILE'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-slate-800 truncate">
                                    {msg.attachment.title}
                                  </div>
                                  {msg.attachment.subtitle && (
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {msg.attachment.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Message Text + Inline Timestamp & Checkmarks */}
                            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                              <div className="text-[13px] leading-relaxed break-words max-w-[62ch]">
                                {msg.isTranslated &&
                                msg.showOriginal &&
                                translationMode === 'replace' &&
                                msg.originalText ? (
                                  <span>{msg.originalText}</span>
                                ) : isLongMessage && !isExpanded ? (
                                  <span>{msg.text.slice(0, 175)}...</span>
                                ) : (
                                  <span>{msg.text}</span>
                                )}

                                {isLongMessage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedLongMessages((prev) => ({
                                        ...prev,
                                        [msg.id]: !isExpanded,
                                      }));
                                    }}
                                    className="ml-1.5 text-[11px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
                                  >
                                    {isExpanded ? 'Свернуть' : 'Читать полностью'}
                                  </button>
                                )}
                              </div>

                              {/* Inline Timestamp + Read Checkmarks (Fixes narrow "1", "321", "да" bubbles!) */}
                              <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums text-slate-400 select-none shrink-0 ml-auto">
                                {msg.isPinned && <Pin className="w-2.5 h-2.5 text-[#2563eb] rotate-45" />}
                                {msg.isEdited && <span>изм.</span>}
                                <span>{msg.timestamp}</span>
                                {isMe && (
                                  <span title="Прочитано">
                                    {msg.readStatus === 'read' ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stacked Spanish Original Block (when showOriginal is true in 'stacked' mode) */}
                            {msg.isTranslated &&
                              msg.showOriginal &&
                              translationMode === 'stacked' &&
                              msg.originalText && (
                                <div className="mt-2 pt-2 border-t border-slate-200/80 bg-slate-50 -mx-1.5 px-2.5 py-1.5 rounded-lg space-y-0.5">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                    <span>Оригинал · Испанский (ES):</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard?.writeText(msg.originalText || '');
                                        triggerToast('Испанский оригинал скопирован');
                                      }}
                                      className="text-[#2563eb] hover:underline cursor-pointer"
                                    >
                                      Копировать ES
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed select-all">
                                    {msg.originalText}
                                  </p>
                                </div>
                              )}

                            {/* Automatic Translation Control Bar inside Bubble (ES -> RU) */}
                            {msg.isTranslated && msg.originalText && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Languages className="w-3 h-3 text-[#2563eb] shrink-0" />
                                  <span>
                                    {msg.showOriginal && translationMode === 'replace'
                                      ? 'Оригинал (Испанский)'
                                      : 'Переведено с испанского'}
                                  </span>
                                </span>
                                <button
                                  onClick={(e) => handleToggleMessageOriginal(msg.id, e)}
                                  className="font-semibold text-[#2563eb] hover:text-blue-800 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {msg.showOriginal ? 'Вернуться к переводу' : 'Показать оригинал'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* `⋮` Trigger Button Next to Bubble (Matches original screenshot pattern + quick hover actions) */}
                          <div className="flex items-center gap-0.5 self-center opacity-70 group-hover/msg:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setChatMenu(null);
                                setMessageMenu({
                                  messageId: msg.id,
                                  sender: msg.sender,
                                  x: Math.min(rect.left, window.innerWidth - 255),
                                  y: Math.min(rect.bottom + 4, window.innerHeight - 275),
                                });
                              }}
                              className="w-7 h-7 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Контекстное меню сообщения"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Typing Indicator when Spanish seller is responding */}
                {isTypingReply && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
                    <span>{activeChat.interlocutorName} печатает на испанском (ES)...</span>
                  </div>
                )}

                {/* Date Label at bottom of stream (like "20 октября 2026 г." in the screenshot) */}
                <div className="flex items-center justify-center pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeChat.messages[activeChat.messages.length - 1]?.dateGroup ||
                      '20 октября 2026 г.'}
                  </span>
                </div>

                <div ref={messagesEndRef} />

                {/* Floating Scroll Down Arrow Button (`↓` from screenshot) */}
                <button
                  onClick={scrollToBottom}
                  className="sticky bottom-2 left-full w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Прокрутить к последнему сообщению"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* 4. Bottom Message Composer (Отправка нового сообщения) */}
              <div className="bg-white border-t border-slate-200 p-3 space-y-2 shrink-0">
                {/* Active Reply or Edit Banner */}
                {(replyingTo || editingMessageId) && (
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {editingMessageId ? (
                        <>
                          <Pencil className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                          <span className="font-semibold text-slate-900 shrink-0">
                            Редактирование своего сообщения
                          </span>
                        </>
                      ) : (
                        <>
                          <Reply className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                          <span className="font-semibold text-slate-900 shrink-0">
                            В ответ {replyingTo?.sender === 'me' ? 'себе' : activeChat.interlocutorName}:
                          </span>
                          <span className="text-slate-600 truncate">{replyingTo?.text}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setEditingMessageId(null);
                        setMessageInput('');
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Deal Replies Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    onClick={() => setPriceOfferModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Banknote className="w-3 h-3 text-emerald-600" />
                    <span>Предложить цену</span>
                  </button>
                  <button
                    onClick={() =>
                      setMessageInput('Здравствуйте! Когда можно подъехать на осмотр объекта?')
                    }
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Calendar className="w-3 h-3 text-[#2563eb]" />
                    <span>Договориться о просмотре</span>
                  </button>
                  <button
                    onClick={() =>
                      setMessageInput('Пришлите, пожалуйста, геолокацию и схему заезда.')
                    }
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-[#f97316]" />
                    <span>Запросить локацию</span>
                  </button>
                </div>

                {/* Input Row: Paperclip + Input Box + Send Plane */}
                <div className="flex items-center gap-2.5 relative">
                  {/* Attachment Menu Popover */}
                  {showAttachmentMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-12 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5 text-xs"
                    >
                      <button
                        onClick={() =>
                          handleSendMessage('Прикрепляю фотографии объекта', {
                            type: 'image',
                            title: 'Фото_объекта_высокое_качество.jpg',
                            subtitle: '2.8 МБ · JPG',
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 text-left flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#2563eb]" />
                        <span>Фото или видео</span>
                      </button>
                      <button
                        onClick={() =>
                          handleSendMessage('Направляю проект договора (RU / ES)', {
                            type: 'document',
                            title: 'Contrato_Arrendamiento_ES_RU.pdf',
                            subtitle: '510 КБ · Двуязычный договор',
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 text-left flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Документ PDF</span>
                      </button>
                      <button
                        onClick={() =>
                          handleSendMessage('Точка для навигатора:', {
                            type: 'location',
                            title: 'Геолокация: Сектор B, ворота №4',
                            subtitle: 'Координаты отправлены',
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 text-left flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#f97316]" />
                        <span>Геолокация на карте</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachmentMenu(!showAttachmentMenu);
                    }}
                    className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Прикрепить файл"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative flex items-center">
                    <textarea
                      ref={composerInputRef}
                      rows={1}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Сообщение..."
                      className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] resize-none leading-snug"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="absolute right-2 text-slate-400 hover:text-[#2563eb] p-1 transition-colors cursor-pointer"
                      title={editingMessageId ? 'Сохранить изменения' : 'Отправить сообщение'}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* =====================================================================
          3. SITE FOOTER & FLOATING HELP BUTTON (Футер площадки и кнопка Помощь)
         ===================================================================== */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto py-8 px-6 shrink-0 relative">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs pl-0 lg:pl-[272px]">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              О ПЛАТФОРМЕ
            </h3>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('О платформе объявлений');
                  }}
                  className="hover:text-slate-900"
                >
                  О нас
                </a>
              </li>
              <li>
                <a
                  href="#rules"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Правила безопасности сделок');
                  }}
                  className="hover:text-slate-900"
                >
                  Безопасные сделки
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              ПОМОЩЬ
            </h3>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a
                  href="#help"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Открыт Центр помощи');
                  }}
                  className="hover:text-slate-900"
                >
                  Центр помощи
                </a>
              </li>
              <li>
                <a
                  href="#support"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Чат со службой поддержки');
                  }}
                  className="hover:text-slate-900"
                >
                  Служба поддержки
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              ДЛЯ БИЗНЕСА
            </h3>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a
                  href="#biz"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewAdModal(true);
                  }}
                  className="hover:text-slate-900"
                >
                  Размещение объявлений
                </a>
              </li>
              <li>
                <a
                  href="#pro"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Корпоративные тарифы для агентств и дилеров');
                  }}
                  className="hover:text-slate-900"
                >
                  Магазины и спецразмещение
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              СОЦСЕТИ
            </h3>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a
                  href="#community"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Сообщество пользователей');
                  }}
                  className="hover:text-slate-900"
                >
                  Сообщество
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Floating "Помощь" Circle Button from Original Screenshot */}
        <button
          onClick={() => triggerToast('Онлайн-консультант службы поддержки на связи 24/7')}
          className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#1d71b8] hover:bg-[#155d9a] text-white shadow-lg flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-105 cursor-pointer"
          title="Помощь и поддержка"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none">Помощь</span>
        </button>
      </footer>

      {/* =====================================================================
          FLOATING CONTEXT MENU 1: ENTIRE CHAT (Контекстное меню чата)
         ===================================================================== */}
      {chatMenu &&
        (() => {
          const targetChat = chats.find((c) => c.id === chatMenu.chatId) || activeChat;
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ top: chatMenu.y, left: chatMenu.x }}
              className="fixed z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 text-xs space-y-0.5"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Действия с чатом</span>
                <span className="truncate max-w-[115px]">{targetChat.interlocutorName}</span>
              </div>

              <button
                onClick={() => handleToggleChatUnread(targetChat.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                {targetChat.unreadCount > 0 ? (
                  <>
                    <MailOpen className="w-4 h-4 text-[#2563eb]" />
                    <span>Пометить как прочитанное</span>
                  </>
                ) : (
                  <>
                    <MailCheck className="w-4 h-4 text-[#2563eb]" />
                    <span>Пометить как непрочитанное</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleToggleChatPin(targetChat.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Pin className="w-4 h-4 text-slate-500" />
                <span>{targetChat.isPinned ? 'Открепить чат' : 'Закрепить чат вверху'}</span>
              </button>

              <button
                onClick={() => handleToggleChatMute(targetChat.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <BellOff className="w-4 h-4 text-slate-500" />
                <span>
                  {targetChat.isMuted ? 'Включить уведомления' : 'Отключить уведомления'}
                </span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setChatMenu(null);
                  setSelectedChatId(targetChat.id);
                  setShowListingDetailsModal(true);
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>Перейти к объявлению</span>
              </button>

              <button
                onClick={() => handleToggleChatArchive(targetChat.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Archive className="w-4 h-4 text-slate-500" />
                <span>{targetChat.isArchived ? 'Вернуть из архива' : 'В архив'}</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setChatMenu(null);
                  setReportModalTarget({
                    type: 'chat',
                    title: `Пожаловаться на ${targetChat.interlocutorName}`,
                  });
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-amber-50 text-amber-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Flag className="w-4 h-4 text-amber-600" />
                <span>Пожаловаться / Заблокировать</span>
              </button>

              <button
                onClick={() => handleDeleteChat(targetChat.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить переписку</span>
              </button>
            </div>
          );
        })()}

      {/* =====================================================================
          FLOATING CONTEXT MENU 2: SINGLE MESSAGE (Своё vs. Чужое сообщение)
         ===================================================================== */}
      {messageMenu &&
        (() => {
          const targetMsg = activeChat.messages.find((m) => m.id === messageMenu.messageId);
          if (!targetMsg) return null;
          const isOwn = targetMsg.sender === 'me';

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ top: messageMenu.y, left: messageMenu.x }}
              className="fixed z-50 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 text-xs space-y-0.5"
            >
              <div className="px-2.5 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{isOwn ? 'Ваше сообщение' : 'Сообщение собеседника'}</span>
                <span>{targetMsg.timestamp}</span>
              </div>

              <button
                onClick={() => handleStartReply(targetMsg)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Reply className="w-4 h-4 text-slate-600" />
                <span>Ответить</span>
              </button>

              {/* Incoming Foreign Message: Show Original Spanish / Return to Russian Translation */}
              {!isOwn && targetMsg.isTranslated && (
                <button
                  onClick={() => handleToggleMessageOriginal(targetMsg.id)}
                  className="w-full px-2.5 py-2 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 text-[#2563eb] font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Languages className="w-4 h-4 text-[#2563eb]" />
                    <span>
                      {targetMsg.showOriginal ? 'Вернуться к переводу' : 'Показать оригинал'}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono">ES</span>
                </button>
              )}

              {/* Own Message Only: Edit Message */}
              {isOwn && (
                <button
                  onClick={() => handleStartEditMessage(targetMsg)}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-slate-600" />
                  <span>Редактировать</span>
                </button>
              )}

              <button
                onClick={() => handleCopyMessageText(targetMsg)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Скопировать текст</span>
              </button>

              <button
                onClick={() => handleTogglePinMessage(targetMsg.id)}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <Pin className="w-4 h-4 text-slate-600" />
                <span>{targetMsg.isPinned ? 'Открепить сообщение' : 'Закрепить в чате'}</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Differentiated Bottom Action: Delete for Own vs. Report for Incoming */}
              {isOwn ? (
                <button
                  onClick={() => handleDeleteMessage(targetMsg.id)}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Удалить сообщение</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMessageMenu(null);
                    setReportModalTarget({
                      type: 'message',
                      title: `Пожаловаться на сообщение`,
                    });
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2.5 cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Пожаловаться</span>
                </button>
              )}
            </div>
          );
        })()}

      {/* =====================================================================
          INTERACTIVE MODALS (Предложить цену, Детали объявления, Новое объявление, Жалоба)
         ===================================================================== */}
      {/* 1. Price Offer Modal */}
      {priceOfferModalOpen && (
        <div
          onClick={() => setPriceOfferModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Предложить свою цену</h3>
              <button
                onClick={() => setPriceOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              Текущая цена в объявлении:{' '}
              <strong className="text-slate-900 font-mono">
                {formatPrice(activeChat.listing.priceNumeric)}
              </strong>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ваше предложение:
              </label>
              <input
                type="text"
                value={customOfferAmount}
                onChange={(e) => setCustomOfferAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPriceOfferModalOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setPriceOfferModalOpen(false);
                  handleSendMessage(`Предлагаю цену: ${customOfferAmount} ฿`, {
                    type: 'offer',
                    title: `Предложение цены: ${customOfferAmount} ฿`,
                    subtitle: 'Официальный оффер по сделке',
                  });
                }}
                className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Отправить предложение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Listing Full Details Modal */}
      {showListingDetailsModal && (
        <div
          onClick={() => setShowListingDetailsModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <ListingThumbnail
                  category={activeChat.listing.category}
                  size="lg"
                  status={activeChat.listing.status}
                />
                <div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Объявление #{activeChat.listing.id}
                  </span>
                  <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    {formatPrice(activeChat.listing.priceNumeric)}
                  </div>
                  <div className="text-xs text-slate-500">{activeChat.listing.priceNote}</div>
                </div>
              </div>
              <button
                onClick={() => setShowListingDetailsModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {activeChat.listing.title}
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Расположение:</span>
                  <span className="font-semibold text-slate-800">{activeChat.listing.location}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Статистика:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {activeChat.listing.viewsCount} просмотров · от {activeChat.listing.publishedAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowListingDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Report Modal */}
      {reportModalTarget && (
        <div
          onClick={() => setReportModalTarget(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{reportModalTarget.title}</h3>
              <button
                onClick={() => setReportModalTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">Выберите причину обращения в модерацию:</p>
            <div className="space-y-1.5 text-xs">
              {[
                'Попытка увести в сторонний мессенджер или фишинг',
                'Требование сомнительной предоплаты (криптовалюта без осмотра)',
                'Недостоверная информация о товаре или цене',
                'Спам или некорректное поведение',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setReportModalTarget(null);
                    triggerToast('Жалоба отправлена модераторам площадки');
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-[#2563eb] hover:bg-blue-50/40 text-left font-medium text-slate-800 transition-colors cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. New Ad Modal (+ Разместить объявление) */}
      {showNewAdModal && (
        <div
          onClick={() => setShowNewAdModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Новое объявление</h3>
              <button
                onClick={() => setShowNewAdModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Объявление будет автоматически переведено на испанский и английский языки для покупателей.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewAdModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowNewAdModal(false);
                  triggerToast('Черновик объявления создан в разделе «Мои объявления»');
                }}
                className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
