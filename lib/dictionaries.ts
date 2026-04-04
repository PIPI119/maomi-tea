export type Locale = "ua" | "en";

export type Dictionary = {
  subtitle: string;
  navMenu: string;
  navOrder: string;
  navLocations: string;
  menuViewTitle: string;
  menuViewHint: string;
  orderViewTitle: string;
  orderViewHint: string;
  locationsViewTitle: string;
  locationsViewHint: string;
  add: string;
  addToOrder: string;
  builderSize: string;
  builderToppings: string;
  builderExtras: string;
  builderTotal: string;
  showBarista: string;
  orderEmpty: string;
  orderYourDrinks: string;
  baristaClose: string;
  adminLoginTitle: string;
  adminEmail: string;
  adminPassword: string;
  adminSignIn: string;
  adminSignInError: string;
  adminDashboardTitle: string;
  adminProductCol: string;
  adminInStock: string;
  adminLoading: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ua: {
    subtitle: "Bubble Tea & More",
    navMenu: "Меню",
    navOrder: "Моє замовлення",
    navLocations: "Локації",
    menuViewTitle: "Меню",
    menuViewHint: "Оберіть напій нижче.",
    orderViewTitle: "Моє замовлення",
    orderViewHint: "Тут з’явиться ваш напій.",
    locationsViewTitle: "Локації",
    locationsViewHint: "Незабаром карта та адреси.",
    add: "Додати",
    addToOrder: "Додати до замовлення",
    builderSize: "Об’єм",
    builderToppings: "Топінги",
    builderExtras: "Додатково",
    builderTotal: "Разом",
    showBarista: "ПОКАЗАТИ БАРИСТІ",
    orderEmpty: "Ще порожньо — оберіть напій у меню.",
    orderYourDrinks: "Ваші напої",
    baristaClose: "Закрити",
    adminLoginTitle: "Вхід адміністратора",
    adminEmail: "Ел. пошта",
    adminPassword: "Пароль",
    adminSignIn: "Увійти",
    adminSignInError: "Невірний email або пароль.",
    adminDashboardTitle: "Адмін — товари",
    adminProductCol: "Напій",
    adminInStock: "Є в наявності",
    adminLoading: "Завантаження…",
  },
  en: {
    subtitle: "Bubble Tea & More",
    navMenu: "Menu",
    navOrder: "My Order",
    navLocations: "Locations",
    menuViewTitle: "Menu",
    menuViewHint: "Pick a drink below.",
    orderViewTitle: "My Order",
    orderViewHint: "Your drink will show up here.",
    locationsViewTitle: "Locations",
    locationsViewHint: "Map and addresses coming soon.",
    add: "Add",
    addToOrder: "Add to Order",
    builderSize: "Size",
    builderToppings: "Toppings",
    builderExtras: "Extras",
    builderTotal: "Total",
    showBarista: "SHOW BARISTA",
    orderEmpty: "Nothing here yet — pick a drink from the menu.",
    orderYourDrinks: "Your drinks",
    baristaClose: "Close",
    adminLoginTitle: "Admin sign in",
    adminEmail: "Email",
    adminPassword: "Password",
    adminSignIn: "Sign in",
    adminSignInError: "Invalid email or password.",
    adminDashboardTitle: "Admin — products",
    adminProductCol: "Drink",
    adminInStock: "In stock",
    adminLoading: "Loading…",
  },
};
