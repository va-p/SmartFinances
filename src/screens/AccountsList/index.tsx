import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container } from './styles';

// Dependencies
import axios from 'axios';
import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useNavigation } from 'expo-router';

// Icons
import Bank from 'phosphor-react-native/src/icons/Bank';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import CreditCard from 'phosphor-react-native/src/icons/CreditCard';
import CurrencyBtc from 'phosphor-react-native/src/icons/CurrencyBtc';

// Screens

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';

import { useUser } from '@stores/userStorage';
import { useQuotes } from '@stores/quotesStorage';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';

import api from '@api/api';

import { processAccountsForList } from '@utils/processAccountsForList';

import { ThemeProps } from '@interfaces/theme';
import { AccountProps, AccountTypes } from '@interfaces/accounts';

export function AccountsList() {
  const theme = useTheme() as ThemeProps;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [loading, setLoading] = useState(false);
  const { id: userID } = useUser();
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const accountID = useCurrentAccountSelected((state) => state.accountId);
  const setAccountId = useCurrentAccountSelected((state) => state.setAccountId);
  const setAccountName = useCurrentAccountSelected(
    (state) => state.setAccountName
  );
  const setAccountType = useCurrentAccountSelected(
    (state) => state.setAccountType
  );
  const setAccountCurrency = useCurrentAccountSelected(
    (state) => state.setAccountCurrency
  );
  const setAccountInitialAmount = useCurrentAccountSelected(
    (state) => state.setAccountInitialAmount
  );
  const navigation = useNavigation();
  const quotes = useQuotes();

  // Format balances in each account's currency (and add a BRL-converted
  // secondary line for non-BRL accounts), mirroring the Accounts screen.
  const processedAccounts = useMemo(
    () => processAccountsForList(accounts, quotes),
    [accounts, quotes]
  );

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account');
      if (data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Contas', error?.response?.data.message, [
        { text: 'Tentar novamente' },
        {
          text: 'Voltar para tela anterior',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenRegisterAccountModal() {
    setAccountId('');
    setAccountName('');
    setAccountInitialAmount(0);
    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseRegisterAccountModal() {
    editAccountBottomSheetRef.current?.dismiss();
  }

  function handleOpenAccount(
    id: string,
    name: string,
    type: AccountTypes,
    currency: any
  ) {
    setAccountId(id);
    setAccountName(name);
    setAccountType(type);
    setAccountCurrency(currency);
    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseEditAccount() {
    try {
      setLoading(true);

      setAccountId('');
      fetchAccounts();
      editAccountBottomSheetRef.current?.dismiss();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount(id: string | null) {
    try {
      const { status } = await api.delete('account/delete', {
        params: {
          account_id: id,
        },
      });
      if (status === 200) {
        Alert.alert('Exclusão de Conta', 'Conta excluída com sucesso!');
        handleCloseEditAccount();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Exclusão de Conta', error.response?.data?.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseEditAccount,
          },
        ]);
      }
    }
  }

  async function handleClickDeleteAccount() {
    Alert.alert(
      'Exclusão de conta',
      'ATENÇÃO! Todas as transações desta conta também serão excluídas. Tem certeza que deseja excluir a conta?',
      [
        { text: 'Não, cancelar a exclusão' },
        {
          text: 'Sim, excluir a conta',
          onPress: () => handleDeleteAccount(accountID),
        },
      ]
    );
  }

  function _renderItem({ item, index }: any) {
    const getAccountIcon = () => {
      switch (item.type) {
        case 'OTHER':
        case 'WALLET':
          return <Wallet color={theme.colors.primary} />;
        case 'CRYPTOCURRENCY_WALLET':
          return <CurrencyBtc color={theme.colors.primary} />;
        case 'INVESTMENTS':
        case 'BANK':
          return <Bank color={theme.colors.primary} />;
        case 'CREDIT':
          return <CreditCard color={theme.colors.primary} />;
        default:
          'WALLET';
          break;
      }
    };

    return (
      <AccountListItem
        data={item}
        index={index}
        icon={getAccountIcon()}
        onPress={() =>
          handleOpenAccount(item.id, item.name, item.type, item.currency)
        }
      />
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return (
      <Screen>
        <SkeletonCategoriesAndTagsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title={'Contas Manuais'} />
        </Header.Root>

        <FlatList
          data={processedAccounts}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={_renderItem}
          ListEmptyComponent={() => (
            <ListEmptyComponent text='Nenhuma conta criada. Crie contas para visualizá-la aqui.' />
          )}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
          }
          ListFooterComponent={
            <Button.Root
              type='secondary'
              onPress={handleOpenRegisterAccountModal}
              style={{ marginTop: 16 }}
            >
              <Button.Text text='Criar Nova Conta' />
            </Button.Root>
          }
          ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 8,
            paddingBottom: bottomTabBarHeight + 16,
          }}
          showsVerticalScrollIndicator={false}
        />

        <ModalView
          type={accountID !== '' ? 'secondary' : 'primary'}
          title={accountID !== '' ? 'Editar Conta' : 'Criar Nova Conta'}
          bottomSheetRef={editAccountBottomSheetRef}
          snapPoints={['50%', '75%']}
          closeModal={handleCloseRegisterAccountModal}
          deleteChildren={handleClickDeleteAccount}
        >
          <RegisterAccount
            id={accountID}
            closeAccount={handleCloseEditAccount}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
