import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { Container, Footer } from './styles';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import * as Icon from 'phosphor-react-native';
import axios from 'axios';

import { SkeletonCategoriesAndTagsScreen } from '@components/SkeletonCategoriesAndTagsScreen';
import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalView } from '@components/ModalView';
import { Header } from '@components/Header';
import { Button } from '@components/Button';

import { RegisterAccount } from '@screens/RegisterAccount';

import {
  setAccountName,
  setAccountCurrency,
  setAccountTotalAmount,
  setAccountInitialAmount,
  setAccountId,
  selectAccountId,
} from '@slices/accountSlice';
import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';

export function AccountsList() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const accountId = useSelector(selectAccountId);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account', {
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
    dispatch(setAccountId(''));
    dispatch(setAccountName(''));
    dispatch(setAccountInitialAmount(''));
    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseRegisterAccountModal() {
    editAccountBottomSheetRef.current?.dismiss();
  }

  function handleOpenAccount(
    id: string,
    name: string,
    currency: any,
    initialAmount: number,
    total: any
  ) {
    dispatch(setAccountId(id));
    dispatch(setAccountName(name));
    dispatch(setAccountCurrency(currency));
    dispatch(setAccountInitialAmount(initialAmount));
    dispatch(setAccountTotalAmount(total));

    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseEditAccount() {
    dispatch(setAccountId(''));
    fetchAccounts();
    editAccountBottomSheetRef.current?.dismiss();
  }

  async function handleDeleteAccount(id: string) {
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
          onPress: () => handleDeleteAccount(accountId),
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
      <Header type='primary' title='Contas' />

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <AccountListItem
            data={item}
            icon={<Icon.Wallet color={theme.colors.primary} />}
            onPress={() =>
              handleOpenAccount(
                item.id,
                item.name,
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
        contentContainerStyle={{
          paddingTop: 24,
        }}
      />

      <Footer>
        <Button
          type='secondary'
          title='Criar Nova Conta'
          onPress={handleOpenRegisterAccountModal}
        />
      </Footer>

      <ModalView
        type={accountId != '' ? 'secondary' : 'primary'}
        title={accountId != '' ? 'Editar Conta' : 'Criar Nova Conta'}
        bottomSheetRef={editAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseRegisterAccountModal}
        deleteChildren={handleClickDeleteAccount}
      >
        <RegisterAccount id={accountId} closeAccount={handleCloseEditAccount} />
      </ModalView>
    </Container>
  );
}
