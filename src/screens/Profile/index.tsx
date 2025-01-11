import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Container, Form, ImageContainer, ProfileImage } from './styles';

import { useUser } from 'src/storage/userStorage';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { ControlledInput } from '@components/Form/ControlledInput';

import { Button } from '@components/Button';
import { Header } from '@components/Header';

import api from '@api/api';

import DefaultAvatar from '@assets/user_default.svg';

type FormData = {
  name: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export function Profile() {
  const name = useUser((state) => state.name);
  const lastName = useUser((state) => state.lastName);
  const email = useUser((state) => state.email);
  const phone = useUser((state) => state.phone);
  const profileImage = useUser((state) => state.profileImage);
  const tenantId = useUser((state) => state.tenantId);
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('@assets/user_default.png');

  const schema = Yup.object().shape({
    email: Yup.string().email('Digite um e-mail válido'),
    confirmEmail: Yup.string()
      .required('Confirme o seu e-mail')
      .oneOf([Yup.ref('email'), null], 'Os emails não conferem'),
    phone: Yup.number().typeError('Digite apenas números'),
    password: Yup.string()
      .required('Digite a sua senha')
      .min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: Yup.string()
      .required('Confirme a sua senha')
      .oneOf([Yup.ref('password'), null], 'As senhas não conferem'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  async function handleSelectImage() {
    try {
      const imageSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!imageSelected.canceled && imageSelected.assets[0].base64) {
        setImage(imageSelected.assets[0].base64);
        setImageUrl(imageSelected.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTakePhoto() {
    try {
      const photoTacked = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!photoTacked.canceled && photoTacked.assets[0].base64) {
        setImage(photoTacked.assets[0].base64);
        setImageUrl(photoTacked.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleClickSelectImage() {
    Alert.alert('Selecionar Imagem', undefined, [
      { text: 'Tirar foto', onPress: handleTakePhoto },
      { text: 'Selecionar da biblioteca', onPress: handleSelectImage },
    ]);
  }

  // console.log('name >>>', name);
  // console.log('lastName >>>', lastName);
  // console.log('email >>>', email);
  // console.log('phone >>>', phone);
  // console.log('profileImage >>>', profileImage);
  // console.log('tenantId >>>', tenantId);
  // console.log('imageUrl >>>', imageUrl);

  async function handleSaveProfile(data: FormData) {
    try {
      let profile_image_id: number | null = null;
      if (image !== '') {
        const newImage = {
          file: `data:image/jpeg;base64,${image}`,
          tenant_id: tenantId,
        };
        const { data, status } = await api.post(
          'upload/user_profile_image',
          newImage
        );
        if (status === 200) {
          profile_image_id = data.id;
        }
      }

      const profileEdited = {
        name: data.name,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        profile_image_id,
        tenant_id: tenantId,
      };
    } catch (error) {
      console.error(error);
      // Alert.alert('Perfil', error.response?.data.message);
    }
  }

  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Perfil'} />
      </Header.Root>

      <ImageContainer onPress={handleClickSelectImage}>
        {image === '' ? (
          <DefaultAvatar />
        ) : (
          <ProfileImage source={{ uri: imageUrl }} />
        )}
      </ImageContainer>

      <Form>
        <ControlledInput
          type='primary'
          placeholder='Nome'
          autoCapitalize='words'
          autoCorrect={false}
          autoComplete='name'
          textContentType='name'
          value={name}
          label='Nome'
          name='name'
          control={control}
        />

        <ControlledInput
          type='primary'
          placeholder='Sobrenome'
          autoCapitalize='words'
          autoCorrect={false}
          autoComplete='name-family'
          textContentType='familyName'
          value={lastName}
          label='Sobrenome'
          name='lastName'
          control={control}
        />

        <ControlledInput
          type='primary'
          placeholder='E-mail'
          autoCapitalize='none'
          keyboardType='email-address'
          autoCorrect={false}
          autoComplete='email'
          textContentType='emailAddress'
          value={email}
          label='E-mail'
          name='email'
          control={control}
          error={errors.email}
        />

        <ControlledInput
          type='primary'
          placeholder='Confirme seu e-mail'
          autoCapitalize='none'
          keyboardType='email-address'
          autoCorrect={false}
          autoComplete='email'
          textContentType='emailAddress'
          label='Confirme seu e-mail'
          name='confirmEmail'
          control={control}
          error={errors.confirmEmail}
        />

        <ControlledInput
          type='primary'
          placeholder='Celular'
          keyboardType='phone-pad'
          value={String(phone)}
          label='Celular'
          name='phone'
          control={control}
          error={errors.phone}
        />

        <Button.Root ype='secondary' onPress={handleSubmit(handleSaveProfile)}>
          <Button.Text type='secondary' text='Salvar Perfil' />
        </Button.Root>
      </Form>
    </Container>
  );
}
