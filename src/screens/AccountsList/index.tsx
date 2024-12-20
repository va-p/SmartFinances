import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import axios from 'axios';
import * as Icon from 'phosphor-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { ModalView } from '@components/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';

import {
  AccountType,
  useCurrentAccountSelected,
} from '@storage/currentAccountSelectedStorage';
import { useUser } from 'src/storage/userStorage';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

import theme from '@themes/theme';

export function AccountsList() {
  const [loading, setLoading] = useState(false);
  const tenantId = useUser((state) => state.tenantId);
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
  const setAccountTotalAmount = useCurrentAccountSelected(
    (state) => state.setAccountTotalAmount
  );
  const navigation = useNavigation();

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('all_accounts', {
        params: {
          tenant_id: tenantId,
        },
      });
      if (data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Contas', error.response?.data.message, [
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
    type: AccountType,
    currency: any,
    initialAmount: number,
    total: any
  ) {
    setAccountId(id);
    setAccountName(name);
    setAccountType(type);
    setAccountCurrency(currency);
    setAccountInitialAmount(initialAmount);
    setAccountTotalAmount(total);

    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseEditAccount() {
    setAccountId('');
    fetchAccounts();
    editAccountBottomSheetRef.current?.dismiss();
  }

  async function handleDeleteAccount(id: string | null) {
    try {
      const { status } = await api.delete('delete_account', {
        params: {
          account_id: id,
        },
      });
      if (status === 200) {
        Alert.alert('Exclusão de conta', 'Conta excluída com sucesso!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de Conta', error.response?.data.message, [
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

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return <SkeletonCategoriesAndTagsScreen />;
  }

  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Contas'} />
      </Header.Root>

      <FlatList
        data={accounts}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item, index }: any) => (
          <AccountListItem
            data={item}
            index={index}
            icon={<Icon.Wallet color={theme.colors.primary} />}
            onPress={() =>
              handleOpenAccount(
                item.id,
                item.name,
                item.type,
                item.currency,
                item.initial_amount,
                item.totalAccountAmount
              )
            }
          />
        )}
        ListEmptyComponent={() => (
          <ListEmptyComponent text='Nenhuma conta criada. Crie contas para visualizá-la aqui.' />
        )}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Footer>
        <Button
          type='secondary'
          title='Criar Nova Conta'
          onPress={handleOpenRegisterAccountModal}
        />
      </Footer>

      <ModalView
        type={accountID !== '' ? 'secondary' : 'primary'}
        title={accountID !== '' ? 'Editar Conta' : 'Criar Nova Conta'}
        bottomSheetRef={editAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseRegisterAccountModal}
        deleteChildren={handleClickDeleteAccount}
      >
        <RegisterAccount id={accountID} closeAccount={handleCloseEditAccount} />
      </ModalView>
    </Container>
  );
}
