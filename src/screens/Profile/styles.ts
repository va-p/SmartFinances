import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  width: 100%;
  padding: 16px;
`;

export const ImageContainer = styled.Pressable`
  width: 200px;
  height: 200px;
  align-self: center;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 100px;
`;

export const ProfileImage = styled.Image.attrs({
  resizeMode: 'cover',
  borderRadius: 100,
})`
  width: 100%;
  height: 100%;
`;

export const Form = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})``;
