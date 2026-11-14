import React, { useState, useMemo, useRef, useEffect } from 'react';
import { INITIAL_CHATS, ChatThread, MessageItem } from './data/mockMessengerData';
import { ListingThumbnail } from './components/ListingThumbnail';
import {
  DSButton,
  DSIconButton,
  DSBadge,
  DSAvatar,
  DSSelect,
  DSContextMenuItem,
  DSModal,
} from './components/DesignSystem';
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
  FolderOpen,
} from 'lucide-react';

type ChatFilterTab = 'all' | 'unread' | 'buying' | 'selling' | 'archived';
type CurrencyCode = 'RUB' | 'USD' | 'EUR';
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
  // Global Marketplace Header State (Strictly RUB, USD, EUR)
  const [currency, setCurrency] = useState<CurrencyCode>('RUB');
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
  const [customOfferAmount, setCustomOfferAmount] = useState<string>('420 000');

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

  // Currency formatter helper (Strictly RUB ₽, USD $, EUR €)
  const currencySymbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';

  const formatPrice = (priceInRub: number): string => {
    if (currency === 'RUB') {
      return `${priceInRub.toLocaleString('ru-RU')} ₽`;
    }
    if (currency === 'USD') {
      const usd = Math.round(priceInRub / 92);
      return `${usd.toLocaleString('ru-RU')} $`;
    }
    const eur = Math.round(priceInRub / 100);
    return `${eur.toLocaleString('ru-RU')} €`;
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

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedChatId]);

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
    setTimeout(() => scrollToBottom('smooth'), 50);

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
      setTimeout(() => scrollToBottom('smooth'), 60);
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
    <div className="h-screen min-h-[580px] overflow-hidden flex flex-col bg-[var(--ds-canvas)] text-[var(--ds-ink-primary)]">
      {/* =====================================================================
          1. TOP MARKETPLACE HEADER (Верхнее меню площадки объявлений — фикс. высота)
         ===================================================================== */}
      <header className="bg-[var(--ds-surface)] border-b border-[var(--ds-border-base)] z-30 shrink-0">
        <div className="max-w-[1440px] mx-auto px-6 h-13 flex items-center justify-between gap-4">
          {/* Left Navigation Cluster: Каталог объявлений + Вакансии */}
          <div className="flex items-center gap-5">
            <DSButton
              variant="primary"
              size="md"
              rightIcon={<LayoutGrid className="w-4 h-4" />}
              onClick={() => triggerToast('Открыт каталог категорий объявлений')}
            >
              Каталог объявлений
            </DSButton>

            <button
              onClick={() => triggerToast('Переход в раздел «Вакансии»')}
              className="text-xs font-medium text-[var(--ds-ink-secondary)] hover:text-[var(--ds-primary)] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Briefcase className="w-4 h-4 text-[var(--ds-success)]" />
              <span>Вакансии</span>
            </button>
          </div>

          {/* Right Action Cluster: Currency (₽/$/€), Language, Разместить объявление, Icons, Profile */}
          <div className="flex items-center gap-3">
            {/* Currency Switcher (Strictly RUB ₽, USD $, EUR €) */}
            <div className="w-20">
              <DSSelect
                compact
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as CurrencyCode);
                  triggerToast(`Валюта цен переключена на ${e.target.value}`);
                }}
                aria-label="Выбор валюты"
              >
                <option value="RUB">₽ RUB</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </DSSelect>
            </div>

            {/* Language Switcher (RU / ES) */}
            <div className="w-24">
              <DSSelect
                compact
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
              >
                <option value="RU">🇷🇺 RU</option>
                <option value="ES">🇪🇸 ES</option>
              </DSSelect>
            </div>

            {/* Orange Primary CTA: + Разместить объявление */}
            <DSButton
              variant="cta"
              size="md"
              leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              onClick={() => setShowNewAdModal(true)}
            >
              Разместить объявление
            </DSButton>

            {/* Header Quick Icons: Messages, Favorites, Notifications, Profile Avatar */}
            <div className="flex items-center gap-1.5 pl-1">
              <DSIconButton
                badgeCount={totalUnreadMessagesSum}
                badgeTone="primary"
                onClick={() => {
                  setActiveSidebarItem('messages');
                  setChatFilter('all');
                }}
                title="Сообщения"
              >
                <MessageCircle className="w-[19px] h-[19px]" />
              </DSIconButton>

              <DSIconButton
                badgeCount={favoritesCount}
                badgeTone="cta"
                onClick={() => {
                  setFavoritesCount((c) => (c === 8 ? 9 : 8));
                  triggerToast('Открыт список избранных объявлений');
                }}
                title="Избранное"
              >
                <Heart className="w-[19px] h-[19px]" />
              </DSIconButton>

              <div className="relative">
                <DSIconButton
                  badgeCount={notificationsCount}
                  badgeTone="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotificationsPopover(!showNotificationsPopover);
                  }}
                  title="Системные уведомления"
                >
                  <Bell className="w-[19px] h-[19px]" />
                </DSIconButton>

                {showNotificationsPopover && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-80 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-md)] shadow-[var(--ds-shadow-floating)] p-3 z-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--ds-border-subtle)]">
                      <span className="font-bold text-[var(--ds-ink-primary)]">
                        Уведомления ({notificationsCount})
                      </span>
                      <button
                        onClick={() => {
                          setNotificationsCount(0);
                          setShowNotificationsPopover(false);
                          triggerToast('Все системные уведомления прочитаны');
                        }}
                        className="text-[var(--ds-primary)] hover:underline font-medium cursor-pointer"
                      >
                        Сбросить все
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto ds-scroll">
                      <div
                        onClick={() => {
                          setSelectedChatId('c2');
                          setShowNotificationsPopover(false);
                        }}
                        className="p-2 rounded-lg bg-[var(--ds-primary-soft)] hover:bg-blue-100/60 cursor-pointer"
                      >
                        <div className="font-semibold text-[var(--ds-ink-primary)]">
                          Новое сообщение от Алехандро Ривера
                        </div>
                        <div className="text-[var(--ds-ink-muted)] truncate">
                          «Когда можно посмотреть объект?»
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedChatId('c5');
                          setShowNotificationsPopover(false);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--ds-surface-subtle)] cursor-pointer"
                      >
                        <div className="font-semibold text-[var(--ds-ink-primary)]">
                          3 новых сообщения от Матео Фернандес
                        </div>
                        <div className="text-[var(--ds-ink-muted)] truncate">
                          «Удобно ли вам провести видеопоказ в четверг в 17:00?»
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveSidebarItem('profile')}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-[var(--ds-ink-secondary)] font-bold text-xs flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Профиль: Павел Громов"
              >
                ПГ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN WORKSPACE: Занимает ровно всё доступное место между Header и Footer
          (flex-1 min-h-0 overflow-hidden) с минимальным отступом py-2.5 (10px)
         ===================================================================== */}
      <main className="flex-1 min-h-0 max-w-[1440px] w-full mx-auto px-6 py-2.5 flex gap-4 items-stretch overflow-hidden">
        {/* LEFT PROFILE SIDEBAR (Левый сайдбар личного кабинета) */}
        <aside className="w-[236px] shrink-0 h-full min-h-0 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-lg)] p-3 shadow-[var(--ds-shadow-xs)] flex flex-col justify-between overflow-hidden">
          {/* Profile Avatar & Title */}
          <div className="pb-2.5 flex flex-col items-center text-center border-b border-[var(--ds-border-subtle)] shrink-0">
            <div className="mb-1.5">
              <DSAvatar code="ПГ" size="md" colorTone="blue" online />
            </div>
            <h2 className="text-xs font-bold text-[var(--ds-ink-primary)]">Павел Громов</h2>
            <span className="text-[11px] text-[var(--ds-ink-subtle)]">
              Профиль · Верифицирован
            </span>
          </div>

          {/* Sidebar Navigation Menu */}
          <nav className="flex-1 min-h-0 overflow-y-auto ds-scroll py-1.5 space-y-0.5 text-xs">
            <button
              onClick={() => {
                setActiveSidebarItem('profile');
                triggerToast('Раздел «Профиль»');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'profile'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Профиль</span>
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('my-ads');
                setChatFilter('selling');
                triggerToast('В списке чатов отфильтрованы диалоги по вашим объявлениям');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'my-ads'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Мои объявления</span>
              </span>
              <DSBadge tone="neutral">99+</DSBadge>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('messages');
                setChatFilter('all');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'messages'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[var(--ds-primary)]" />
                <span>Сообщения</span>
              </span>
              {totalUnreadMessagesSum > 0 && (
                <DSBadge tone="primary">{totalUnreadMessagesSum}</DSBadge>
              )}
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('favorites');
                setChatFilter('buying');
                triggerToast('Показаны диалоги по интересующим вас объявлениям («Покупаю»)');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'favorites'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Избранное</span>
              </span>
              <DSBadge tone="neutral">{favoritesCount}</DSBadge>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('filters');
                triggerToast('Сохранённые поисковые фильтры');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'filters'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Мои фильтры</span>
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('reviews');
                triggerToast('Отзывы и рейтинг (4.9 ★)');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'reviews'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Отзывы</span>
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('notifications');
                setChatFilter('unread');
                triggerToast('Включён фильтр непрочитанных сообщений');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'notifications'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Уведомления</span>
              </span>
              <DSBadge tone="primary">{notificationsCount}</DSBadge>
            </button>

            <button
              onClick={() => {
                setActiveSidebarItem('settings');
                triggerToast('Настройки аккаунта и автоперевода чатов');
              }}
              className={`w-full px-2.5 py-1.5 rounded-[var(--ds-radius-sm)] flex items-center justify-between transition-colors cursor-pointer ${
                activeSidebarItem === 'settings'
                  ? 'bg-[var(--ds-primary-soft)] text-[var(--ds-primary)] font-semibold'
                  : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-subtle)] font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-[var(--ds-ink-subtle)]" />
                <span>Настройки</span>
              </span>
            </button>
          </nav>

          {/* Logout Button at Bottom of Profile Card */}
          <div className="pt-2 border-t border-[var(--ds-border-subtle)] shrink-0">
            <DSButton
              variant="soft"
              size="sm"
              className="w-full"
              rightIcon={<LogOut className="w-3.5 h-3.5 text-[var(--ds-ink-muted)]" />}
              onClick={() => triggerToast('Выход из аккаунта')}
            >
              Выйти из аккаунта
            </DSButton>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA: "Сообщения" Title + Messenger Card */}
        <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <h1 className="text-lg font-bold text-[var(--ds-ink-primary)] tracking-tight leading-none">
              Сообщения
            </h1>
            <div className="flex items-center gap-3 text-xs text-[var(--ds-ink-muted)]">
              <span>Диалогов: {filteredChats.length}</span>
              <span>·</span>
              <span>Автоперевод: Испанский (ES) ↔ Русский (RU)</span>
            </div>
          </div>

          {/* =================================================================
              MESSENGER UNIFIED WORKSPACE (Список чатов + Окно переписки)
              grid-rows-1 + flex-1 min-h-0 гарантирует, что списки скроллятся внутри!
             ================================================================= */}
          <div className="flex-1 min-h-0 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-lg)] shadow-[var(--ds-shadow-xs)] overflow-hidden grid grid-cols-12 grid-rows-1 relative">
            {/* ---------------------------------------------------------------
                COLUMN A: SEPARATE CHAT LIST (Отдельный список чатов - 5 cols)
               --------------------------------------------------------------- */}
            <section className="col-span-5 border-r border-[var(--ds-border-base)] flex flex-col h-full min-h-0 overflow-hidden bg-[var(--ds-surface)]">
              {/* Search & Listing Filter Header */}
              <div className="p-3 border-b border-[var(--ds-border-subtle)] space-y-2 shrink-0">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--ds-ink-subtle)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Найти собеседника или объявление"
                    className="w-full pl-9 pr-8 py-1.5 bg-[var(--ds-surface-subtle)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-sm)] text-xs text-[var(--ds-ink-primary)] placeholder:text-[var(--ds-ink-subtle)] focus:outline-none focus:bg-white focus:border-[var(--ds-primary)] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-ink-subtle)] hover:text-[var(--ds-ink-secondary)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter by Specific Listing Dropdown ("По объявлению") */}
                <DSSelect
                  compact
                  value={selectedListingFilter}
                  onChange={(e) => setSelectedListingFilter(e.target.value)}
                  aria-label="По объявлению"
                >
                  <option value="all">По объявлению: Все объявления ({chats.length})</option>
                  {chats.map((c) => (
                    <option key={c.listing.id} value={c.listing.id}>
                      {c.role === 'selling' ? 'Моё объявление: ' : 'Покупаю: '}
                      {c.listing.title.slice(0, 34)}... ({formatPrice(c.listing.priceRub)})
                    </option>
                  ))}
                </DSSelect>

                {/* Filter Tabs: Все | Непрочитанные | Покупаю | Продаю | Архив */}
                <div className="flex items-center justify-between gap-1 border-b border-[var(--ds-border-subtle)] pt-0.5 -mx-3 px-3">
                  <button
                    onClick={() => setChatFilter('all')}
                    className={`pb-1.5 px-1.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'all'
                        ? 'border-[var(--ds-ink-primary)] text-[var(--ds-ink-primary)]'
                        : 'border-transparent text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)]'
                    }`}
                  >
                    Все ({chats.filter((c) => !c.isArchived).length})
                  </button>
                  <button
                    onClick={() => setChatFilter('unread')}
                    className={`pb-1.5 px-1.5 text-[11px] font-semibold border-b-2 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'unread'
                        ? 'border-[var(--ds-ink-primary)] text-[var(--ds-ink-primary)]'
                        : 'border-transparent text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)]'
                    }`}
                  >
                    <span>Непрочитанные</span>
                    {totalUnreadChatsCount > 0 && (
                      <DSBadge tone="primary">{totalUnreadChatsCount}</DSBadge>
                    )}
                  </button>
                  <button
                    onClick={() => setChatFilter('buying')}
                    className={`pb-1.5 px-1.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'buying'
                        ? 'border-[var(--ds-ink-primary)] text-[var(--ds-ink-primary)]'
                        : 'border-transparent text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)]'
                    }`}
                  >
                    Покупаю
                  </button>
                  <button
                    onClick={() => setChatFilter('selling')}
                    className={`pb-1.5 px-1.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'selling'
                        ? 'border-[var(--ds-ink-primary)] text-[var(--ds-ink-primary)]'
                        : 'border-transparent text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)]'
                    }`}
                  >
                    Продаю
                  </button>
                  <button
                    onClick={() => setChatFilter('archived')}
                    className={`pb-1.5 px-1.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chatFilter === 'archived'
                        ? 'border-[var(--ds-ink-primary)] text-[var(--ds-ink-primary)]'
                        : 'border-transparent text-[var(--ds-ink-subtle)] hover:text-[var(--ds-ink-secondary)]'
                    }`}
                  >
                    Архив
                  </button>
                </div>
              </div>

              {/* Scrollable Chat List (15 items with realistic photos & names) */}
              <div className="flex-1 min-h-0 overflow-y-auto ds-scroll divide-y divide-[var(--ds-border-subtle)]">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center space-y-2.5">
                    <p className="text-sm font-semibold text-[var(--ds-ink-secondary)]">
                      Чаты не найдены
                    </p>
                    <p className="text-xs text-[var(--ds-ink-muted)]">
                      Попробуйте изменить параметры поиска или переключить вкладку фильтра.
                    </p>
                    <DSButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setChatFilter('all');
                        setSelectedListingFilter('all');
                        setSearchQuery('');
                      }}
                    >
                      Сбросить фильтры
                    </DSButton>
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
                        className={`group relative px-3.5 py-2.5 transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[var(--ds-surface-selected)] hover:bg-blue-100/60'
                            : hasUnread
                            ? 'bg-slate-50/80 hover:bg-slate-100/70'
                            : 'bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-hover)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Realistic User Photo or Colored Initials Avatar + Online indicator */}
                          <div className="mt-0.5">
                            <DSAvatar
                              code={chat.interlocutorCode}
                              avatarUrl={chat.avatarUrl}
                              alt={chat.interlocutorName}
                              colorTone={chat.avatarColor}
                              size="md"
                              online={chat.interlocutorOnline}
                              selected={isSelected}
                            />
                          </div>

                          {/* Center Info Block */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* Line 1: Realistic Interlocutor Name + Subtitle + Pin/Mute + Date */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`text-xs truncate ${
                                    hasUnread || isSelected
                                      ? 'font-bold text-[var(--ds-ink-primary)]'
                                      : 'font-semibold text-[var(--ds-ink-secondary)]'
                                  }`}
                                >
                                  {chat.interlocutorName}
                                </span>
                                <span className="text-[11px] text-[var(--ds-ink-subtle)] truncate hidden xl:inline">
                                  · {chat.interlocutorSubtitle}
                                </span>
                                {chat.isPinned && (
                                  <Pin className="w-3 h-3 text-[var(--ds-ink-subtle)] shrink-0 rotate-45" />
                                )}
                                {chat.isMuted && (
                                  <BellOff className="w-3 h-3 text-[var(--ds-ink-subtle)] shrink-0" />
                                )}
                              </div>

                              <span
                                className={`text-[11px] font-mono tabular-nums shrink-0 group-hover:opacity-0 transition-opacity ${
                                  hasUnread
                                    ? 'text-[var(--ds-primary)] font-semibold'
                                    : 'text-[var(--ds-ink-subtle)]'
                                }`}
                              >
                                {chat.lastUpdatedDate}
                              </span>
                            </div>

                            {/* Line 2: Role Badge ("Моё объявление") + Listing Title + Price in RUB/USD/EUR */}
                            <div
                              className="flex items-center gap-1.5 text-[11px]"
                              title={`${chat.listing.title} — ${formatPrice(chat.listing.priceRub)}`}
                            >
                              {chat.role === 'selling' && (
                                <span className="text-[var(--ds-primary)] font-semibold shrink-0">
                                  Моё объявление
                                </span>
                              )}
                              <span className="text-[var(--ds-ink-muted)] truncate font-medium">
                                {chat.listing.title}
                              </span>
                              <span className="text-slate-300 shrink-0">·</span>
                              <span className="font-mono font-semibold text-[var(--ds-ink-primary)] tabular-nums shrink-0">
                                {formatPrice(chat.listing.priceRub)}
                              </span>
                            </div>

                            {/* Line 3: Last Message Preview + Unread Counter */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <p
                                className={`text-xs truncate ${
                                  hasUnread
                                    ? 'font-semibold text-[var(--ds-ink-primary)]'
                                    : 'text-[var(--ds-ink-muted)]'
                                }`}
                              >
                                {lastMsg ? (
                                  <>
                                    {lastMsg.sender === 'me' && (
                                      <span className="text-[var(--ds-ink-subtle)] font-normal">
                                        Вы:{' '}
                                      </span>
                                    )}
                                    {lastMsg.attachment && !lastMsg.text ? 'Фото' : lastMsg.text}
                                  </>
                                ) : (
                                  'Нет сообщений'
                                )}
                              </p>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {hasUnread && <DSBadge tone="primary">{chat.unreadCount}</DSBadge>}
                              </div>
                            </div>
                          </div>

                          {/* Listing Category Thumbnail on Right */}
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
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-2 right-2 w-7 h-7 rounded-lg bg-white border border-[var(--ds-border-base)] shadow-[var(--ds-shadow-xs)] flex items-center justify-center text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)] hover:bg-slate-50 transition-opacity cursor-pointer"
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
            <section className="col-span-7 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--ds-surface-subtle)] relative">
              {/* 1. Top Interlocutor Header */}
              <div className="px-4 py-2 bg-[var(--ds-surface)] border-b border-[var(--ds-border-base)] flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <DSAvatar
                    code={activeChat.interlocutorCode}
                    avatarUrl={activeChat.avatarUrl}
                    alt={activeChat.interlocutorName}
                    colorTone={activeChat.avatarColor}
                    size="sm"
                    online={activeChat.interlocutorOnline}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[var(--ds-ink-primary)] truncate">
                        {activeChat.interlocutorName}
                      </h2>
                      <span className="text-xs text-[var(--ds-ink-muted)] truncate">
                        · {activeChat.interlocutorSubtitle}
                      </span>
                      <span className="text-xs text-amber-600 font-mono tabular-nums shrink-0">
                        ★ {activeChat.interlocutorRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--ds-ink-muted)]">
                      <span>{activeChat.interlocutorRoleLabel}</span>
                      <span>·</span>
                      <span
                        className={
                          activeChat.interlocutorOnline
                            ? 'text-[var(--ds-success)] font-medium'
                            : 'text-[var(--ds-ink-subtle)]'
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
                    <div className="flex items-center bg-[var(--ds-primary-soft)] border border-[var(--ds-primary-border)] rounded-[var(--ds-radius-sm)] p-0.5 text-xs">
                      <button
                        onClick={handleToggleAllOriginalsInChat}
                        className="px-2.5 py-1 rounded-md font-medium text-blue-800 hover:bg-blue-100/70 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        title="Показать оригинал (Испанский) или вернуться к переводу для всех сообщений"
                      >
                        <Languages className="w-3.5 h-3.5 text-[var(--ds-primary)] shrink-0" />
                        <span>ES → RU</span>
                      </button>
                      <button
                        onClick={() =>
                          setTranslationMode((prev) => (prev === 'stacked' ? 'replace' : 'stacked'))
                        }
                        className="px-2 py-1 text-[11px] font-mono text-blue-700 hover:text-blue-950 border-l border-[var(--ds-primary-border)] cursor-pointer whitespace-nowrap"
                        title="Переключить режим просмотра оригинала: Параллельно (Сверка) или Замена текста"
                      >
                        {translationMode === 'stacked' ? 'Сверка' : 'Замена'}
                      </button>
                    </div>
                  )}

                  <DSIconButton
                    size="sm"
                    active={inChatSearchOpen}
                    onClick={() => {
                      setInChatSearchOpen(!inChatSearchOpen);
                      setInChatSearchQuery('');
                    }}
                    title="Поиск по сообщениям"
                  >
                    <Search className="w-4 h-4" />
                  </DSIconButton>

                  <DSIconButton
                    size="sm"
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
                    title="Контекстное меню чата"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </DSIconButton>
                </div>
              </div>

              {/* Optional In-Chat Search Input Bar */}
              {inChatSearchOpen && (
                <div className="px-5 py-2 bg-[var(--ds-surface-muted)] border-b border-[var(--ds-border-base)] flex items-center gap-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-[var(--ds-ink-muted)] shrink-0" />
                  <input
                    type="text"
                    value={inChatSearchQuery}
                    onChange={(e) => setInChatSearchQuery(e.target.value)}
                    placeholder="Поиск по русскому переводу или испанскому оригиналу..."
                    className="flex-1 bg-transparent text-xs text-[var(--ds-ink-primary)] focus:outline-none"
                    autoFocus
                  />
                  <span className="text-[11px] font-mono text-[var(--ds-ink-muted)] tabular-nums">
                    Найдено: {visibleMessages.length}
                  </span>
                  <button
                    onClick={() => {
                      setInChatSearchOpen(false);
                      setInChatSearchQuery('');
                    }}
                    className="text-xs text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)] cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>
              )}

              {/* 2. Pinned Listing Context Bar (Складское помещение 600 м² · 450 000 ₽) */}
              <div className="px-5 py-2 bg-[var(--ds-surface)] border-b border-[var(--ds-border-base)] flex flex-col gap-1.5 shrink-0">
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
                          className={`text-xs font-bold text-[var(--ds-ink-primary)] group-hover/adtitle:text-[var(--ds-primary)] transition-colors ${
                            expandFullListingTitle ? '' : 'line-clamp-1'
                          }`}
                        >
                          {activeChat.listing.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-[var(--ds-ink-primary)] font-mono tabular-nums">
                          {formatPrice(activeChat.listing.priceRub)}
                        </span>
                        {activeChat.listing.priceNote && (
                          <span className="text-[11px] text-[var(--ds-ink-muted)]">
                            · {activeChat.listing.priceNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Context Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <DSButton
                      variant="soft"
                      size="xs"
                      onClick={() => setPriceOfferModalOpen(true)}
                    >
                      Торг / Цена
                    </DSButton>
                    <DSButton
                      variant="secondary"
                      size="xs"
                      rightIcon={<ExternalLink className="w-3 h-3 text-[var(--ds-ink-subtle)]" />}
                      onClick={() => setShowListingDetailsModal(true)}
                    >
                      Объявление
                    </DSButton>
                  </div>
                </div>

                {/* Pinned Message Banner (if any) */}
                {pinnedMessage && (
                  <div className="pt-1 border-t border-[var(--ds-border-subtle)] flex items-center justify-between gap-2 text-[11px] text-[var(--ds-ink-secondary)]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Pin className="w-3 h-3 text-[var(--ds-primary)] shrink-0 rotate-45" />
                      <span className="font-semibold text-[var(--ds-primary)] shrink-0">
                        Закреплено:
                      </span>
                      <span className="truncate">{pinnedMessage.text}</span>
                    </div>
                    <button
                      onClick={() => handleTogglePinMessage(pinnedMessage.id)}
                      className="text-[var(--ds-ink-subtle)] hover:text-[var(--ds-ink-primary)] shrink-0 cursor-pointer"
                    >
                      Открепить
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Scrollable Messages Stream (17+ messages with visible .ds-scroll scrollbar and date dividers!) */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto ds-scroll px-5 py-3 space-y-2 relative"
              >
                {visibleMessages.map((msg, index) => {
                  const isMe = msg.sender === 'me';
                  const isLongMessage = msg.text.length > 220;
                  const isExpanded = expandedLongMessages[msg.id] ?? true;
                  const showUnreadDivider = index === firstUnreadIndex;
                  const prevDateGroup = index > 0 ? visibleMessages[index - 1].dateGroup : null;
                  const showDateDivider = msg.dateGroup !== prevDateGroup;

                  return (
                    <React.Fragment key={msg.id}>
                      {/* Chronological Date Divider */}
                      {showDateDivider && (
                        <div className="flex items-center justify-center py-1.5">
                          <span className="px-3 py-0.5 rounded-full bg-slate-200/75 text-[11px] font-medium text-[var(--ds-ink-secondary)]">
                            {msg.dateGroup}
                          </span>
                        </div>
                      )}

                      {/* Unread Messages Divider */}
                      {showUnreadDivider && (
                        <div className="flex items-center gap-3 my-2.5">
                          <div className="h-px bg-blue-300 flex-1" />
                          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[var(--ds-primary-soft)] border border-[var(--ds-primary-border)] text-[11px] font-semibold text-[var(--ds-primary)]">
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
                            className={`relative rounded-2xl px-3.5 py-2 shadow-[var(--ds-shadow-xs)] transition-colors ${
                              isMe
                                ? 'bg-[var(--ds-bubble-out-bg)] text-[var(--ds-ink-primary)] border border-[var(--ds-bubble-out-border)] rounded-br-xs'
                                : msg.isUnread
                                ? 'bg-[var(--ds-bubble-in-bg)] text-[var(--ds-ink-primary)] border-2 border-[var(--ds-primary)] rounded-bl-xs'
                                : 'bg-[var(--ds-bubble-in-bg)] text-[var(--ds-ink-primary)] border border-[var(--ds-bubble-in-border)] rounded-bl-xs'
                            }`}
                          >
                            {/* Reply Quote Block */}
                            {msg.replyTo && (
                              <div className="mb-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] text-[var(--ds-ink-secondary)]">
                                <div className="font-semibold text-[var(--ds-ink-primary)]">
                                  В ответ {msg.replyTo.senderName}:
                                </div>
                                <div className="truncate">{msg.replyTo.text}</div>
                              </div>
                            )}

                            {/* Attachment Block */}
                            {msg.attachment && (
                              <div className="mb-2 p-2.5 rounded-xl bg-[var(--ds-surface-subtle)] border border-[var(--ds-border-base)] flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-[var(--ds-primary)] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                                  {msg.attachment.type === 'offer' ? currencySymbol : 'FILE'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-[var(--ds-ink-primary)] truncate">
                                    {msg.attachment.title}
                                  </div>
                                  {msg.attachment.subtitle && (
                                    <div className="text-[10px] text-[var(--ds-ink-muted)] truncate">
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
                                    className="ml-1.5 text-[11px] font-semibold text-[var(--ds-primary)] hover:underline cursor-pointer"
                                  >
                                    {isExpanded ? 'Свернуть' : 'Читать полностью'}
                                  </button>
                                )}
                              </div>

                              {/* Inline Timestamp + Read Checkmarks */}
                              <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums text-[var(--ds-ink-subtle)] select-none shrink-0 ml-auto">
                                {msg.isPinned && (
                                  <Pin className="w-2.5 h-2.5 text-[var(--ds-primary)] rotate-45" />
                                )}
                                {msg.isEdited && <span>изм.</span>}
                                <span>{msg.timestamp}</span>
                                {isMe && (
                                  <span title="Прочитано">
                                    {msg.readStatus === 'read' ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-[var(--ds-success)]" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-[var(--ds-ink-subtle)]" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stacked Spanish Original Block */}
                            {msg.isTranslated &&
                              msg.showOriginal &&
                              translationMode === 'stacked' &&
                              msg.originalText && (
                                <div className="mt-2 pt-2 border-t border-[var(--ds-border-base)] bg-[var(--ds-surface-subtle)] -mx-1.5 px-2.5 py-1.5 rounded-lg space-y-0.5">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ds-ink-subtle)]">
                                    <span>Оригинал · Испанский (ES):</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard?.writeText(msg.originalText || '');
                                        triggerToast('Испанский оригинал скопирован');
                                      }}
                                      className="text-[var(--ds-primary)] hover:underline cursor-pointer"
                                    >
                                      Копировать ES
                                    </button>
                                  </div>
                                  <p className="text-xs text-[var(--ds-ink-secondary)] leading-relaxed select-all">
                                    {msg.originalText}
                                  </p>
                                </div>
                              )}

                            {/* Automatic Translation Control Bar inside Bubble (ES -> RU) */}
                            {msg.isTranslated && msg.originalText && (
                              <div className="mt-1.5 pt-1.5 border-t border-[var(--ds-border-subtle)] flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-[var(--ds-ink-subtle)] flex items-center gap-1">
                                  <Languages className="w-3 h-3 text-[var(--ds-primary)] shrink-0" />
                                  <span>
                                    {msg.showOriginal && translationMode === 'replace'
                                      ? 'Оригинал (Испанский)'
                                      : 'Переведено с испанского'}
                                  </span>
                                </span>
                                <button
                                  onClick={(e) => handleToggleMessageOriginal(msg.id, e)}
                                  className="font-semibold text-[var(--ds-primary)] hover:text-blue-800 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {msg.showOriginal ? 'Вернуться к переводу' : 'Показать оригинал'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* `⋮` Trigger Button Next to Bubble */}
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
                              className="w-7 h-7 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)] transition-colors cursor-pointer"
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
                  <div className="flex items-center gap-2 text-xs text-[var(--ds-ink-subtle)] pl-1">
                    <span>{activeChat.interlocutorName} печатает на испанском (ES)...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />

                {/* Floating Scroll Down Arrow Button (`↓`) */}
                <button
                  onClick={() => scrollToBottom('smooth')}
                  className="sticky bottom-2 left-full w-8 h-8 rounded-full bg-[var(--ds-surface)] border border-[var(--ds-border-base)] shadow-[var(--ds-shadow-sm)] flex items-center justify-center text-[var(--ds-ink-secondary)] hover:text-[var(--ds-ink-primary)] hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Прокрутить к последнему сообщению"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* 4. Bottom Message Composer (Отправка нового сообщения) */}
              <div className="bg-[var(--ds-surface)] border-t border-[var(--ds-border-base)] p-3 space-y-2 shrink-0">
                {/* Active Reply or Edit Banner */}
                {(replyingTo || editingMessageId) && (
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--ds-primary-soft)] border border-[var(--ds-primary-border)] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {editingMessageId ? (
                        <>
                          <Pencil className="w-3.5 h-3.5 text-[var(--ds-primary)] shrink-0" />
                          <span className="font-semibold text-[var(--ds-ink-primary)] shrink-0">
                            Редактирование своего сообщения
                          </span>
                        </>
                      ) : (
                        <>
                          <Reply className="w-3.5 h-3.5 text-[var(--ds-primary)] shrink-0" />
                          <span className="font-semibold text-[var(--ds-ink-primary)] shrink-0">
                            В ответ {replyingTo?.sender === 'me' ? 'себе' : activeChat.interlocutorName}:
                          </span>
                          <span className="text-[var(--ds-ink-secondary)] truncate">
                            {replyingTo?.text}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setEditingMessageId(null);
                        setMessageInput('');
                      }}
                      className="text-[var(--ds-ink-subtle)] hover:text-[var(--ds-ink-primary)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Deal Replies Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <DSButton
                    variant="soft"
                    size="xs"
                    leftIcon={<Banknote className="w-3 h-3 text-[var(--ds-success)]" />}
                    onClick={() => setPriceOfferModalOpen(true)}
                  >
                    Предложить цену
                  </DSButton>
                  <DSButton
                    variant="soft"
                    size="xs"
                    leftIcon={<Calendar className="w-3 h-3 text-[var(--ds-primary)]" />}
                    onClick={() =>
                      setMessageInput('Здравствуйте! Когда можно подъехать на осмотр объекта?')
                    }
                  >
                    Договориться о просмотре
                  </DSButton>
                  <DSButton
                    variant="soft"
                    size="xs"
                    leftIcon={<MapPin className="w-3 h-3 text-[var(--ds-cta)]" />}
                    onClick={() =>
                      setMessageInput('Пришлите, пожалуйста, геолокацию и схему заезда.')
                    }
                  >
                    Запросить локацию
                  </DSButton>
                </div>

                {/* Input Row: Paperclip + Input Box + Send Plane */}
                <div className="flex items-center gap-2.5 relative">
                  {/* Attachment Menu Popover */}
                  {showAttachmentMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-12 left-0 w-60 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-md)] shadow-[var(--ds-shadow-floating)] p-1.5 z-30 space-y-0.5 text-xs"
                    >
                      <DSContextMenuItem
                        icon={<FileText className="w-4 h-4 text-[var(--ds-primary)]" />}
                        onClick={() =>
                          handleSendMessage('Прикрепляю фотографии объекта', {
                            type: 'image',
                            title: 'Фото_объекта_высокое_качество.jpg',
                            subtitle: '2.8 МБ · JPG',
                          })
                        }
                      >
                        Фото или видео
                      </DSContextMenuItem>
                      <DSContextMenuItem
                        icon={<FileText className="w-4 h-4 text-[var(--ds-success)]" />}
                        onClick={() =>
                          handleSendMessage('Направляю проект договора (RU / ES)', {
                            type: 'document',
                            title: 'Contrato_Arrendamiento_ES_RU.pdf',
                            subtitle: '510 КБ · Двуязычный договор',
                          })
                        }
                      >
                        Документ PDF
                      </DSContextMenuItem>
                      <DSContextMenuItem
                        icon={<MapPin className="w-4 h-4 text-[var(--ds-cta)]" />}
                        onClick={() =>
                          handleSendMessage('Точка для навигатора:', {
                            type: 'location',
                            title: 'Геолокация: Сектор B, ворота №4',
                            subtitle: 'Координаты отправлены',
                          })
                        }
                      >
                        Геолокация на карте
                      </DSContextMenuItem>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachmentMenu(!showAttachmentMenu);
                    }}
                    className="w-9 h-9 rounded-lg hover:bg-[var(--ds-surface-muted)] text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
                      className="w-full pl-3.5 pr-10 py-2 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-md)] text-xs sm:text-sm text-[var(--ds-ink-primary)] placeholder:text-[var(--ds-ink-subtle)] focus:outline-none focus:border-[var(--ds-primary)] resize-none leading-snug"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="absolute right-2 text-[var(--ds-ink-subtle)] hover:text-[var(--ds-primary)] p-1 transition-colors cursor-pointer"
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
          3. SITE FOOTER & FLOATING HELP BUTTON (Компактный футер фиксированной высоты)
         ===================================================================== */}
      <footer className="bg-[var(--ds-surface)] border-t border-[var(--ds-border-base)] py-2 px-6 shrink-0 relative">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-[11px] leading-snug pl-0 lg:pl-[252px]">
          <div className="space-y-0.5">
            <h3 className="font-bold text-[var(--ds-ink-primary)] tracking-wide text-[11px]">
              О платформе
            </h3>
            <ul className="space-y-0.5 text-[var(--ds-ink-muted)]">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('О платформе объявлений');
                  }}
                  className="hover:text-[var(--ds-ink-primary)]"
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
                  className="hover:text-[var(--ds-ink-primary)]"
                >
                  Безопасные сделки
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-bold text-[var(--ds-ink-primary)] tracking-wide text-[11px]">
              Помощь
            </h3>
            <ul className="space-y-0.5 text-[var(--ds-ink-muted)]">
              <li>
                <a
                  href="#help"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Открыт Центр помощи');
                  }}
                  className="hover:text-[var(--ds-ink-primary)]"
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
                  className="hover:text-[var(--ds-ink-primary)]"
                >
                  Служба поддержки
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-bold text-[var(--ds-ink-primary)] tracking-wide text-[11px]">
              Для бизнеса
            </h3>
            <ul className="space-y-0.5 text-[var(--ds-ink-muted)]">
              <li>
                <a
                  href="#biz"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewAdModal(true);
                  }}
                  className="hover:text-[var(--ds-ink-primary)]"
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
                  className="hover:text-[var(--ds-ink-primary)]"
                >
                  Магазины и спецразмещение
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-bold text-[var(--ds-ink-primary)] tracking-wide text-[11px]">
              Соцсети
            </h3>
            <ul className="space-y-0.5 text-[var(--ds-ink-muted)]">
              <li>
                <a
                  href="#community"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerToast('Сообщество пользователей');
                  }}
                  className="hover:text-[var(--ds-ink-primary)]"
                >
                  Сообщество
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Floating "Помощь" Circle Button */}
        <button
          onClick={() => triggerToast('Онлайн-консультант службы поддержки на связи 24/7')}
          className="fixed bottom-3 right-5 z-40 w-11 h-11 rounded-full bg-[#1d71b8] hover:bg-[#155d9a] text-white shadow-lg flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-105 cursor-pointer"
          title="Помощь и поддержка"
        >
          <MessageCircle className="w-4 h-4" />
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
              className="fixed z-50 w-64 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-md)] shadow-[var(--ds-shadow-floating)] p-1.5 text-xs space-y-0.5"
            >
              <div className="px-2.5 py-1.5 border-b border-[var(--ds-border-subtle)] flex items-center justify-between text-[11px] text-[var(--ds-ink-subtle)] font-mono">
                <span>Действия с чатом</span>
                <span className="truncate max-w-[115px]">{targetChat.interlocutorName}</span>
              </div>

              <DSContextMenuItem
                icon={
                  targetChat.unreadCount > 0 ? (
                    <MailOpen className="w-4 h-4 text-[var(--ds-primary)]" />
                  ) : (
                    <MailCheck className="w-4 h-4 text-[var(--ds-primary)]" />
                  )
                }
                onClick={() => handleToggleChatUnread(targetChat.id)}
              >
                {targetChat.unreadCount > 0
                  ? 'Пометить как прочитанное'
                  : 'Пометить как непрочитанное'}
              </DSContextMenuItem>

              <DSContextMenuItem
                icon={<Pin className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleToggleChatPin(targetChat.id)}
              >
                {targetChat.isPinned ? 'Открепить чат' : 'Закрепить чат вверху'}
              </DSContextMenuItem>

              <DSContextMenuItem
                icon={<BellOff className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleToggleChatMute(targetChat.id)}
              >
                {targetChat.isMuted ? 'Включить уведомления' : 'Отключить уведомления'}
              </DSContextMenuItem>

              <div className="my-1 border-t border-[var(--ds-border-subtle)]" />

              <DSContextMenuItem
                icon={<ExternalLink className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => {
                  setChatMenu(null);
                  setSelectedChatId(targetChat.id);
                  setShowListingDetailsModal(true);
                }}
              >
                Перейти к объявлению
              </DSContextMenuItem>

              <DSContextMenuItem
                icon={<Archive className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleToggleChatArchive(targetChat.id)}
              >
                {targetChat.isArchived ? 'Вернуть из архива' : 'В архив'}
              </DSContextMenuItem>

              <div className="my-1 border-t border-[var(--ds-border-subtle)]" />

              <DSContextMenuItem
                tone="warning"
                icon={<Flag className="w-4 h-4 text-amber-600" />}
                onClick={() => {
                  setChatMenu(null);
                  setReportModalTarget({
                    type: 'chat',
                    title: `Пожаловаться на ${targetChat.interlocutorName}`,
                  });
                }}
              >
                Пожаловаться / Заблокировать
              </DSContextMenuItem>

              <DSContextMenuItem
                tone="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDeleteChat(targetChat.id)}
              >
                Удалить переписку
              </DSContextMenuItem>
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
              className="fixed z-50 w-60 bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-md)] shadow-[var(--ds-shadow-floating)] p-1.5 text-xs space-y-0.5"
            >
              <div className="px-2.5 py-1 border-b border-[var(--ds-border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--ds-ink-subtle)]">
                <span>{isOwn ? 'Ваше сообщение' : 'Сообщение собеседника'}</span>
                <span>{targetMsg.timestamp}</span>
              </div>

              <DSContextMenuItem
                icon={<Reply className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleStartReply(targetMsg)}
              >
                Ответить
              </DSContextMenuItem>

              {/* Incoming Foreign Message: Show Original Spanish / Return to Russian Translation */}
              {!isOwn && targetMsg.isTranslated && (
                <DSContextMenuItem
                  tone="primary"
                  icon={<Languages className="w-4 h-4 text-[var(--ds-primary)]" />}
                  rightMeta="ES"
                  onClick={() => handleToggleMessageOriginal(targetMsg.id)}
                >
                  {targetMsg.showOriginal ? 'Вернуться к переводу' : 'Показать оригинал'}
                </DSContextMenuItem>
              )}

              {/* Own Message Only: Edit Message */}
              {isOwn && (
                <DSContextMenuItem
                  icon={<Pencil className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                  onClick={() => handleStartEditMessage(targetMsg)}
                >
                  Редактировать
                </DSContextMenuItem>
              )}

              <DSContextMenuItem
                icon={<Copy className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleCopyMessageText(targetMsg)}
              >
                Скопировать текст
              </DSContextMenuItem>

              <DSContextMenuItem
                icon={<Pin className="w-4 h-4 text-[var(--ds-ink-muted)]" />}
                onClick={() => handleTogglePinMessage(targetMsg.id)}
              >
                {targetMsg.isPinned ? 'Открепить сообщение' : 'Закрепить в чате'}
              </DSContextMenuItem>

              <div className="my-1 border-t border-[var(--ds-border-subtle)]" />

              {/* Differentiated Bottom Action: Delete for Own vs. Report for Incoming */}
              {isOwn ? (
                <DSContextMenuItem
                  tone="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => handleDeleteMessage(targetMsg.id)}
                >
                  Удалить сообщение
                </DSContextMenuItem>
              ) : (
                <DSContextMenuItem
                  tone="danger"
                  icon={<Flag className="w-4 h-4" />}
                  onClick={() => {
                    setMessageMenu(null);
                    setReportModalTarget({
                      type: 'message',
                      title: 'Пожаловаться на сообщение',
                    });
                  }}
                >
                  Пожаловаться
                </DSContextMenuItem>
              )}
            </div>
          );
        })()}

      {/* =====================================================================
          DESIGN SYSTEM MODALS (Предложить цену, Детали объявления, Новое объявление, Жалоба)
         ===================================================================== */}
      {priceOfferModalOpen && (
        <DSModal
          title="Предложить свою цену"
          onClose={() => setPriceOfferModalOpen(false)}
          maxWidthClass="max-w-sm"
        >
          <div className="text-xs text-[var(--ds-ink-muted)]">
            Текущая цена в объявлении:{' '}
            <strong className="text-[var(--ds-ink-primary)] font-mono">
              {formatPrice(activeChat.listing.priceRub)}
            </strong>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ds-ink-secondary)] mb-1">
              Ваше предложение ({currencySymbol}):
            </label>
            <input
              type="text"
              value={customOfferAmount}
              onChange={(e) => setCustomOfferAmount(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--ds-border-base)] rounded-[var(--ds-radius-sm)] text-sm font-mono font-bold text-[var(--ds-ink-primary)] focus:outline-none focus:border-[var(--ds-primary)]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <DSButton variant="ghost" size="sm" onClick={() => setPriceOfferModalOpen(false)}>
              Отмена
            </DSButton>
            <DSButton
              variant="primary"
              size="sm"
              onClick={() => {
                setPriceOfferModalOpen(false);
                handleSendMessage(`Предлагаю цену: ${customOfferAmount} ${currencySymbol}`, {
                  type: 'offer',
                  title: `Предложение цены: ${customOfferAmount} ${currencySymbol}`,
                  subtitle: 'Официальный оффер по сделке',
                });
              }}
            >
              Отправить предложение
            </DSButton>
          </div>
        </DSModal>
      )}

      {showListingDetailsModal && (
        <DSModal
          title={`Объявление #${activeChat.listing.id}`}
          onClose={() => setShowListingDetailsModal(false)}
          maxWidthClass="max-w-lg"
        >
          <div className="flex items-center gap-3">
            <ListingThumbnail
              category={activeChat.listing.category}
              size="lg"
              status={activeChat.listing.status}
            />
            <div>
              <div className="text-lg font-bold text-[var(--ds-ink-primary)] font-mono tabular-nums">
                {formatPrice(activeChat.listing.priceRub)}
              </div>
              <div className="text-xs text-[var(--ds-ink-muted)]">
                {activeChat.listing.priceNote}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--ds-border-subtle)]">
            <h4 className="text-sm font-bold text-[var(--ds-ink-primary)] leading-snug">
              {activeChat.listing.title}
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[var(--ds-ink-secondary)]">
              <div className="p-2.5 rounded-lg bg-[var(--ds-surface-subtle)]">
                <span className="text-[var(--ds-ink-subtle)] block text-[11px]">Расположение:</span>
                <span className="font-semibold text-[var(--ds-ink-primary)]">
                  {activeChat.listing.location}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--ds-surface-subtle)]">
                <span className="text-[var(--ds-ink-subtle)] block text-[11px]">Статистика:</span>
                <span className="font-semibold text-[var(--ds-ink-primary)] font-mono">
                  {activeChat.listing.viewsCount} просмотров · от {activeChat.listing.publishedAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DSButton
              variant="primary"
              size="sm"
              onClick={() => setShowListingDetailsModal(false)}
            >
              Закрыть
            </DSButton>
          </div>
        </DSModal>
      )}

      {reportModalTarget && (
        <DSModal title={reportModalTarget.title} onClose={() => setReportModalTarget(null)}>
          <p className="text-xs text-[var(--ds-ink-muted)]">
            Выберите причину обращения в модерацию:
          </p>
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
                className="w-full p-2.5 rounded-lg border border-[var(--ds-border-base)] hover:border-[var(--ds-primary)] hover:bg-[var(--ds-primary-soft)] text-left font-medium text-[var(--ds-ink-primary)] transition-colors cursor-pointer"
              >
                {reason}
              </button>
            ))}
          </div>
        </DSModal>
      )}

      {showNewAdModal && (
        <DSModal title="Новое объявление" onClose={() => setShowNewAdModal(false)}>
          <p className="text-xs text-[var(--ds-ink-muted)]">
            Объявление будет автоматически переведено на испанский язык для иностранных покупателей,
            а цены можно указать в рублях (₽), долларах ($) или евро (€).
          </p>
          <div className="flex justify-end gap-2">
            <DSButton variant="ghost" size="sm" onClick={() => setShowNewAdModal(false)}>
              Отмена
            </DSButton>
            <DSButton
              variant="cta"
              size="sm"
              onClick={() => {
                setShowNewAdModal(false);
                triggerToast('Черновик объявления создан в разделе «Мои объявления»');
              }}
            >
              Продолжить
            </DSButton>
          </div>
        </DSModal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-[var(--ds-shadow-floating)] text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
