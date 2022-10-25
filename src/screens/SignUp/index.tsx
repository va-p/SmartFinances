import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Form,
  Footer,
  TermsAndPolicyContainer,
  CheckboxGroup,
  TermsAndPolicy,
  Link
} from './styles';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { ControlledCheckbox } from '@components/Form/ControlledCheckbox';
import { ControlledInput } from '@components/Form/ControlledInput';
import { Button } from '@components/Button';
import { Header } from '@components/Header';

import api from '@api/api';

import theme from '@themes/theme';

type FormData = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  checkbox: boolean;
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
    .typeError("Digite apenas números"),
  password: Yup
    .string()
    .required("Digite a sua senha")
    .min(8, "A senha deve ter no mínimo 8 caracteres"),
  confirmPassword: Yup
    .string()
    .required("Confirme a sua senha")
    .oneOf([Yup.ref('password'), null], "As senhas não conferem"),
  checkbox: Yup
    .bool()
    .oneOf([true], "Aceite os Termos de Uso e a Política de Privacidade")
});

/* Validation Form - End */

export function SignUp({ navigation }: any) {
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);
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
        subscription_id: 1,
        contact_1: form.name
      }

      const tenantRegister = await api.post('tenant', newTenant);

      if (tenantRegister.status === 200) {
        var responseTenantRegister = await api.get('single_tenant', {
          params: {
            email: form.email
          }
        })
      };

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
  };

  return (
    <Container>
      <Header type='primary' title='Criar nova conta' />

      <Form>
        <ControlledInput
          type='primary'
          placeholder='Nome'
          autoCapitalize='words'
          autoCorrect={false}
          autoComplete='name'
          textContentType='name'
          name='name'
          control={control}
          error={errors.name}
        />

        <ControlledInput
          type='primary'
          placeholder='Sobrenome'
          autoCapitalize='words'
          autoCorrect={false}
          autoComplete='name-family'
          textContentType='familyName'
          name='lastName'
          control={control}
          error={errors.lastName}
        />

        <ControlledInput
          type='primary'
          placeholder='E-mail'
          autoCapitalize='none'
          keyboardType='email-address'
          autoCorrect={false}
          autoComplete='email'
          textContentType='emailAddress'
          name='email'
          control={control}
          error={errors.email}
        />

        <ControlledInput
          type='primary'
          placeholder='Celular'
          keyboardType='phone-pad'
          name='phone'
          control={control}
          error={errors.phone}
        />

        <ControlledInput
          type='primary'
          placeholder='Senha'
          autoCorrect={false}
          secureTextEntry={true}
          autoComplete='password-new'
          textContentType='newPassword'
          name='password'
          control={control}
          error={errors.password}
        />

        <ControlledInput
          type='primary'
          placeholder='Confirme sua senha'
          autoCorrect={false}
          secureTextEntry={true}
          autoComplete='password-new'
          textContentType='newPassword'
          name='confirmPassword'
          control={control}
          error={errors.confirmPassword}
        />

        <TermsAndPolicyContainer>
          <TermsAndPolicy>Ao me cadastrar, eu declaro que li e concordo com os <Link onPress={() => navigation.navigate('Termos de Uso')}>Termos de Uso</Link> e <Link onPress={() => navigation.navigate('Política de Privacidade')}>Política de Privacidade</Link>.</TermsAndPolicy>
        </TermsAndPolicyContainer>
      </Form>

      <Footer>
        <Button
          type='secondary'
          isLoading={buttonIsLoading}
          title='Cadastrar'
          onPress={handleSubmit(handleRegisterUser)}
        />
      </Footer>
    </Container>
  );
}