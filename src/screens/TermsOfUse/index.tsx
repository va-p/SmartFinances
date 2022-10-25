import React from 'react';
import {
  Container,
  ContentScroll,
  LastUpdatedDate,
  Title,
  SubTitle,
  Text
} from './styles';

import { Header } from '@components/Header';

export function TermsOfUse() {
  return (
    <Container>
      <Header type='primary' title='Termos de Uso' />

      <ContentScroll>
        <LastUpdatedDate>Última atualização: 22/10/2022</LastUpdatedDate>
        <Title>Termos e Condições de Uso</Title>
        <Text>
          {'\n'}
          Estes Termos e Condições de Uso (“<Text style={{ fontWeight: 'bold' }}>Termos de Uso</Text>”) contêm as condições gerais aplicáveis aos serviços oferecidos pela <Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Digital Tech</Text>, inscrita no CNPJ sob o nº 20.543.901/0001-37, com sede na Av Santa Luzia, 761, Casa 2, CEP 36030-450, Santa Luzia, Juiz de Fora-MG (doravante denominado simplesmente “Smart Finances”), por meio do Site www.solucaodigital.tech e Aplicativo do Smart Finances <Text style={{ fontWeight: 'bold' }}>(“Plataformas Smart Finances”)</Text>.{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Breve apresentação do Smart Finances:</Text>{'\n'}
        </Text>

        <Text>
          O Smart Finances é uma plataforma digital de gestão financeira que busca facilitar a relação do Usuário com o seu dinheiro, por meio da organização dos seus gastos, insights inteligentes e recomendação de produtos e serviços de acordo com o seu perfil.{'\n'}
          {'\n'}
          Para usar e acessar as funcionalidades oferecidas pelo Smart Finances, você precisa (i) ser maior de 18 anos; (ii) se registrar e criar uma conta pessoal; e (iii) ao se registrar, aceitar estes Termos de Uso e a Política de Privacidade, sem reservas.{'\n'}
          {'\n'}
          Caso tenha qualquer dúvida sobre os Termos de Uso e/ou a Política de Privacidade, recomendamos que entre em contato com o Smart Finances por meio do email  <Text style={{ fontWeight: 'bold' }}>contato@solucaodigital.tech</Text> ou Site ANTES de aceitá-los.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>1. Definições</SubTitle>
        <Text>{'\n'}
          Para facilitar a leitura, usamos certas palavras/termos com a primeira letra em maiúsculo. Sempre que isso ocorrer nos Termos de Uso e na Política de Privacidade, você deve entender que essa palavra/termo tem o significado indicado abaixo:{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Aplicativo”</Text>
        <Text>
          Significa o aplicativo do Smart Finances adaptado e desenvolvido para operação em telefone celular, tablet ou qualquer outro dispositivo móvel.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Anonimização”</Text>
        <Text>
          Significa a utilização de meios técnicos razoáveis e disponíveis no momento do tratamento de dados, por meio dos quais um dado deixa de ser associado a um Usuário.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Conta Smart Finances"</Text>
        <Text>
          Significa a utilização de meios técnicos razoáveis e disponíveis no momento do tratamento de dados, por meio dos quais um dado deixa de ser associado a um Usuário.{'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Conteúdo"</Text>
        <Text>
          Significa toda e qualquer informação disponibilizada pelo ou por meio do Site e/ou do Aplicativo, tais como textos, dados, software, imagens, vídeos, áudios, recursos interativos, incluindo os códigos fonte empregados para exibição desses conteúdos, como aqueles em linguagem HTML, CSS, JavaScript, entre outros.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Credit Score”</Text>
        <Text>
          Significa o resultado de um cálculo estatístico com objetivo de ajudar os Usuários e as instituições financeiras a realizarem negócios de crédito com menor custo e maior agilidade. É um método que utiliza informações públicas e disponíveis na base de dados das empresas que analisam o crédito, coletadas legalmente e, também, as informações compartilhadas pelos Usuários com o Smart Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Dados Financeiros”</Text>
        <Text>
          São os dados do Usuário que detalham, de forma específica e pessoal, informações financeiras - que podem ser coletadas de sua(s) conta(s) conectada(s), de forma automática pelo Software ou inseridas manualmente pelo Usuário na sua Conta Smart Finances - incluindo, sem limitação, informações relacionadas a transações, gastos, renda, natureza e categoria de suas despesas, cheque especial, crédito, empréstimos, investimentos, entre outros dados do tipo que possam ser relevantes ao planejamento financeiro do Usuário.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Dados Pessoais”</Text>
        <Text>
          Significa quaisquer dados do Usuário que, de alguma forma, permitam sua identificação, tais como, mas não se limitando a, nome completo, CPF, RG endereço, número de telefone e endereço de email.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Finalidade”</Text>
        <Text>
          Significa a realização do tratamento dos dados para propósitos informados ao Usuário, nos termos da Política de Privacidade.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>"Smart Finances Premium”</Text>
        <Text>
          Significa modalidade de plataforma com funcionalidades exclusivas, contratada mediante pagamento.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>"Open Finance”</Text>
        <Text>
          Refere-se a iniciativa do Banco Central do Brasil que permitirá o compartilhamento de dados referentes a produtos e serviços contratados pelos  clientes, com o seu consentimento expresso, entre as instituições.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Parceiros”</Text>
        <Text>
          São as instituições financeiras, correspondentes bancários, seguradoras, corretoras, anunciantes de produtos financeiros ou não, entre outros, que mantenham uma relação contratual de parceria com o Smart Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Política de Privacidade”</Text>
        <Text>
          Significa a política de privacidade que rege as disposições sobre a utilização dos dados do Usuário pelo Smart Finances e que se encontra disponível no link https://solucaodigital.tech/smartfinances/politica-de-privacidade.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Plataforma Smart Finances”</Text>
        <Text>
          Refere-se, em conjunto, ao Aplicativo e Site do Smart Finances.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Site”</Text>
        <Text>
          Significa o endereço eletrônico www.solucaodigital.tech/smartfinances ou qualquer outro que vier a substituí-lo.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Software”</Text>
        <Text>
          Significa o software de propriedade exclusiva do Smart Finances por meio do qual serão acessados, copiados e atualizados automaticamente os Dados Financeiros do Usuário diretamente das plataformas de internet banking das instituições financeiras informadas pelo Usuário, bem como geridos e manejados todos os dados coletados de forma automatizada.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Tratamento”</Text>
        <Text>
          Significa toda operação realizada com dados pessoais, como as que se referem a coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.
          {'\n'}
        </Text>

        <Text style={{ fontWeight: 'bold' }}>“Usuário”</Text>
        <Text>
          Significa uma pessoa física, com plena capacidade de contratar, que acessa o Site e/ou o Aplicativo e realiza o seu cadastro pessoal para utilizar as funcionalidades oferecidas pelo Smart Finances, aceitando expressamente os Termos de Uso e a Política de Privacidade.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>2. Uso Do Smart Finances</SubTitle>
        <Text>
          {'\n'}
          Os serviços podem ser disponibilizados ao Usuário em duas modalidades que contarão com as mesmas condições de disponibilidade e operacionalidade: (i) Smart Finances Padrão, que não exige pagamento para sua utilização, e (ii) Smart Finances Premium, cujo uso das funcionalidades exclusivas exige pagamento de assinatura para acessá-las.
          {'\n'}
        </Text>

        <Text>
          A contratação do “Smart Finances Premium”, quando disponível, será realizada por meio das lojas de aplicativos "App Store" e "Google Play Store", acessíveis nos sistemas iOS, da Apple e Android, do Google, mediante aceitação específica dos Termos e Condições disponíveis na  App Store e no Google Play Store respectivamente. Importante esclarecer que o eventual cancelamento de assinatura também deverá ser realizado através destes mesmos canais.
          {'\n'}
        </Text>

        <Text>
          Ao contratar o pacote “Smart Finances Premium”, você terá acesso a ferramentas exclusivas que permitem a customização e um controle financeiro ainda maior. Atualmente são disponibilizadas duas modalidades de assinatura, sendo elas mensal e anual.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances se reserva no direito de modificar, encerrar ou alterar os planos de assinatura e ofertas promocionais, a qualquer momento, mediante aviso prévio aos Usuários.
          {'\n'}
        </Text>

        <Text>
          Ambas as modalidades, “Smart Finances Padrão” e “Smart Finances Premium”, estarão sujeitas aos presentes Termos e Usos e Política de  Privacidade.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>2.1. Cadastro no Site</SubTitle>
        <Text>
          {'\n'}
          Para utilizar o Aplicativo/Site do Smart Finances, você deverá realizar o seu cadastro, fornecendo ao Smart Finances os seus dados pessoais, tais como nome, CPF, e-mail e telefone. Você também deverá criar um nome de Usuário e senha, que serão utilizados para acesso à sua conta no Smart Finances.
          {'\n'}
        </Text>

        <Text>
          Fique atento pois você é o responsável por manter a confidencialidade da sua conta e senha, devendo mantê-las sob sua guarda e controle, incluindo, mas não limitado, a restrição de acesso ao seu computador, celular, dispositivo móvel e/ou conta. Na hipótese de comprometimento do seu sigilo, você deverá entrar em contato com o Smart Finances por meio do email contato@solucaodigital.tech imediatamente após tomar conhecimento de qualquer violação de segurança ou uso não autorizado da sua conta.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances se reserva o direito de impedir, a seu critério, a criação de novos cadastros ou cancelar os já efetuados, em caso de ser detectada anomalia que, em sua análise, seja revestida de gravidade ou demonstre tentativa deliberada de burlar as regras aqui descritas. Além disso, o Smart Finances poderá, a qualquer momento, solicitar a atualização e/ou fornecimento de dados  para a complementação do cadastro.
          {'\n'}
        </Text>

        <Text>
          Ao acessar, se cadastrar e/ou usar os serviços ofertados pelo Smart Finances, você expressamente:
          {'\n'}
        </Text>

        <Text>
          (i) declara ter lido, compreendido e aceito todas as condições estipuladas neste Termos de Uso, na Política de Privacidade e todas as demais políticas e regras disponibilizadas pelo Smart Finances; e
          {'\n'}
        </Text>

        <Text>
          (ii) garante que todos os dados cadastrais fornecidos ao Smart Finances são pessoais, verdadeiros, precisos, completos e estão atualizados.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>2.2. Conexão Com Conta(s) Bancária(s)</SubTitle>
        <Text>
          {'\n'}
          Por meio de uma operação baseada em dados agregados de contas bancárias, o Smart Finances oferece diversas funcionalidades para você como, por exemplo, a sincronização das contas conectadas e atualização automática dos dados financeiros, a categorização das suas transações, a análise de sua saúde financeira por meio do Credit Score, a simulação de empréstimo pessoal e a recomendação de produtos e serviços financeiros, entre outras.
          {'\n'}
        </Text>

        <Text>
          Os Usuários terão à disposição dois tipos de conexões bancárias: (a) por meio das APIs do Open Finance, e (b) através de tecnologia proprietária do Smart Finances.
          {'\n'}
        </Text>

        <SubTitle>a) Conexão via Open Finance:</SubTitle>
        <Text>
          O Open Finance, ou sistema financeiro aberto, é uma iniciativa do Banco Central que possibilita a abertura e o compartilhamento consentido de dados e informações cadastrais e transacionais de clientes pessoa física e pessoa jurídica através de APIs que permitem a integração entre diferentes instituições autorizadas, garantindo mais autonomia e controle dos dados bancários ao cliente.
          {'\n'}
        </Text>

        <Text>
          Para a conexão via Open Finance o Usuário precisará, por meio de uma chamada de gestão do consentimento (que será obrigatório nas aplicações mobile de cada banco), autorizar o acesso, a recepção e a transmissão dos dados bancários. Sem o referido consentimento, nenhum participante do Open Finance poderá acessar, recepcionar e/ou transmitir as suas informações.
          {'\n'}
        </Text>

        <Text>
          A autorização terá validade máxima de 12 meses, podendo ser alterada ou retirada a qualquer momento por meio da plataforma em que o consentimento foi concedido.
          {'\n'}
        </Text>

        <SubTitle>b) Conexão por meio de tecnologia proprietária Smart Finances:</SubTitle>
        <Text>
          Caso seja de seu interesse, você poderá autorizar o Smart Finances a acessar e sincronizar suas contas bancárias por meio de tecnologia proprietária. Para tanto, será requisitado que forneça:
          {'\n'}
        </Text>

        <Text>
          (i) seus dados bancários (banco, agência e conta corrente/poupança) e a respectiva senha utilizada para acessar o internet banking; e
          {'\n'}
        </Text>

        <Text>
          (ii) autorização expressa para acessar seus dados financeiros disponibilizados no sistema de internet banking das instituições financeiras em que mantém a(s) conta(s) informada(s).
          {'\n'}
        </Text>

        <SubTitle>c) Declarações do Usuário:</SubTitle>
        <Text>
          O Usuário, ao fornecer seus Dados Pessoais e Bancários e autorizar o acesso do Smart Finances seja por meio de conexão proprietária ou por meio do Open Finance, declara estar ciente e concorda que:
          {'\n'}
        </Text>

        <Text>
          - O Smart Finances não movimenta ou de qualquer forma interfere nos ativos e contas bancárias informadas pelo Usuário. As senhas e/ou códigos de autorização informados pelo Usuário são armazenados de forma criptografada e se limitam a permitir que o Smart Finances colete os Dados Financeiros junto a cada instituição financeira informada pelo Usuário.
          {'\n'}
        </Text>

        <Text>
          - O Smart Finances irá envidar os melhores esforços para manter os dados tratados sempre seguros, inclusive, irá adotar medidas de segurança e de proteção compatíveis com a natureza dos dados coletados, usados e armazenados, conforme previstos na Política de Privacidade.
          {'\n'}
        </Text>

        <Text>
          - O Smart Finances estará autorizado expressamente a, dentro dos limites impostos pela Política de Privacidade, acessar e atualizar, sempre de forma automática e, inclusive, no modo offline, seus Dados Financeiros junto a cada instituição financeira e/ou corretora de valores mobiliários informadas.
          {'\n'}
        </Text>

        <Text>
          - A obtenção de dados financeiros pelo Smart Finances depende de serviços prestados pelas instituições financeiras onde o Usuário mantém sua(s) conta(s). Sendo assim, apesar dos nossos esforços, o Smart Finances não garante a pontualidade, precisão, entrega ou ausência de falha na obtenção desses dados por meio das plataformas dessas instituições ou através das APIs do Open Finance, já que essa importação poderá estar sujeita a problemas técnicos ou outras dificuldades de conexão que resultem em falhas. Para diminuir o impacto dessas falhas e para que o Usuário tenha a melhor experiência em nosso Aplicativo/Site, o Smart Finances se resguarda no direito de realizar sincronizações automáticas periódicas dos seus dados financeiros.
          {'\n'}
        </Text>

        <Text>
          - O Smart Finances coleta as informações das plataformas das instituições financeiras, mas não revisa os dados obtidos. Por esse motivo, o Usuário será exclusivamente responsável por conferir as informações disponibilizadas pelo Smart Finances sobre os Dados Financeiros antes de tomar qualquer decisão baseada neles.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>3. Funcionalidades Gerais do APP/Site</SubTitle>
        <Text>
          O Smart Finances é um correspondente bancário (nos termos da Resolução 3.594/11 do Banco Central do Brasil) que, além de disponibilizar uma ferramenta de organização pessoal, também provê um marketplace de serviços financeiros voltado aos Usuários, sem custos adicionais para eles. Nesse sentido, o Smart Finances atua como uma plataforma que une, de um lado, seu Usuário que deseja contratar um serviço ou produto e, de outro, instituições parceiras que tenham interesse na oferta do produto ou serviço desejado.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>4. Parceiros, empresas do mesmo grupo econômico e prestadores de serviços</SubTitle>
        <Text>
          Com o objetivo de ajudar nossos Usuários a organizarem suas finanças e acessar ao marketplace financeiro, podemos divulgar produtos e serviços oferecidos por nossos Parceiros e Empresas do mesmo grupo econômico que se enquadrem no perfil do Usuário como, por exemplo, empréstimos, seguros, entre outros produtos, financeiros ou não.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances poderá divulgar tais produtos e/ou serviços por meio do próprio Site e/ou Aplicativo, de forma automatizada, bem como por meio de Aplicativo de empresas do mesmo grupo econômico, considerando o perfil do Usuário.
          {'\n'}
        </Text>

        <Text>
          Por esse motivo, o Aplicativo/Site poderá conter links para websites/aplicativos dos Parceiros e Empresas coligadas do Smart Finances, para os quais o Usuário poderá ser direcionado caso clique em tais links. O Smart Finances não tem controle sobre tais websites/aplicativos dos Parceiros, e, portanto, não garante a disponibilidade ou se responsabiliza por conteúdo, publicidade, produtos, serviços ou outros materiais contidos ou disponibilizados por meio de tais websites/aplicativos.
          {'\n'}
        </Text>

        <Text>
          As plataformas dos Parceiros e das Empresas coligadas do Smart Finances não estão sujeitas a estes termos. Sendo assim, recomendamos que leia atentamente os Termos de Uso e a Política de Privacidade aplicáveis a cada plataforma para a qual seja direcionado.
          {'\n'}
        </Text>

        <Text>
          Além disso, o Smart Finances pode contar com prestadores de serviço para auxílio e/ou completude das funcionalidades do aplicativo e/ou site, explicamos isso em nossa política sobre como tratamos seus dados aqui dentro.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>5. Restrições ao Uso do Smart Finances</SubTitle>
        <Text>
          O Usuário não poderá:
          {'\n'}
        </Text>

        <Text>
          - Utilizar o aplicativo ou o site para divulgar informações de qualquer forma que possa implicar em violação de normas aplicáveis no Brasil, de direitos de propriedade do Smart Finances e/ou de terceiros ou dos bons costumes;
          {'\n'}
        </Text>

        <Text>
          - Reproduzir, copiar, ceder, modificar, realizar engenharia reversa ou, de qualquer outra forma, utilizar qualquer funcionalidade, conteúdo, software ou material disponibilizado por meio do aplicativo/site de forma não permitida nestes termos;
          {'\n'}
        </Text>

        <Text>
          - Empregar softwares, técnicas e/ou artifícios com o intuito de utilizar indevidamente as funcionalidades do site, o aplicativo e/ou o software para práticas nocivas ao Smart Finances ou a terceiros, tais como fraudes, lavagem de dinheiro, exploits, spamming, flooding, spoofing, crashing, root kits, etc.;
          {'\n'}
        </Text>

        <Text>
          - Publicar ou transmitir qualquer arquivo que contenha vírus, worms, cavalos de tróia ou qualquer outro programa contaminante ou destrutivo, ou que de outra forma possa interferir no bom funcionamento do site, do aplicativo ou de qualquer software;
          {'\n'}
        </Text>

        <Text>
          - Divulgar, utilizar ou modificar indevidamente os dados de outros Usuários.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>6. Propriedade Intelectual</SubTitle>
        <Text>
          O Usuário não adquire, por meio dos presentes Termos de Uso ou da Política de Privacidade, nenhum direito de propriedade intelectual ou outros direitos exclusivos, incluindo patentes, desenhos, bases de dados, marcas, direitos autorais ou direitos sobre informações confidenciais ou segredos de negócio, sobre ou relacionados ao software, ao aplicativo e/ou ao site, os quais são de propriedade exclusiva do Smart Finances.
          {'\n'}
        </Text>

        <Text>
          Caso você venha a desenvolver um novo módulo ou produto que caracterize cópia, integral ou parcial, quer seja do dicionário de dados, quer seja do programa, esse será considerado como parte do software, ficando, portanto, sua propriedade incorporada pelo Smart Finances e seu uso condicionado a estes Termos de Uso.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>7. Responsabilidades</SubTitle>
        <Text>
          Algumas decisões que podem ser tomadas por você implicam em riscos, então é importante que você saiba que não somos responsáveis, principalmente:
          {'\n'}
        </Text>

        <Text>
          - Pelos serviços ou produtos oferecidos por Parceiros ou quaisquer terceiros, inclusive no que diz respeito a sua disponibilidade, qualidade, quantidade, características essenciais, ofertas, preços, validade da oferta, formas de pagamento ou quaisquer outros elementos a eles referentes;
          {'\n'}
        </Text>

        <Text>
          - Por eventuais prejuízos sofridos pelos Usuários em razão da tomada de decisões com base nas informações disponibilizadas no Site/Aplicativo;
          {'\n'}
        </Text>

        <Text>
          - Por eventuais prejuízos sofridos pelos Usuários em razão de falhas no sistema de informática ou nos servidores que independam de culpa do Smart Finances ou em sua conectividade com a internet de modo geral, devendo o Usuário manter, às suas expensas, linha de telecomunicação, modem, software de comunicação, endereço de correio eletrônico e outros recursos necessários à comunicação com o Smart Finances;
          {'\n'}
        </Text>

        <Text>
          - Por danos causados por hackers e/ou programas/códigos nocivos ao Software, tais como, mas sem se limitar a vírus, worms, ataques de negação;
          {'\n'}
        </Text>

        <Text>
          - Por produtos e/ou serviços oferecidos por instituições financeiras em que o Usuário detém a(s) conta(s) bancária(s) conectada(s) à sua Conta Smart Finances;
          {'\n'}
        </Text>

        <Text>
          - Pela autenticidade, validade e precisão dos dados fornecidos pelos Usuários e/ou coletadas nas plataformas das instituições financeiras.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>8. Indenização</SubTitle>
        <Text>
          O Usuário concorda em defender, indenizar e manter indene o Smart Finances, suas afiliadas, diretores, empregados e agentes, de e contra quaisquer encargos, ações ou demandas, incluindo, mas não limitado a honorários advocatícios razoáveis, resultantes: (i) de eventual utilização indevida do “Smart Finances”; ou (ii) da violação das condições ora pactuadas.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>9. Proteção À Privacidade</SubTitle>
        <Text>
          A forma como coletamos, armazenamos e tratamos os dados dos Usuários, bem como para quais finalidades eles poderão ser utilizados, estão descritas na Política de Privacidade do Smart Finances, que é parte integrante e inseparável destes Termos de Uso.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>10. Direitos dos Titulares de Dados Pessoais</SubTitle>
        <Text>
          O Smart Finances se compromete a adotar medidas efetivas para a garantia dos direitos dos titulares de dados pessoais controlados pelo Smart Finances, conforme especificados pela Lei Geral de Proteção de Dados Pessoais – LGPD, e demais leis e regulamentos brasileiros aplicáveis à proteção de dados pessoais.
          {'\n'}
        </Text>

        <SubTitle>a) Indicação do Encarregado pelo tratamento de Dados Pessoais</SubTitle>
        <Text>
          O Smart Finances manterá controles e processos que garantam a resposta aos direitos dos titulares e requisições das autoridades competentes com relação à proteção de dados pessoais dentro dos prazos legais. Para que os titulares de Dados Pessoais possam exercer seus direitos, fazer reclamações e solicitações, bem como enviar sugestões, o Smart Finances disponibiliza o e-mail privacidade@solucaodigital.tech como canal de contato com o Encarregado pelo Tratamento de Dados Pessoais.
          {'\n'}
        </Text>

        <SubTitle>b) Exclusão de Dados e Encerramento da Conta Smart Finances</SubTitle>
        <Text>
          Você poderá, a qualquer momento, solicitar a exclusão da sua conta Smart Finances, encerrando seu relacionamento conosco, mas é importante lembrar que podemos ter obrigações legais e/ou regulatórias para mantermos seus dados aqui.
          {'\n'}
        </Text>

        <Text>
          Para solicitar a exclusão definitiva da sua Conta Smart Finances, você deverá (i) acessar e logar no Site do Smart Finances, e na aba “Ajustes” clicar no botão “Exclusão de Cadastro e Dados Pessoais”; ou (ii) enviar um e-mail para contato@solucaodigital.tech solicitando a exclusão.
          {'\n'}
        </Text>

        <Text>
          Mediante a solicitação de exclusão da Conta Smart Finances pelo Usuário e comprovação da titularidade dos dados, nós vamos inativar seu cadastro e apagar seus dados pessoais e financeiros, de forma que seja realizada a anonimização de todos os dados coletados, isto é, não restarão informações no Smart Finances que possam (i) indicar sua identidade ou (ii) ser relacionadas/atribuíveis a você, exceto aqueles que não possam ser excluídos em cumprimento ao disposto na legislação brasileira (como, por exemplo, se você tiver adquirido algum produto financeiro conosco ou realizado alguma transferência).
          {'\n'}
        </Text>

        <Text>
          É importante que você saiba que a exclusão dos dados coletados, quando possível, é definitiva. Caso você queira voltar a usar o Smart Finances, você deverá criar uma nova conta conosco, podendo não ser possível utilizar o mesmo dado de e-mail previamente cadastrado.
          {'\n'}
        </Text>

        <Text>
          Lembre-se que a exclusão da sua conta Smart Finances não implica em cancelamento automático da assinatura do Smart Finances Premium, que deverá ser realizado diretamente na App Store e/ou no Google Play Store.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>11. Alterações</SubTitle>
        <Text>
          Ocasionalmente, nós podemos fazer alterações nos Termos de Uso e na Política de Privacidade com o objetivo de melhorar as funções ou recursos existentes ou acrescentar novas funções ou recursos ao Serviço, implementar avanços científicos e tecnológicos, e ajustes técnicos razoáveis do Serviço, assegurando a operacionalidade ou a segurança, bem como por motivos legais ou regulamentares.
          {'\n'}
        </Text>

        <Text>
          Quaisquer alterações entrarão em vigor assim que publicadas. O Usuário entende e concorda que, após a publicação, o uso das Plataformas do Smart Finances passará a ser submetido à versão atualizada dos Termos de Uso e da Política de Privacidade. Se você não concordar com as modificações, recomendamos que descontinue o uso do Smart Finances.
          {'\n'}
        </Text>

        <Text>
          O Smart Finances se reserva no direito de, a seu exclusivo critério, suspender, modificar ou encerrar as atividades do Site e/ou do Aplicativo, mediante comunicação prévia ao Usuário.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>12. Contato do Smart Finances Com os Usuários</SubTitle>
        <Text>
          Fica combinado aqui a possibilidade da gente conversar por diversos canais (ligação, e-mail, sms, WhatsApp, Messenger, etc), tanto sobre promoções e ofertas, quanto sobre mudanças nas funcionalidades do aplicativo/site. Caso você não queira mais ser contatado, sem problemas! Você pode solicitar, a qualquer momento, o descadastramento de seu e-mail: (i) clicando no link indicado no e-mail recebido, ou (ii) enviando uma solicitação para o e-mail contato@solucaodigital.tech.
          {'\n'}
        </Text>

        <Text>
          Fique tranquilo, o descadastramento do seu e-mail e/ou do seu número de telefone da base não afetará o seu uso do aplicativo ou site.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>13. Disposições Gerais</SubTitle>
        <Text>
          Caso qualquer disposição destes Termos de Uso ou da Política de Privacidade seja considerada ilegal, nula ou inexequível por qualquer razão, as disposições restantes não serão afetadas e manter-se-ão válidas e aplicáveis na máxima extensão possível.
          {'\n'}
        </Text>

        <Text>
          Qualquer falha do Smart Finances para impor ou exercer qualquer disposição destes Termos de Uso, da Política de Privacidade ou direitos conexos, não constitui uma renúncia a esse direito ou disposição.
          {'\n'}
        </Text>

        <SubTitle style={{ textTransform: 'uppercase' }}>14. Lei e Foro</SubTitle>
        <Text>
          Estes Termos de Uso e a Política de Privacidade serão interpretados de acordo com as leis do Brasil, sendo que quaisquer conflitos relacionados aos termos aqui dispostos deverão ser resolvidos pelo foro da cidade de Juiz de Fora, Minas Gerais.
          {'\n'}
        </Text>

        <SubTitle style={{ fontSize: 14 }}>Vigência: Estes Termos e Usos entram em vigor a partir de 22 de outubro de 2022.</SubTitle>
      </ContentScroll>
    </Container>
  );
}