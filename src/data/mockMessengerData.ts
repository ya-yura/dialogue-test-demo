export type DealRole = 'buying' | 'selling';
export type ListingStatus = 'active' | 'reserved' | 'archived';

export interface MessageItem {
  id: string;
  sender: 'me' | 'them';
  timestamp: string;
  dateGroup: string;
  text: string;
  originalText?: string;
  originalLang?: string;
  isTranslated?: boolean;
  showOriginal?: boolean;
  readStatus?: 'sent' | 'delivered' | 'read';
  isUnread?: boolean;
  isEdited?: boolean;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  attachment?: {
    type: 'image' | 'document' | 'location' | 'offer';
    title: string;
    subtitle?: string;
    previewType?: 'warehouse' | 'contract' | 'map' | 'price_offer';
    offerValue?: string;
  };
}

export interface ChatThread {
  id: string;
  interlocutorName: string;
  interlocutorSubtitle: string;
  interlocutorCode: string;
  interlocutorRoleLabel: string;
  interlocutorRating: string;
  interlocutorReviewsCount: number;
  interlocutorOnline: boolean;
  interlocutorLastSeen: string;
  interlocutorLang: string;
  autoTranslateEnabled: boolean;
  role: DealRole;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  unreadCount: number;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  listing: {
    id: string;
    title: string;
    priceNumeric: number;
    priceNote?: string;
    location: string;
    status: ListingStatus;
    category: 'warehouse' | 'villa' | 'car' | 'scooter' | 'commercial' | 'condo';
    viewsCount: number;
    publishedAt: string;
  };
  messages: MessageItem[];
}

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'c1',
    interlocutorName: 'Собеседник 1',
    interlocutorSubtitle: 'Карлос Мендоса',
    interlocutorCode: 'С1',
    interlocutorRoleLabel: 'Продавец',
    interlocutorRating: '4.9',
    interlocutorReviewsCount: 34,
    interlocutorOnline: true,
    interlocutorLastSeen: 'В сети',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'buying',
    isPinned: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    lastUpdatedDate: '20.10.2026',
    lastUpdatedTime: '19:09',
    listing: {
      id: 'L-84920',
      title: 'Складское помещение 600 м² - удобный подъезд для большегрузных фур, пандус и круглосуточная охрана',
      priceNumeric: 85000,
      priceNote: 'в месяц · без комиссии',
      location: 'Индустриальный парк Юг, сектор B',
      status: 'active',
      category: 'warehouse',
      viewsCount: 412,
      publishedAt: '14.10.2026',
    },
    messages: [
      {
        id: 'm1',
        sender: 'them',
        timestamp: '19:08',
        dateGroup: '20 октября 2026 г.',
        text: 'Привет! Складское помещение 600 м² полностью свободно и готово к заезду. Высота потолков 9 метров, промышленный бетонный пол с нагрузкой до 4 тонн на м², есть гидравлическая рампа для разгрузки еврофур и собственная парковка.',
        originalText: '¡Hola! La nave industrial de 600 m² está totalmente disponible y lista para entrar. Altura de techo de 9 metros, suelo industrial con carga de hasta 4 toneladas/m², rampa hidráulica para camiones y parking propio.',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
      {
        id: 'm2',
        sender: 'me',
        timestamp: '19:09',
        dateGroup: '20 октября 2026 г.',
        text: '1',
        readStatus: 'read',
      },
      {
        id: 'm3',
        sender: 'me',
        timestamp: '19:09',
        dateGroup: '20 октября 2026 г.',
        text: '321',
        readStatus: 'read',
      },
      {
        id: 'm4',
        sender: 'them',
        timestamp: '19:09',
        dateGroup: '20 октября 2026 г.',
        text: 'За 4 тысячи отдашь?',
        originalText: '¿Me lo dejas por 4 mil si cerramos el trato hoy mismo?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
      {
        id: 'm5',
        sender: 'me',
        timestamp: '19:09',
        dateGroup: '20 октября 2026 г.',
        text: 'да',
        readStatus: 'read',
      },
      {
        id: 'm6',
        sender: 'them',
        timestamp: '19:09',
        dateGroup: '20 октября 2026 г.',
        text: 'Кидай на крипту)',
        originalText: '¡Perfecto, pásalo en cripto (USDT) y te reservo el almacén! :)',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
        isPinned: true,
        attachment: {
          type: 'image',
          title: 'Фотографии разгрузочной рампы и план склада 600м2.jpg',
          subtitle: '2.4 МБ · Прикреплено продавцом',
          previewType: 'warehouse',
        },
      },
    ],
  },
  {
    id: 'c2',
    interlocutorName: 'Собеседник 2',
    interlocutorSubtitle: 'Алехандро Ривера',
    interlocutorCode: 'С2',
    interlocutorRoleLabel: 'Покупатель',
    interlocutorRating: '5.0',
    interlocutorReviewsCount: 19,
    interlocutorOnline: true,
    interlocutorLastSeen: 'В сети',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'selling',
    isPinned: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 2,
    lastUpdatedDate: '28.10.2026',
    lastUpdatedTime: '18:42',
    listing: {
      id: 'L-99104',
      title: 'Извините, но я не работаю с посредниками: Вилла с 4 спальнями, подогреваемым бассейном и панорамной террасой в закрытом комплексе',
      priceNumeric: 165000,
      priceNote: 'в месяц · от 6 мес.',
      location: 'Коста-Бланка, сектор Лагуна',
      status: 'active',
      category: 'villa',
      viewsCount: 890,
      publishedAt: '10.10.2026',
    },
    messages: [
      {
        id: 'c2-m1',
        sender: 'them',
        timestamp: '16:15',
        dateGroup: '28 октября 2026 г.',
        text: 'Добрый день! Мы ищем просторный дом для семьи из 4 человек на долгосрочный период. Подскажите, входят ли уход за садом, чистка бассейна и высокоскоростной интернет в указанную стоимость?',
        originalText: '¡Buenas tardes! Buscamos una casa amplia para una familia de 4 personas a largo plazo. ¿Podría indicarme si el mantenimiento del jardín, la limpieza de la piscina y el internet de fibra están incluidos en el precio?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
      {
        id: 'c2-m2',
        sender: 'me',
        timestamp: '16:28',
        dateGroup: '28 октября 2026 г.',
        text: 'Здравствуйте! Да, обслуживание бассейна 2 раза в неделю, садовник и оптоволокно 1 Гбит/с полностью включены в арендную плату.',
        readStatus: 'read',
      },
      {
        id: 'c2-m3',
        sender: 'them',
        timestamp: '18:40',
        dateGroup: '28 октября 2026 г.',
        text: 'Отличные условия! У нас есть ещё пара вопросов перед подписанием договора: 1) Оборудован ли кабинет на втором этаже рабочим столом и монитором для удалённой работы? 2) Допускается ли проживание с воспитанной собакой породы корги (5 лет, все европейские ветеринарные сертификаты в наличии, готовы внести дополнительный возвратный депозит в договоре)?',
        originalText: '¡Excelentes condiciones! Tenemos un par de preguntas más antes de firmar el contrato: 1) ¿El estudio de la segunda planta cuenta con escritorio para teletrabajo? 2) ¿Se permite vivir con un perro Corgi muy tranquilo de 5 años (todos los certificados veterinarios al día, dispuestos a dejar fianza adicional)?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
        isUnread: true,
      },
      {
        id: 'c2-m4',
        sender: 'them',
        timestamp: '18:42',
        dateGroup: '28 октября 2026 г.',
        text: 'Когда можно посмотреть объект?',
        originalText: '¿Cuándo se puede ver la propiedad en persona?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
        isUnread: true,
      },
    ],
  },
  {
    id: 'c3-1',
    interlocutorName: 'Собеседник 3',
    interlocutorSubtitle: 'Диего Санчес',
    interlocutorCode: 'С3',
    interlocutorRoleLabel: 'Покупатель',
    interlocutorRating: '4.8',
    interlocutorReviewsCount: 42,
    interlocutorOnline: false,
    interlocutorLastSeen: 'Был в сети 15 мин. назад',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'selling',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 1,
    lastUpdatedDate: '28.10.2026',
    lastUpdatedTime: '15:30',
    listing: {
      id: 'L-77100',
      title: 'Извините, но я не рассматриваю рассрочку: Офисный блок 210 м² с переговорной комнатой и панорамным остеклением',
      priceNumeric: 110000,
      priceNote: 'в месяц · НДС включен',
      location: 'Деловой центр Пуэрта, 8 этаж',
      status: 'active',
      category: 'commercial',
      viewsCount: 340,
      publishedAt: '19.10.2026',
    },
    messages: [
      {
        id: 'c31-m1',
        sender: 'them',
        timestamp: '15:30',
        dateGroup: '28 октября 2026 г.',
        text: 'Тест — здравствуйте, актуально ли ещё ваше предложение по аренде офисного блока на 8 этаже?',
        originalText: 'Prueba — ¡hola! ¿Sigue disponible su oferta de alquiler para la oficina de la octava planta?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
        isUnread: true,
      },
    ],
  },
  {
    id: 'c3-2',
    interlocutorName: 'Собеседник 3',
    interlocutorSubtitle: 'Диего Санчес',
    interlocutorCode: 'С3',
    interlocutorRoleLabel: 'Продавец авто',
    interlocutorRating: '4.8',
    interlocutorReviewsCount: 42,
    interlocutorOnline: false,
    interlocutorLastSeen: 'Был в сети 15 мин. назад',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'buying',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    lastUpdatedDate: '28.10.2026',
    lastUpdatedTime: '14:20',
    listing: {
      id: 'L-77202',
      title: 'Автомобиль · объявление 2 — Внедорожник Toyota Hilux Revo 2.8 AT 4WD 2024, без ДТП, полная сервисная история',
      priceNumeric: 890000,
      priceNote: 'Возможен торг при осмотре',
      location: 'Автопарк Норте, павильон 4',
      status: 'active',
      category: 'car',
      viewsCount: 530,
      publishedAt: '18.10.2026',
    },
    messages: [
      {
        id: 'c32-m1',
        sender: 'them',
        timestamp: '14:15',
        dateGroup: '28 октября 2026 г.',
        text: 'Автомобиль полностью в родной краске, прошёл полное ТО у официального дилера на прошлой неделе.',
        originalText: 'El coche tiene la pintura original de fábrica al 100%, pasó la revisión completa en el concesionario oficial la semana pasada.',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
      {
        id: 'c32-m2',
        sender: 'me',
        timestamp: '14:20',
        dateGroup: '28 октября 2026 г.',
        text: 'Тест 2',
        readStatus: 'read',
      },
    ],
  },
  {
    id: 'c4',
    interlocutorName: 'Собеседник 4',
    interlocutorSubtitle: 'Лусия Гомес',
    interlocutorCode: 'С4',
    interlocutorRoleLabel: 'Покупатель',
    interlocutorRating: '5.0',
    interlocutorReviewsCount: 11,
    interlocutorOnline: true,
    interlocutorLastSeen: 'В сети',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'selling',
    isPinned: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 1,
    lastUpdatedDate: '20.10.2026',
    lastUpdatedTime: '17:50',
    listing: {
      id: 'L-65012',
      title: 'Тестовое с картой — Коммерческое помещение под кофейню или пекарню 145 м², угловой фасад, первая линия',
      priceNumeric: 120000,
      priceNote: 'в месяц · каникулы на ремонт',
      location: 'Центральный бульвар, д. 39',
      status: 'active',
      category: 'commercial',
      viewsCount: 615,
      publishedAt: '12.10.2026',
    },
    messages: [
      {
        id: 'c4-m1',
        sender: 'them',
        timestamp: '17:48',
        dateGroup: '20 октября 2026 г.',
        text: 'Добрый вечер! Подскажите, какая выделенная электрическая мощность у помещения (кВт) и есть ли отдельная вытяжная шахта для пекарни?',
        originalText: '¡Buenas noches! ¿Podría decirme qué potencia eléctrica contratada tiene el local (kW) y si dispone de salida de humos independiente para panadería?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
      {
        id: 'c4-m2',
        sender: 'them',
        timestamp: '17:50',
        dateGroup: '20 октября 2026 г.',
        text: 'Можно уточнить условия?',
        originalText: '¿Se pueden aclarar las condiciones de la fianza y el periodo de carencia?',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
        isUnread: true,
      },
    ],
  },
  {
    id: 'c3-3',
    interlocutorName: 'Собеседник 3',
    interlocutorSubtitle: 'Диего Санчес',
    interlocutorCode: 'С3',
    interlocutorRoleLabel: 'Продавец авто',
    interlocutorRating: '4.8',
    interlocutorReviewsCount: 42,
    interlocutorOnline: false,
    interlocutorLastSeen: 'Был в сети 15 мин. назад',
    interlocutorLang: 'Испанский (ES)',
    autoTranslateEnabled: true,
    role: 'buying',
    isPinned: false,
    isMuted: true,
    isArchived: false,
    unreadCount: 0,
    lastUpdatedDate: '19.10.2026',
    lastUpdatedTime: '11:30',
    listing: {
      id: 'L-51088',
      title: 'Автомобиль · объявление 3 — Кроссовер Mazda CX-30 2.0 SkyActiv-G 2023, проекция на стекло, камеры 360°',
      priceNumeric: 645000,
      priceNote: 'Фиксированная цена',
      location: 'Автопарк Норте, павильон 4',
      status: 'reserved',
      category: 'car',
      viewsCount: 310,
      publishedAt: '05.10.2026',
    },
    messages: [
      {
        id: 'c33-m1',
        sender: 'them',
        timestamp: '11:30',
        dateGroup: '19 октября 2026 г.',
        text: 'По этому автомобилю уже внесён предварительный задаток до пятницы, но если сделка не состоится — я сразу напишу вам.',
        originalText: 'Por este coche ya han dejado una señal de reserva hasta el viernes, pero si no se concreta la venta te aviso de inmediato.',
        originalLang: 'Испанский (ES)',
        isTranslated: true,
        showOriginal: false,
      },
    ],
  },
];
