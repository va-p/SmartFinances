import React from 'react';
import {
  Container,
  ContentScroll,
  LastUpdatedDate,
  Title,
  SubTitle,
  Text,
} from './styles';

import { Header } from '@components/Header';

export function PrivacyPolicy() {
  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Política de Privacidade'} />
      </Header.Root>

      <ContentScroll>
        <LastUpdatedDate>Última atualização: 22/10/2022</LastUpdatedDate>
        <Title>Política de Privacidade</Title>
        <Text>
          {'\n'}
          Esta Política de Privacidade (“
          <Text style={{ fontWeight: 'bold' }}>Política de Privacidade</Text>”)
          contém as condições gerais aplicáveis ao tratamento dos Dados Pessoais
          realizado pela{' '}
          <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            Digital Tech
          </Text>
          , inscrita no CNPJ sob o nº 20.543.901/0001-37, com sede na Av Santa
          Luzia, 761, Casa 2, CEP 36030-450, Santa Luzia, Juiz de Fora-MG
          (doravante denominado simplesmente “Smart Finances”), por meio do Site
          www.solucaodigital.tech e Aplicativo do Smart Finances{' '}
          <Text style={{ fontWeight: 'bold' }}>
            (“Plataformas Smart Finances”)
          </Text>
          , tendo como objetivo fornecer uma visão transparente das práticas
          relacionadas à coleta, ao uso, ao armazenamento e ao tratamento dos
          dados pelo Smart Finances.{'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          1. Definições
        </SubTitle>
        <Text>
          {'\n'}
          Para os fins desta Política de Privacidade:
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Dados Pessoais”</Text>
        <Text>
          Significa informações que permitam a identificação, direta ou
          indiretamente, de pessoas naturais.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Dados Pessoais Sensíveis”</Text>
        <Text>
          Significa os Dados Pessoais sobre origem racial ou étnica, convicção
          religiosa, opinião política, filiação a sindicato ou a organização de
          caráter religioso, filosófico ou político, dado referente à saúde ou à
          vida sexual, dado genético ou biométrico, quando vinculado a uma
          pessoa natural.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          “Tratamento de Dados Pessoais"
        </Text>
        <Text>
          Significa qualquer operação realizada com Dados Pessoais, tais como a
          coleta, produção, recepção, classificação, utilização, acesso,
          reprodução, transmissão, distribuição, processamento, arquivamento,
          armazenamento, eliminação, avaliação ou controle da informação,
          modificação, comunicação, transferência, difusão ou extração.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Leis de Proteção de Dados"</Text>
        <Text>
          Significa toda a legislação aplicável ao Tratamento de Dados Pessoais,
          que inclui, sem limitação, a Lei nº 13.709/2018.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          2. Quais Dados São Coletados
        </SubTitle>
        <Text>
          {'\n'}O Smart Finances coleta os seguintes tipos de dados dos seus
          Usuários:
          {'\n'}
        </Text>

        <SubTitle>Dados Pessoais</SubTitle>
        <Text>
          São todos os dados que possam, de alguma forma, te identificar, tais
          como, mas não se limitando a: nome completo, número de CPF, número de
          RG, endereço, número de telefone e endereço de e-mail.
          {'\n'}
        </Text>

        <SubTitle>Dados Bancários e Transacionais</SubTitle>
        <Text>
          São os dados necessários para conectar contas bancárias ou realizar
          transferências por meio do aplicativo Smart Finances,sejam eles do
          Usuário ou de um recebedor, entre elas: código do banco, número da
          conta corrente/poupança, agência, número do cartão, data de validade,
          dígito verificador, entre outros.
          {'\n'}
        </Text>

        <SubTitle>Dados Financeiros</SubTitle>
        <Text>
          São os dados que detalham, de forma específica e pessoal, informações
          financeiras - que podem ser coletadas de sua(s) conta(s) conectada(s),
          são elas: informações relacionadas a transações, gastos, renda,
          natureza e categoria de suas despesas, cheque especial, crédito,
          empréstimos, investimentos, entre outras.
          {'\n'}
        </Text>

        <SubTitle>Dados de Acesso</SubTitle>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>
            - Informações coletadas dos Usuários ao usar o Site:
          </Text>{' '}
          inclui, entre outros, o navegador de acesso; endereço do protocolo de
          Internet (IP); data e hora do acesso; localização geográfica; e as
          ações do Usuário no site.
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>
            - Informações coletadas de Usuários ao usar o Aplicativo:
          </Text>{' '}
          inclui, entre outros, o modelo do dispositivo móvel e o sistema
          operacional utilizado para o acesso, incluindo o Device ID; endereço
          do protocolo de Internet (IP); data e hora do acesso versão do
          aplicativo; provedor de conexão; localização geográfica; e as ações do
          Usuário no site.
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>
            - Comunicação entre Usuário e o Smart Finances:
          </Text>{' '}
          inclui quaisquer comunicações havidas entre nós (Smart Finances e
          Usuário) por e-mail, telefone, chat bot, redes sociais e/ou messenger
          (whatsapp, telegram, entre outros).
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>- Cookies:</Text> explicaremos no
          item 7 abaixo.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          2. Como Usamos os Dados Coletados
        </SubTitle>
        <Text>
          É importante que você saiba como funciona o caminho dos seus dados
          aqui dentro:
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Execução do Contrato</Text>
        <Text>
          Ao concordar com nossos Termos de Uso, o Usuário celebra um contrato
          conosco. Para cumprirmos nossas obrigações neste contrato, precisamos
          coletar e processar suas informações pessoais e financeiras,
          especialmente para viabilizar a utilização das funcionalidades
          ofertadas.
          {'\n'}
        </Text>

        <Text>
          {'\n'}O Smart Finances poderá acessar os seus dados financeiros para
          lhe prestar atendimento quando você precisar, como, por exemplo, para
          entender o motivo de qualquer problema de importação de conta bancária
          ou qualquer bug na sua conta.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Funcionamento do Smart Finances
        </Text>
        <Text>
          Todos os dados coletados são utilizados para manter e aprimorar o
          funcionamento do aplicativo/site e oferecer a melhor experiência ao
          Usuário como, por exemplo, para (i) sincronizar automaticamente as
          contas conectadas pelo Usuário mantendo seus dados financeiros
          atualizados; (ii) realizar transações; (iii) desenvolver novas
          funcionalidades; (iv) realizar estatísticas genéricas ou anonimizadas
          para monitoramento de utilização do Smart Finances; (v) verificar a
          proteção do Smart Finances contra erros, fraudes ou qualquer outro
          crime eletrônico; (vi) oferecer produtos e serviços que se enquadrem
          no perfil do Usuário.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Comunicação com os Usuários</Text>
        <Text>
          O Smart Finances poderá ligar para os Usuários e/ou enviar mensagens,
          e-mails ou notificações com alertas e comunicados a fim de auxiliá-los
          a explorar todas as funcionalidades do Smart Finances, incluindo, mas
          não se limitando, para realização de planejamento financeiro,
          realização de transferências e pagamentos, inclusão de
          funcionalidades, lembretes de uso do site/aplicativo, recomendação de
          produtos e serviços de Parceiros, entre outros.
          {'\n'}
        </Text>

        <Text>
          Envio de informações que você tenha solicitado ou consentido em
          receber, como notificações push, boletins informativos, últimas
          notícias, e outras informações sobre atividades relevantes do Smart
          Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Análise financeira</Text>
        <Text>
          O Smart Finances poderá processar os seus Dados Financeiros de forma
          codificada e automatizada, com o uso do Software, a fim de gerar
          informações e estatísticas financeiras gerais não individualizadas,
          bem como fazer a análise financeira do Usuário e elaborar seu Credit
          Score. Essa análise pode depender da obtenção dos Dados Financeiros do
          Usuário, bem como de outras informações disponíveis em bancos de
          dados, como o Sistema de Informações de Crédito do Banco Central (SCR)
          e bureaus de crédito (como o Boa Vista e o Serasa).
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Pesquisa, estudos e levantamentos
        </Text>
        <Text>
          O Smart Finances poderá processar os dados coletados para fins de
          pesquisa, bem como para identificar necessidades dos Usuários, e
          desenvolver funcionalidades e/ou recomendar produtos e serviços que se
          enquadrem no seu perfil, sejam eles oferecidos pelo Smart Finances,
          empresas do mesmo grupo econômico ou por Parceiros.
          {'\n'}
        </Text>

        <Text>
          Poderemos enviar pesquisas e convites para testes para desenvolvimento
          de novas funcionalidades.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Recomendação e oferta de produtos/serviços
        </Text>
        <Text>
          O Smart Finances poderá processar os dados pessoais e financeiros
          coletados para recomendar produtos e/ou serviços de Parceiros que se
          enquadrem no perfil do Usuário. Para isso, é importante que os dados
          processados estejam sempre atualizados, podendo o Smart Finances
          consultar informações mantidas em bases de dados públicas ou
          terceirizadas a partir do seu interesse/simulação de algum produto.
          {'\n'}
        </Text>

        <Text>
          Lembre-se que quando você fizer qualquer simulação de produto
          financeiro conosco, compartilharemos alguns dados seus com nossos
          Parceiros para retornar com a melhor oferta para você, combinado?
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          4. Como Armazenamos as Informações Coletadas
        </SubTitle>

        <Text>
          Consideramos nossa prioridade a segurança de todos os dados
          relacionados aos nossos Usuários. Por isso, o Smart Finances sempre
          adotará medidas técnicas e organizacionais de segurança de informação
          compatíveis com o nível de risco avaliado e com o estado da técnica
          para garantir a confidencialidade, a integridade, a disponibilidade e
          a resiliência de seus sistemas informáticos, bancos de dados, arquivos
          físicos e outros repositórios de informações, de modo a evitar acessos
          não autorizados e situações acidentais ou ilícitas de destruição,
          perda, alteração, comunicação ou difusão de dados pessoais.
          {'\n'}
        </Text>

        <Text>
          Todos os dados identificáveis são armazenados de forma criptografada
          em serviços de nuvem confiáveis de parceiros que podem estar
          localizados no Brasil ou em outros países que proporcionem elevado
          grau de proteção de dados pessoais. As informações são protegidas com
          a tecnologia SSL (Secure Socket Layer) para que os dados do Usuário
          permaneçam em sigilo. Além disso, essa tecnologia visa ao impedimento
          que as informações sejam transmitidas ou acessadas por terceiros não
          autorizados.
          {'\n'}
        </Text>

        <Text>
          Mantemos suas informações pelo tempo necessário ou relevante para a
          prestação dos serviços oferecidos pelo Smart Finances, respeitando o
          período de retenção de dados determinado pela legislação aplicável.
          {'\n'}
        </Text>

        <Text>
          Durante o tempo em que o Usuário mantiver seu consentimento ativo, as
          informações coletadas serão sincronizadas e tratadas, conforme
          permitido em lei, bem como para solucionar disputas, cumprir com
          contratos e atender obrigações legais e regulatórias do Smart
          Finances.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          5. Compartilhamentpo de Dados
        </SubTitle>

        <Text>
          Os dados coletados do Usuário poderão ser compartilhados com:
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Autorização do Usuário</Text>
        <Text>
          O Smart Finances poderá compartilhar, bem como receber seus dados
          mediante o seu consentimento ou outra base legal prevista na Lei Geral
          de Proteção de Dados. Tal troca de informações poderá ocorrer, por
          exemplo, por meio de uma conexão com uma plataforma de terceiros,
          sendo nosso compromisso compartilhar apenas os dados necessários ao
          cumprimento dos serviços e funcionalidades do Smart Finances, sempre
          de acordo com as salvaguardas e boas práticas.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Empresas Coligadas</Text>
        <Text>
          Os dados coletados poderão ser compartilhados com empresas que façam
          parte do mesmo grupo econômico que o Smart Finances, tal como o PicPay
          Serviços S.A, especialmente quando tal compartilhamento for necessário
          para fins de manutenção, desenvolvimento e implementação de melhorias
          ou, ainda, para a execução da prestação dos serviços oferecidos aos
          Usuários. Ainda, o compartilhamento de dados com empresas do Grupo
          Smart Finances terá como finalidades: (a) o desenvolvimento de novos
          produtos, funcionalidades e serviços, bem como sua melhoria e
          aperfeiçoamento; (b) geração de dados estatísticos e agregados acerca
          do uso de nossos produtos e serviços e perfis dos Usuários; (c)
          pesquisas de mercado e de opinião; e (d) investigações e medidas de
          prevenção de fraudes.
          {'\n'}
        </Text>

        <Text>
          Fique tranquilo, qualquer empresa que venha a ter acesso aos dados
          deverá adotar pelo menos os mesmos níveis de segurança utilizados e
          garantidos pelo Smart Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Parceiros</Text>
        <Text>
          Com a finalidade de recomendar ao Usuário, de forma personalizada,
          produtos e serviços oferecidos por Parceiros, o Smart Finances poderá
          compartilhar seus dados com o Parceiro quando tal compartilhamento for
          necessário para a oferta ou contratação do produto/serviço (e o
          Parceiro poderá checar seu status em bureaus de crédito/órgãos de
          proteção ao crédito, por exemplo).
          {'\n'}
        </Text>

        <Text>
          Lembre-se de que o Smart Finances apenas recomenda esses produtos e
          serviços, portanto, o envio dos dados ao Parceiro em alguns casos é
          necessário para que ele possa (i) verificar se o você é elegível a um
          serviço ou produto a ser recomendado pelo Smart Finances como, por
          exemplo, uma determinada modalidade de empréstimo ou cartão de
          crédito, e (ii) concluir a contratação mediante solicitação do
          Usuário.
          {'\n'}
        </Text>

        <Text>
          Da mesma forma, o Smart Finances poderá receber do Parceiro
          informações sobre a disponibilidade de uma oferta, a contratação ou
          não do produto/serviço pelo Usuário, bem como outros dados
          relacionados à performance da parceria como, por exemplo, casos de
          inadimplência e fraude.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>Potenciais Parceiros</Text>
        <Text>
          Com o objetivo de estabelecer novas parcerias, o Smart Finances poderá
          compartilhar com potenciais Parceiros algumas informações que sejam
          necessárias à concretização de tal parceria. O potencial Parceiro
          apenas poderá receber as informações após a assinatura de Acordo de
          Confidencialidade prevendo que os dados compartilhados serão
          utilizados única e exclusivamente para os fins da concretização da
          parceria e serão destruídos caso essa não aconteça.
          {'\n'}
        </Text>

        <Text>
          Fique tranquilo: nenhum dado financeiro não anonimizado poderá ser
          compartilhado sem a autorização do Usuário.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Empresas que prestam serviços para o Smart Finances
        </Text>
        <Text>
          O Smart Finances poderá compartilhar dados coletados com prestadores
          de serviços terceirizados na medida em que tais informações sejam
          necessárias à prestação do serviço ou aprimoramento de alguma
          finalidade do aplicativo/site. Esses prestadores de serviços
          terceirizados podem ter sido contratados para, por exemplo, prestar
          atendimento ao Usuário, auxiliar na resolução de problemas técnicos,
          realizar a checagem de informações e prevenção à fraude, avaliar e
          gerenciar riscos, entre outros.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Com terceiros conforme permitido ou exigido por lei
        </Text>
        <Text>
          O Smart Finances poderá compartilhar dados com terceiros quando
          permitido ou exigido por lei como, por exemplo, para o cumprimento de
          obrigação legal ou regulatória; para fins de auditoria; prevenção à
          fraude e lavagem de dinheiro; para investigar violações ou cumprir uma
          previsão de um contrato celebrado com o Usuário; para a proteção do
          crédito; para cumprir uma ordem judicial, entre outros.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances se resguarda no direito de, a seu critério, divulgar
          dados anonimizados, bem como análises elaboradas com base em tais
          informações. Caso sejam dados individualizados, o compartilhamento
          deverá ser feito com base no seu consentimento ou outra base legal
          prevista na legislação de proteção de dados.
          {'\n'}
        </Text>

        <Text>
          Nos termos da legislação vigente, o Smart Finances adotará
          procedimentos internos para certificar-se de que apenas compartilhará
          dados pessoais com terceiros que adotem medidas técnicas e
          administrativas suficientes para garantir a adequada segurança e
          proteção dos dados pessoais.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          6. Direitos dos Titulares de Dados Pessoais
        </SubTitle>

        <Text>
          Garantimos o cumprimento de todos os direitos dos titulares de dados
          pessoais controlados em relação ao tratamento realizado pelo Smart
          Finances, em especial, os seguintes direitos previstos na LGPD:
          {'\n'}
        </Text>

        <Text>
          - A confirmação de existência de tratamento de dados;
          {'\n'}
        </Text>

        <Text>
          - O acesso facilitados aos dados pessoais de sua titularidade e a
          correção de eventuais dados pessoais incompletos, inexatos ou
          desatualizados;
          {'\n'}
        </Text>

        <Text>
          - Anonimização, bloqueio ou eliminação de dados desnecessários,
          excessivos ou tratados em desconformidade com a LGPD e com esta
          Política;
          {'\n'}
        </Text>

        <Text>
          - Informações sobre o compartilhamento de dados com entidades públicas
          e privadas;
          {'\n'}
        </Text>

        <Text>
          - Informações sobre a possibilidade de não fornecimento do
          consentimento e revogação do consentimento;
          {'\n'}
        </Text>

        <Text>
          - Portabilidade dos dados pessoais a outras entidades, mediante
          requisição expressa e conforme regulamentação oficial sobre o tema;
          {'\n'}
        </Text>

        <Text>
          - Possibilidade de revisão de decisões automatizadas que o Smart
          Finances venha a adotar em processos que possam atingir os direitos e
          interesses dos titulares de dados.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances disponibiliza uma página dedicada à Privacidade no
          seguinte endereço https://app.Smart
          Finances.com.br/#/privacidade-lgpd. Os Usuários também podem, a
          qualquer momento, acessar os Relatórios, completo e simplificado,
          contendo acesso integral a seus dados pessoais respectivamente no site
          e no aplicativo na aba “Ajustes”. Caso deseje acessar informações
          sobre contas e cartões conectados, eles estão disponíveis na tela
          "Contas e Cartões", que pode ser acessada clicando no saldo das suas
          contas, no cabeçalho da aba "Finanças".
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>7. Cookies</SubTitle>

        <Text>
          O Smart Finances utiliza cookies e tecnologias similares, como pixels
          e tags, para certificar que os serviços prestados estão de acordo com
          o melhor padrão esperado pelo Usuário.
          {'\n'}
        </Text>

        <Text>
          Os cookies coletados pelo Smart Finances fornecem somente estatísticas
          e não serão utilizados para propósitos diversos dos aqui expressamente
          previstos.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>O que é cookie?</Text>
        <Text>
          Cookie é um pequeno arquivo adicionado ao seu dispositivo móvel ou
          computador para fornecer uma experiência personalizada de acesso ao
          Smart Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Como o Smart Finances faz a coleta de cookies?
        </Text>
        <Text>
          O Smart Finances utiliza empresas especializadas em veiculação de
          propagandas, dentro e fora do Smart Finances como, por exemplo, o
          Google e o Facebook.
          {'\n'}
        </Text>

        <Text>
          Ao aceitar esta Política de Privacidade, você concorda com a coleta
          dos cookies por empresas contratadas pelo Smart Finances para esse
          fim.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Que tipos de cookies o Smart Finances utiliza?
        </Text>
        <Text>
          O Smart Finances permite a coleta de dois tipos de cookies: salvo e
          temporário:
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>(i)</Text> Um cookie salvo é
          aquele que é introduzido no seu terminal de acesso (ex.: computador,
          tablet, etc.) quando você entra na sua conta no Smart Finances. Este
          cookie serve para armazenar informações, como nome e senha, de maneira
          que o Usuário não tenha que se conectar sempre que acessar o Smart
          Finances.
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>(ii)</Text> Um cookie temporário
          é aquele que é usado para identificar uma visita específica ao Site do
          Smart Finances. Estes cookies são removidos do terminal de acesso
          (ex.: computador, tablet, etc.) do Usuário assim que este finaliza a
          utilização do navegador e são utilizados para armazenar informações
          temporárias.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>
          Para que os cookies são utilizados?
        </Text>
        <Text>
          O Smart Finances utiliza cookies para vários fins, incluindo:
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>(i)</Text> ações de marketing
          para remarketing. Este recurso nos permite atingir os Usuários ou
          visitantes do Site para lembrá-los de efetuarem o cadastro no Smart
          Finances ou para que voltem a acessar a plataforma com facilidade; e
          {'\n'}
        </Text>

        <Text>
          <Text style={{ fontWeight: 'bold' }}>(ii)</Text> entender o
          comportamento de uso do Site e do Aplicativo para melhor
          desenvolvimento do produto.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>
          8. Canal de Comunicação: Encarregado de Dados Pessoais
        </SubTitle>

        <Text>
          Nosso compromisso aqui é sempre dar transparência sobre o que
          coletamos de informações suas e qual a finalidade. Caso surjam dúvidas
          e queira entender melhor algum processo ou quais dados seus estão aqui
          dentro, é só nos contatar por meio do e-mail
          contato@solucaodigital.tech.
          {'\n'}
        </Text>

        <Text>
          Nós nomeamos um Encarregado pelo Tratamento de Dados Pessoais e você
          pode contatá-lo no seguinte endereço de e-mail
          privacidade@solucaodigital.tech.
          {'\n'}
        </Text>

        <Text>
          O Usuário declara ter lido, entendido e que aceita todas as regras,
          condições e obrigações estabelecidas na presente Política de
          Privacidade.
          {'\n'}
        </Text>

        <SubTitle style={{ fontSize: 14 }}>
          Vigência: Esta Política de Privacidade entra em vigor a partir de 22
          de outubro de 2022.
        </SubTitle>
      </ContentScroll>
    </Container>
  );
}
