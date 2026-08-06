import { lazy } from "react";

export const LazyJournalScreen = lazy(() =>
  import("../features/journal/JournalScreen").then((module) => ({
    default: module.JournalScreen,
  })),
);

export const LazyPetScreen = lazy(() =>
  import("../features/pet/PetScreen").then((module) => ({
    default: module.PetScreen,
  })),
);

export const LazySettingsPanel = lazy(() =>
  import("../components/settings/SettingsPanel").then((module) => ({
    default: module.SettingsPanel,
  })),
);

export const LazyShopScreen = lazy(() =>
  import("../features/shop/ShopScreen").then((module) => ({
    default: module.ShopScreen,
  })),
);
