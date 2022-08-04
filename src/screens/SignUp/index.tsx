import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Form
} from './styles';

import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { ControlledInput } from '@components/Form/ControlledInput';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';

import {
  selectUserTenantId
} from '@slices/userSlice';

import api from '@api/api';

type FormData = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup
    .string()
    .required("Digite o seu nome"),
  lastName: Yup
    .string()
    .required("Digite o seu sobrenome"),
  email: Yup
    .string()
    .required("Digite o seu e-mail")
    .email("Digite um e-mail válido"),
  phone: Yup
    .number()
    .required("Digite o seu telefone celular")
    .typeError('Digite apenas números'),
  password: Yup
    .string()
    .required("Digite a sua senha")
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
  confirmPassword: Yup
    .string()
    .required('Confirme a sua senha')
    .oneOf([Yup.ref('password'), null], 'As senhas não conferem'),
});
/* Validation Form - End */

export function SignUp({ navigation }: any) {
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });



  async function handleRegisterUser(form: FormData) {
    setButtonIsLoading(true)

    try {
      const newTenant = {
        corporate_name: form.lastName,
        trade_name: form.name,
        ein: 0,
        email: form.email,
        phone: form.phone,
        conctact_1: form.name
      }

      const tenantRegister = await api.post('tenant', newTenant);

      if (tenantRegister.status === 200) {
        var responseTenantRegister = await api.get('single_tenant', {
          params: {
            email: form.email
          }
        })
      };
      console.log(responseTenantRegister.data.id);

      const newUser = {
        name: form.name,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        tenant_id: responseTenantRegister.data.id
      }

      const { status } = await api.post('auth/signup', newUser);

      if (status === 200) {
        Alert.alert("Cadastro de usuário", "Bem vindo à Smart Finances! Você será redirecionado para a tela de login.", [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]);
      }

      setButtonIsLoading(false)
    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possível cadastrar! Verifique os campos e tente novamente.");

      setButtonIsLoading(false)
    }
  }

  return (
    <Container>
      <Header title='Criar nova conta' />

      <Form>
        <ControlledInput
          placeholder='Nome'
          autoCapitalize='words'
          autoCorrect={false}
          type='primary'
          name='name'
          control={control}
          error={errors.name}
        />

        <ControlledInput
          placeholder='Sobrenome'
          autoCapitalize='words'
          autoCorrect={false}
          type='primary'
          name='lastName'
          control={control}
          error={errors.lastName}
        />

        <ControlledInput
          placeholder='E-mail'
          autoCapitalize='none'
          keyboardType='email-address'
          autoCorrect={false}
          type='primary'
          name='email'
          control={control}
          error={errors.email}
        />

        <ControlledInput
          placeholder='Telefone'
          keyboardType='phone-pad'
          type='primary'
          name='phone'
          control={control}
          error={errors.phone}
        />

        <ControlledInput
          placeholder='Senha'
          autoCorrect={false}
          secureTextEntry={true}
          type='primary'
          name='password'
          control={control}
          error={errors.password}
        />

        <ControlledInput
          placeholder='Confirme sua senha'
          autoCorrect={false}
          secureTextEntry={true}
          type='primary'
          name='confirmPassword'
          control={control}
          error={errors.confirmPassword}
        />

        <Button
          type='secondary'
          isLoading={buttonIsLoading}
          title='Cadastrar'
          onPress={handleSubmit(handleRegisterUser)}
        />
      </Form>
    </Container>
  );
}