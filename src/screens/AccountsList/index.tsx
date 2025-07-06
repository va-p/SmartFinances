import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container } from './styles';

import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Bank from 'phosphor-react-native/src/icons/Bank';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import CreditCard from 'phosphor-react-native/src/icons/CreditCard';
import CurrencyBtc from 'phosphor-react-native/src/icons/CurrencyBtc';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';

import {
  // AccountType,
  useCurrentAccountSelected,
} from '@storage/currentAccountSelectedStorage';
import { useUser } from '@storage/userStorage';

import api from '@api/api';

import { AccountProps, AccountTypes } from '@interfaces/accounts';

import theme from '@themes/theme';

export function AccountsList() {
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

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account/manual_accounts', {
        params: {
          user_id: userID,
        },
      });
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
        case 'CRYPTOCURRENCY WALLET':
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
          data={accounts}
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
