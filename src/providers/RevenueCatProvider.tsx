import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform, View, Text, Alert } from 'react-native';

import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';

import { Gradient } from '@components/Gradient';

import { useUser } from '@storage/userStorage';
import { Load } from '@components/Button/components/Load';

const API_KEYS = {
  apple: '',
  google: 'goog_yACJEerdROBKywaVVejvqfPBHDY',
};

interface UserProps {
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
  const { id: userID } = useUser();
  const [user, setUser] = useState<UserProps>({
    items: [],
    premium: false,
  });
  const [isReady, setIsReady] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  async function loadOfferings() {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
        // console.log('Loaded offers =>', offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('RevenueCatProvider loadOfferings error =>', error);
      Alert.alert(
        'Erro',
        'Não foi possível buscar as ofertas. Por favor, tente novamente mais tarde.'
      );
    }
  }

  useEffect(() => {
    async function init() {
      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEYS.google, appUserID: userID });
      }
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userID });
      }

      setIsReady(true);
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInfo(info);
      });

      await loadOfferings();

      const customer = await Purchases.restorePurchases();
      const activeSubscription = customer.activeSubscriptions;

      const newUser: UserProps = { items: [], premium: false };
      if (activeSubscription.length > 0) {
        newUser.items.push(...activeSubscription);
        newUser.premium = true;
      }

      setUser(newUser);
    }

    init();
  }, []);

  async function updateCustomerInfo(customerInfo: CustomerInfo) {
    const newUser: UserProps = { items: [], premium: false };
    // console.log('User info =>', customerInfo?.entitlements.active);

    if (customerInfo?.entitlements.active.pro !== undefined) {
      newUser.items.push(customerInfo?.entitlements.active.pro.identifier);
      newUser.premium = true;
    }

    setUser(newUser);
  }

  async function purchasePackage(pack: PurchasesPackage) {
    try {
      await Purchases.purchasePackage(pack);
      // console.log('Package to purchase =>', pack);

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
    // console.log('Restore purchases =>', customer);
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Gradient />
        <Load type='secondary' />
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
