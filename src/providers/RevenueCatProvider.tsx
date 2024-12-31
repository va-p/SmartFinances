import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform, View, Text } from 'react-native';

import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';

const API_KEYS = {
  apple: 'SUA_CHAVE',
  google: 'SUA_CHAVE',
};

export interface UserProps {
  items: string[];
  premium: boolean;
}

interface RevenueCatProps {
  user: UserProps;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePurchasesUser: () => Promise<CustomerInfo>;
  packages: PurchasesPackage[];
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

export const RevenueCatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProps>({
    items: [],
    premium: false,
  });
  const [isReady, setIsReady] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    async function init() {
      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEYS.google });
      }
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: API_KEYS.apple });
      }

      setIsReady(true);
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInfo(info);
      });

      await loadOfferings();

      const customer = await Purchases.restorePurchases();
      const activeSubscription = customer.activeSubscriptions;
      //console.log("ACTIVE SUBSCRIPTION: ", activeSubscription)

      const newUser: UserProps = { items: [], premium: false };
      if (activeSubscription.length > 0) {
        newUser.items.push(...activeSubscription);
        newUser.premium = true;
      }

      setUser(newUser);
    }

    init();
  }, []);

  async function loadOfferings() {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
        //console.log("OFERTAS CARREGADAS: ", offerings.current.availablePackages)
      }
    } catch (err) {
      console.log('ERRO CARREGAR OFERTAS: ', err);
    }
  }

  async function updateCustomerInfo(customerInfo: CustomerInfo) {
    const newUser: UserProps = { items: [], premium: false };
    //console.log('INFOR DO USER: ', customerInfo?.entitlements.active)

    if (customerInfo?.entitlements.active.pro !== undefined) {
      newUser.items.push(customerInfo?.entitlements.active.pro.identifier);
      newUser.premium = true;
    }

    setUser(newUser);
  }

  async function purchasePackage(pack: PurchasesPackage) {
    try {
      await Purchases.purchasePackage(pack);
      console.log('PACKAGE PARA COMPRA: ', pack);

      if (pack.product.identifier === 'pro') {
        setUser({ ...user });
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        alert(err);
      }
    }
  }

  async function restorePurchasesUser() {
    const customer = await Purchases.restorePurchases();
    console.log('RESTORE PURCHASES: ', customer);
    return customer;
  }

  const value = {
    user,
    packages,
    purchasePackage,
    restorePurchasesUser,
  };

  if (!isReady) {
    return (
      <View>
        <Text>Carregando....</Text>
      </View>
    );
  }

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  return useContext(RevenueCatContext) as RevenueCatProps;
};
