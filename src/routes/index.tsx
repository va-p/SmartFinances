import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@clerk/clerk-expo';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Load } from '@components/Load';

import { AuthRoutes } from './auth.stack.routes';
import { AppTabRoutes } from './app.tab.routes';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

import {
  DATABASE_CONFIGS,
  DATABASE_TOKENS,
  DATABASE_USERS,
  storageConfig,
  storageToken,
  storageUser,
} from '@database/database';
import { useUser } from '@storage/userStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';

import api from '@api/api';

const { Navigator, Screen } = createStackNavigator();

export function Routes() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  console.log('isSignedIn ???', isSignedIn);
  console.log('userId ==>', userId);
  console.log('isLoaded ???', isLoaded);

  useEffect(() => {
    async function fetchUserData() {
      if (isSignedIn && isLoaded && !userData) {
        try {
          setLoading(true);
          const { status, data } = await api.get('/auth/clerk_oauth_login', {
            params: {
              clerk_user_id: userId,
            },
          });

          if (status === 200) {
            // User token
            storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(data[0]));

            // User Data
            const loggedInUserDataFormatted = {
              id: data[1].id,
              name: data[1].name,
              lastName: data[1].last_name,
              email: data[1].email,
              phone: data[1].phone,
              role: data[1].role,
              image: data[1].image,
              tenantId: data[1].tenant_id,
            };
            storageUser.set(
              `${DATABASE_USERS}`,
              JSON.stringify(loggedInUserDataFormatted)
            );
            useUser.setState(() => ({
              id: loggedInUserDataFormatted.id,
              name: loggedInUserDataFormatted.name,
              lastName: loggedInUserDataFormatted.lastName,
              email: loggedInUserDataFormatted.email,
              phone: loggedInUserDataFormatted.phone,
              role: loggedInUserDataFormatted.role,
              profileImage: loggedInUserDataFormatted.image,
              tenantId: loggedInUserDataFormatted.tenantId,
            }));

            // User Configs
            storageConfig.set(
              `${DATABASE_CONFIGS}.useLocalAuth`,
              data[1].use_local_authentication
            );
            storageConfig.set(
              `${DATABASE_CONFIGS}.hideAmount`,
              data[1].hide_amount
            );
            storageConfig.set(`${DATABASE_CONFIGS}.insights`, data[1].insights);
            useUserConfigs.setState(() => ({
              useLocalAuth: data.use_local_authentication,
              hideAmount: data.hide_amount,
              insights: data.insights,
            }));

            setUserData(loggedInUserDataFormatted);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          Alert.alert('Login', error.response?.data?.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchUserData();
  }, [isSignedIn, isLoaded, userId, userData]);

  if (loading) {
    return <Load />;
  }

  if (isSignedIn && userData) {
    return (
      <NavigationContainer>
        <BottomSheetModalProvider>
          <Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: false,
            }}
          >
            <Screen name='Main' component={AppTabRoutes} />
            <Screen
              name='Transações Por Categoria'
              component={TransactionsByCategory}
            />
          </Navigator>
        </BottomSheetModalProvider>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <BottomSheetModalProvider>
        <Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: false,
          }}
        >
          <Screen name='Auth' component={AuthRoutes} />
        </Navigator>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}
